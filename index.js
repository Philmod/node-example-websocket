var os = require("os");
var morgan = require('morgan');
var app = require('express')();
var serverStatus = require('express-server-status');

app.use(morgan('dev'));
app.use('/status', serverStatus(app));

var server = require('http').createServer(app);
var io = require('socket.io')(server, {
  path: process.env.WEBSOCKET_PATH || 'socket.io'
});

var redis = require('socket.io-redis');

var adapter = redis({
  host: process.env.REDIS_SERVICE_HOST || 'localhost',
  port: process.env.REDIS_SERVICE_PORT || 6379
});
var errFn = function(err) { console.error(err); }
adapter.pubClient.on('error', errFn);
adapter.subClient.on('error', errFn);

io.adapter(adapter);

io.on('connection', function(socket) {
  var addedUser = false;
  var hostname = os.hostname();
  console.log('Connection : ', new Date());
  socket.emit('hostname', hostname);

  socket.on('new_message', function(message) {
    console.log('Message in : ', message);
    io.emit('new_message', {
      username: socket.username,
      message: message,
    });
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
