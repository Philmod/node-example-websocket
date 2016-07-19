var io = require('socket.io')(3002);
var redis = require('socket.io-redis');

var adapter = redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});
var errFn = function(err) { console.error(err); }
adapter.pubClient.on('error', errFn);
adapter.subClient.on('error', errFn);

io.adapter(adapter);

io.on('connection', function(socket) {
  socket.on('chat message', function(msg) {
    io.emit('chat message', msg);
  });
});
