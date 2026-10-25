const { registerUserHandlers } = require('./userHandler');
const { registerMessageHandlers } = require('./messageHandler');
const { registerTypingHandlers } = require('./typingHandler');

function registerConnectionHandlers(io, services) {
  io.on('connection', (socket) => {
    console.log(`[SOCKET] conexión ${socket.id}`);
    registerUserHandlers(io, socket, services);
    registerMessageHandlers(io, socket, services);
    registerTypingHandlers(io, socket, services);

    socket.on('disconnect', (reason) => {
      const user = services.userService.remove(socket.id);
      if (user) {
        socket.broadcast.emit('user:left', { user });
        io.emit('users:update', { users: services.userService.list() });
      }
      console.log(`[SOCKET] desconexión ${socket.id}: ${reason}`);
    });
  });
}

module.exports = { registerConnectionHandlers };
