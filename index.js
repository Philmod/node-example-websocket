var os = require("os");
var morgan = require('morgan');
var app = require('express')();
var serverStatus = require('express-server-status');

app.use(morgan('dev'));
app.use('/status', serverStatus(app));

var server = require('http').createServer(app);
var io = require('socket.io')(server, {
  path: process.env.WEBSOCKET_PATH
});

var redis = require('socket.io-redis');

var adapter = redis({
  host: process.env.REDIS_MASTER_SERVICE_HOST || 'localhost',
  port: process.env.REDIS_MASTER_SERVICE_PORT || 6379
});
var errFn = function(err) { console.error(err); }
adapter.pubClient.on('error', errFn);
adapter.subClient.on('error', errFn);

io.adapter(adapter);

io.on('connection', function(socket) {
  console.log('Connection : ', new Date());
  socket.emit('hostname', os.hostname());

  socket.on('chat message', function(content) {
    console.log('Message in : ', content);
    io.emit('chat message', content);
  });
});

server.listen(3002);
