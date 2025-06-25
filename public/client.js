const socket = io();
let username = '';
while (!username) {
  username = prompt('Enter username');
}
const isHost = confirm('Host a session? OK = Host, Cancel = Join');

socket.emit('join', { username, host: isHost });

const usersDiv = document.getElementById('users');
const board = document.getElementById('board');
const ctx = board.getContext('2d');
let drawing = false;
let canDraw = isHost;
let scale = 1;
let prev = {x:0,y:0};

function drawLine(x0, y0, x1, y1, emit) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.closePath();
  if (!emit) return;
  socket.emit('draw', { x0, y0, x1, y1 });
}

board.addEventListener('mousedown', (e) => {
  if (!canDraw) return;
  drawing = true;
  prev = getPos(e);
});

board.addEventListener('mouseup', () => { drawing = false; });
board.addEventListener('mouseout', () => { drawing = false; });
board.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  const pos = getPos(e);
  drawLine(prev.x, prev.y, pos.x, pos.y, true);
  prev = pos;
});

function getPos(e) {
  const rect = board.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) / scale,
    y: (e.clientY - rect.top) / scale
  };
}

socket.on('draw', (d) => {
  drawLine(d.x0, d.y0, d.x1, d.y1, false);
});

socket.on('history', (hist) => {
  hist.forEach((d) => drawLine(d.x0, d.y0, d.x1, d.y1, false));
});

socket.on('users', ({ hostId, users }) => {
  usersDiv.innerHTML = '';
  Object.entries(users).forEach(([id, u]) => {
    const div = document.createElement('div');
    div.className = 'user';
    const label = document.createElement('label');
    label.textContent = u.username;
    if (id === socket.id) {
      canDraw = u.canDraw;
    }
    if (socket.id === hostId && id !== hostId) {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = u.canDraw;
      checkbox.addEventListener('change', () => {
        socket.emit('toggle', { targetId: id, canDraw: checkbox.checked });
      });
      div.appendChild(checkbox);
    } else {
      const indicator = document.createElement('span');
      indicator.textContent = u.canDraw ? '🖊️' : '🚫';
      div.appendChild(indicator);
    }
    div.appendChild(label);
    usersDiv.appendChild(div);
  });
});

const contextMenu = document.getElementById('contextMenu');
const toggleTheme = document.getElementById('toggleTheme');

board.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  contextMenu.style.left = `${e.pageX}px`;
  contextMenu.style.top = `${e.pageY}px`;
  contextMenu.classList.remove('hidden');
});

document.addEventListener('click', () => {
  contextMenu.classList.add('hidden');
});

toggleTheme.addEventListener('click', () => {
  document.body.classList.toggle('light');
  contextMenu.classList.add('hidden');
});

board.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY < 0 ? 0.1 : -0.1;
  scale = Math.min(1.8, Math.max(1, scale + delta));
  board.style.transform = `scale(${scale})`;
});
