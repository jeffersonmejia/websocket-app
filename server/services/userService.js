class UserService {
  constructor() {
    this.users = new Map();
  }

  add(socketId, rawName) {
    const name = String(rawName || '').trim().replace(/\s+/g, ' ').slice(0, 24);
    if (!name) return { error: 'Escribe un nombre para ingresar.' };
    const user = { id: socketId, name, connectedAt: Date.now() };
    this.users.set(socketId, user);
    return { user };
  }

  remove(socketId) {
    const user = this.users.get(socketId);
    this.users.delete(socketId);
    return user;
  }

  get(socketId) {
    return this.users.get(socketId);
  }

  list() {
    return Array.from(this.users.values()).map(({ id, name }) => ({ id, name }));
  }
}

module.exports = { UserService };
