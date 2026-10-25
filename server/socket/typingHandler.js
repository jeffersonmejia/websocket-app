function registerTypingHandlers(io, socket, { userService }) {
  socket.on('typing:start', () => {
    const user = userService.get(socket.id);
    if (user) socket.broadcast.emit('typing:update', { user, typing: true });
  });

  socket.on('typing:stop', () => {
    const user = userService.get(socket.id);
    if (user) socket.broadcast.emit('typing:update', { user, typing: false });
  });
}

module.exports = { registerTypingHandlers };
