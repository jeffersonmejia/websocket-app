const contador = document.getElementById('contador');
const estado = document.getElementById('estado');
const socketId = document.getElementById('socketId');
const btnIncrementar = document.getElementById('btnIncrementar');

// Forzamos WebSocket para fines didácticos.
const socket = io({
  transports: ['websocket']
});

socket.on('connect', () => {
  estado.textContent = '🟢 Conectado';
  socketId.textContent = `Socket: ${socket.id}`;
});

socket.on('disconnect', () => {
  estado.textContent = '🔴 Desconectado';
});

socket.on('counter:update', ({ value }) => {
  contador.textContent = value;
});
const usuarios = document.getElementById('usuarios');

socket.on('users:update', ({ count }) => {
  usuarios.textContent = `Usuarios conectados: ${count};`
});
btnIncrementar.addEventListener('click', () => {
  if (!socket.connected) return;

  socket.emit('counter:increment');
});