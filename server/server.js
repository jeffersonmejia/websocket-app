const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { UserService } = require('./services/userService');
const { MessageService } = require('./services/messageService');
const { registerConnectionHandlers } = require('./socket/connectionHandler');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN || '*' },
  pingInterval: 25000,
  pingTimeout: 20000
});

const PORT = Number(process.env.PORT) || 3000;
const userService = new UserService();
const messageService = new MessageService();

app.use(express.static(path.join(__dirname, '../public')));
registerConnectionHandlers(io, { userService, messageService });

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});

function shutdown() {
  io.close(() => httpServer.close(() => process.exit(0)));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
