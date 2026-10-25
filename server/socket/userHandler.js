function registerUserHandlers(io, socket, { userService, messageService }) {
  socket.on('user:join', (payload = {}, acknowledge = () => {}) => {
    const existingUser = userService.get(socket.id);
    if (existingUser) return acknowledge({ ok: true, user: existingUser, users: userService.list(), messages: messageService.list() });

    const result = userService.add(socket.id, payload.name);
    if (result.error) return acknowledge({ ok: false, error: result.error });

    const { user } = result;
    socket.data.user = user;
    socket.broadcast.emit('user:joined', { user });
    io.emit('users:update', { users: userService.list() });
    acknowledge({ ok: true, user, users: userService.list(), messages: messageService.list() });
  });
}

module.exports = { registerUserHandlers };
