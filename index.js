var os = require("os");
var morgan = require('morgan');
var app = require('express')();
var serverStatus = require('express-server-status');

app.use(morgan('dev');
app.use('/status', serverStatus(app));

var server = require('http').createServer(app);
var io = require('socket.io')(server);

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
  console.log('Connection : ', new Date());
  socket.on('chat message', function(content) {
    console.log('Message in : ', content);
    io.emit('chat message', {
      hostname: os.hostname(),
      content: content
    });
  });
});

server.listen(3002);
