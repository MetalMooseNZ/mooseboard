const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 0 }));

let hostId = null;
const users = {}; // { socketId: { username, canDraw } }
const history = [];
let theme = 'dark';

io.on('connection', (socket) => {
  console.log('user connected', socket.id);

  socket.on('join', ({ username, host }) => {
    if (host && !hostId) {
      hostId = socket.id;
    }
    // allow drawing for everyone by default
    users[socket.id] = { username, canDraw: true };
    socket.emit('history', history);
    socket.emit('theme', theme);
    io.emit('users', { hostId, users });
  });

  socket.on('draw', (data) => {
    if (users[socket.id] && users[socket.id].canDraw) {
      history.push(data);
      socket.broadcast.emit('draw', data);
    }
  });

  socket.on('toggle', ({ targetId, canDraw }) => {
    if (socket.id === hostId && users[targetId]) {
      users[targetId].canDraw = canDraw;
      io.emit('users', { hostId, users });
    }
  });

  socket.on('clear-board', () => {
    if (socket.id === hostId) {
      history.length = 0;
      io.emit('clear-board');
    }
  });

  socket.on('toggle-theme', (newTheme) => {
    theme = newTheme === 'light' ? 'light' : 'dark';
    io.emit('theme', theme);
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    if (socket.id === hostId) {
      hostId = null;
    }
    io.emit('users', { hostId, users });
  });
});

server.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
