# node-example-websocket

Example taken from Socket.IO [chat-example](https://github.com/rauchg/chat-example) repository.

This is the Websocket server that serves all the messages.

Redis is used to link all the websocket servers together, so a message can be broadcast to all users.
`REDIS_HOST` and `REDIS_PORT` environment variables define where live the Redis server.


