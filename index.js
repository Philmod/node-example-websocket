var os = require('os');
var morgan = require('morgan');
var app = require('express')();
var serverStatus = require('express-server-status');

app.use(morgan('dev'));
app.use('/status', serverStatus(app));

var server = require('http').createServer(app);
var io = require('socket.io')(server, {
  path: process.env.WEBSOCKET_PATH || '/socket.io'
});

// Redis.
var redisOptions = {
  host: process.env.REDIS_SERVICE_HOST || process.env.REDIS_PORT_6379_TCP_ADDR || 'localhost',
  port: process.env.REDIS_SERVICE_PORT || 6379
};
var redis = require('redis');
var client = redis.createClient(redisOptions);
var errFn = function(err) {
  console.log('Redis error ' + err);
  console.log('Exiting...')
  process.exit();
}
client.on('error', errFn);

// Redis Adapter.
var adapter = require('socket.io-redis')(redisOptions);
adapter.pubClient.on('error', errFn);
adapter.subClient.on('error', errFn);
io.adapter(adapter);

// Messages storage.
var messagesListMax = process.env.MESSAGES_LIST_MAX || 10;
var messagesListName = process.env.MESSAGES_LIST_NAME || 'node-example-messages';

// Websockets.
io.on('connection', function(socket) {
  var addedUser = false;
  var hostname = os.hostname();
  console.log('Connection : ', new Date());
  socket.emit('hostname', hostname);

  socket.on('login', function() {
    client.lrange(messagesListName, 0, -1, function(err, messages) {
      if (err) console.error(err);
      else {
        messages.forEach(function(message) {
          var m = JSON.parse(message);
          if (m.username && m.message) {
              socket.emit('new_message', m);
          }
        });
      }
    });
  })

  socket.on('new_message', function(message) {
    var fullMessage = {
      username: socket.username,
      message: message,
    };
    io.emit('new_message', fullMessage);
    client.rpush(messagesListName, JSON.stringify(fullMessage));
    client.ltrim(messagesListName, -messagesListMax, -1)
  });

  socket.on('add_user', function(username) {
    if (addedUser) return;
    socket.username = username;
    addedUser = true;
    io.emit('user_joined', {
      username: socket.username,
      hostname: hostname,
    });
  });

  socket.on('disconnect', function() {
    if (!addedUser) return;
    io.emit('user_left', {
      username: socket.username
    });
  });
});

server.listen(3002);
console.log('socket.io server listening on *:3002, running on node %s', process.version);
