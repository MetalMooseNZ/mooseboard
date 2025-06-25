const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

let hostId = null;
const users = {}; // { socketId: { username, canDraw } }
const history = [];

io.on('connection', (socket) => {
  console.log('user connected', socket.id);

  socket.on('join', ({ username, host }) => {
    if (host && !hostId) {
      hostId = socket.id;
    }
    users[socket.id] = { username, canDraw: host || false };
    socket.emit('history', history);
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

  socket.on('disconnect', () => {
    delete users[socket.id];
    if (socket.id === hostId) {
      hostId = null;
      // reset canDraw for all
      for (const id in users) {
        users[id].canDraw = false;
      }
    }
    io.emit('users', { hostId, users });
  });
});

server.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
