const { randomUUID } = require('crypto');

const MAX_MESSAGES = 100;
const MAX_MESSAGE_LENGTH = 2000;

class MessageService {
  constructor() {
    this.messages = [];
  }

  list() {
    return this.messages.map((message) => this.publicMessage(message));
  }

  create(user, rawContent) {
    const content = String(rawContent || '').trim();
    if (!content) return { error: 'El mensaje no puede estar vacío.' };
    if (content.length > MAX_MESSAGE_LENGTH) {
      return { error: `El mensaje no puede superar ${MAX_MESSAGE_LENGTH} caracteres.` };
    }

    const message = {
      id: randomUUID(),
      authorId: user.id,
      author: user.name,
      content,
      createdAt: new Date().toISOString(),
      edited: false,
      reactions: {},
      readBy: []
    };
    this.messages.push(message);
    if (this.messages.length > MAX_MESSAGES) this.messages.shift();
    return { message: this.publicMessage(message) };
  }

  edit(userId, messageId, rawContent) {
    const message = this.find(messageId);
    if (!message) return { error: 'El mensaje ya no existe.' };
    if (message.authorId !== userId) return { error: 'Solo el autor puede editar este mensaje.' };
    const content = String(rawContent || '').trim();
    if (!content) return { error: 'El mensaje no puede quedar vacío.' };
    if (content.length > MAX_MESSAGE_LENGTH) {
      return { error: `El mensaje no puede superar ${MAX_MESSAGE_LENGTH} caracteres.` };
    }
    message.content = content;
    message.edited = true;
    return { message: this.publicMessage(message) };
  }

  delete(userId, messageId) {
    const index = this.messages.findIndex((message) => message.id === messageId);
    if (index < 0) return { error: 'El mensaje ya no existe.' };
    if (this.messages[index].authorId !== userId) {
      return { error: 'Solo el autor puede eliminar este mensaje.' };
    }
    this.messages.splice(index, 1);
    return { messageId };
  }

  toggleReaction(user, messageId, emoji) {
    const allowed = ['👍', '❤️', '😂', '🎉', '😮'];
    if (!allowed.includes(emoji)) return { error: 'Reacción no permitida.' };
    const message = this.find(messageId);
    if (!message) return { error: 'El mensaje ya no existe.' };
    const reactors = new Set(message.reactions[emoji] || []);
    if (reactors.has(user.id)) reactors.delete(user.id);
    else reactors.add(user.id);
    if (reactors.size) message.reactions[emoji] = Array.from(reactors);
    else delete message.reactions[emoji];
    return { message: this.publicMessage(message) };
  }

  markRead(user, messageId) {
    const message = this.find(messageId);
    if (!message || message.authorId === user.id) return null;
    if (!message.readBy.some((reader) => reader.id === user.id)) {
      message.readBy.push({ id: user.id, name: user.name });
    }
    return this.publicMessage(message);
  }

  find(messageId) {
    return this.messages.find((message) => message.id === messageId);
  }

  publicMessage(message) {
    return {
      ...message,
      reactions: Object.fromEntries(
        Object.entries(message.reactions).map(([emoji, userIds]) => [emoji, userIds.length])
      ),
      reactedByMe: Object.fromEntries(
        Object.entries(message.reactions).map(([emoji, userIds]) => [emoji, userIds.includes(message.authorId)])
      )
    };
  }
}

module.exports = { MessageService };
