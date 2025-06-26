const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const users = {}; // socketId -> { username, color }
const history = [];

function randomColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 50%)`;
}

io.on('connection', (socket) => {
  socket.on('join', ({ username }) => {
    const color = randomColor();
    users[socket.id] = { username, color };
    socket.emit('init', { color, history });
    io.emit('users', Object.values(users));
  });

  socket.on('draw', (data) => {
    const user = users[socket.id];
    if (!user) return;
    const line = { type: 'line', ...data, color: user.color };
    history.push(line);
    socket.broadcast.emit('draw', line);
  });

  socket.on('add-image', (obj) => {
    const user = users[socket.id];
    if (!user) return;
    const img = { type: 'image', ...obj, color: user.color };
    history.push(img);
    socket.broadcast.emit('add-image', img);
  });

  socket.on('update-image', (obj) => {
    if (!users[socket.id]) return;
    const item = history.find((h) => h.type === 'image' && h.id === obj.id);
    if (item) {
      item.x = obj.x;
      item.y = obj.y;
      item.width = obj.width;
      item.height = obj.height;
    }
    socket.broadcast.emit('update-image', obj);
  });

  socket.on('clear-board', () => {
    if (!users[socket.id]) return;
    history.length = 0;
    io.emit('clear-board');
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('users', Object.values(users));
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
