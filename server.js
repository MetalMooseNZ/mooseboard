const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 0 }));

const users = {}; // { socketId: { username, canDraw, isAdmin } }
const history = [];
let theme = 'dark';

io.on('connection', (socket) => {
  console.log('user connected', socket.id);

  socket.on('join', ({ username }) => {
    const isAdmin = username.startsWith('!');
    const cleanName = isAdmin ? username.slice(1) : username;
    // allow drawing for everyone by default
    users[socket.id] = { username: cleanName, canDraw: true, isAdmin };
    socket.emit('history', history);
    socket.emit('theme', theme);
    io.emit('users', { users });
  });

  socket.on('draw', (data) => {
    if (users[socket.id] && users[socket.id].canDraw) {
      history.push(data);
      socket.broadcast.emit('draw', data);
    }
  });


  socket.on('clear-board', () => {
    if (users[socket.id] && users[socket.id].isAdmin) {
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
    io.emit('users', { users });
  });
});

server.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
