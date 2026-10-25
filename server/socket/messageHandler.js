function registerMessageHandlers(io, socket, { userService, messageService }) {
  const requireUser = (acknowledge) => {
    const user = userService.get(socket.id);
    if (user) return user;
    acknowledge({ ok: false, error: 'Primero debes ingresar al chat.' });
    return null;
  };

  socket.on('message:send', (payload = {}, acknowledge = () => {}) => {
    const user = requireUser(acknowledge);
    if (!user) return;
    const result = messageService.create(user, payload.content);
    if (result.error) return acknowledge({ ok: false, error: result.error });
    io.emit('message:new', { message: result.message });
    acknowledge({ ok: true, message: result.message });
  });

  socket.on('message:edit', (payload = {}, acknowledge = () => {}) => {
    const user = requireUser(acknowledge);
    if (!user) return;
    const result = messageService.edit(user.id, payload.messageId, payload.content);
    if (result.error) return acknowledge({ ok: false, error: result.error });
    io.emit('message:updated', { message: result.message });
    acknowledge({ ok: true });
  });

  socket.on('message:delete', (payload = {}, acknowledge = () => {}) => {
    const user = requireUser(acknowledge);
    if (!user) return;
    const result = messageService.delete(user.id, payload.messageId);
    if (result.error) return acknowledge({ ok: false, error: result.error });
    io.emit('message:deleted', { messageId: result.messageId });
    acknowledge({ ok: true });
  });

  socket.on('reaction:toggle', (payload = {}, acknowledge = () => {}) => {
    const user = requireUser(acknowledge);
    if (!user) return;
    const result = messageService.toggleReaction(user, payload.messageId, payload.emoji);
    if (result.error) return acknowledge({ ok: false, error: result.error });
    io.emit('reaction:update', { message: result.message });
    acknowledge({ ok: true });
  });

  socket.on('message:read', (payload = {}) => {
    const user = userService.get(socket.id);
    if (!user) return;
    const message = messageService.markRead(user, payload.messageId);
    if (message) io.to(message.authorId).emit('message:read:update', { messageId: message.id, readBy: message.readBy });
  });
}

module.exports = { registerMessageHandlers };
