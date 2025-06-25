const socket = io();
let username = '';
while (!username) {
  username = prompt('Enter username');
}
const isHost = confirm('Host a session? OK = Host, Cancel = Join');

socket.emit('join', { username, host: isHost });

const usersDiv = document.getElementById('users');
const board = document.getElementById('board');
const drawingNS = 'http://www.w3.org/2000/svg';
const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 600;
board.setAttribute('viewBox', `0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`);
let drawing = false;
let canDraw = isHost;
let scale = 1;
let prev = {x:0,y:0};

function drawLine(x0, y0, x1, y1, emit) {
  const line = document.createElementNS(drawingNS, 'line');
  line.setAttribute('x1', x0);
  line.setAttribute('y1', y0);
  line.setAttribute('x2', x1);
  line.setAttribute('y2', y1);
  board.appendChild(line);
  if (emit) {
    socket.emit('draw', { x0, y0, x1, y1 });
  }
}

board.addEventListener('mousedown', (e) => {
  if (!canDraw) return;
  drawing = true;
  prev = getPos(e);
});

board.addEventListener('mouseup', () => { drawing = false; });
board.addEventListener('mouseleave', () => { drawing = false; });
board.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  const pos = getPos(e);
  drawLine(prev.x, prev.y, pos.x, pos.y, true);
  prev = pos;
});

function getPos(e) {
  const rect = board.getBoundingClientRect();
  const aspect = BOARD_WIDTH / BOARD_HEIGHT;
  const rectAspect = rect.width / rect.height;
  let offsetX = 0;
  let offsetY = 0;
  let drawWidth = rect.width;
  let drawHeight = rect.height;

  if (rectAspect > aspect) {
    drawHeight = rect.height;
    drawWidth = rect.height * aspect;
    offsetX = (rect.width - drawWidth) / 2;
  } else if (rectAspect < aspect) {
    drawWidth = rect.width;
    drawHeight = rect.width / aspect;
    offsetY = (rect.height - drawHeight) / 2;
  }

  return {
    x: (e.clientX - rect.left - offsetX) * (BOARD_WIDTH / drawWidth),
    y: (e.clientY - rect.top - offsetY) * (BOARD_HEIGHT / drawHeight)
  };
}

socket.on('draw', (d) => {
  drawLine(d.x0, d.y0, d.x1, d.y1, false);
});

socket.on('history', (hist) => {
  hist.forEach((d) => drawLine(d.x0, d.y0, d.x1, d.y1, false));
});

socket.on('users', ({ hostId, users }) => {
  currentHostId = hostId;
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
  clearBoardBtn.classList.remove('hidden');
  if (socket.id === hostId) {
    clearBoardBtn.classList.remove('disabled');
  } else {
    clearBoardBtn.classList.add('disabled');
  }
});

const contextMenu = document.getElementById('contextMenu');
const toggleTheme = document.getElementById('toggleTheme');
const clearBoardBtn = document.getElementById('clearBoard');
let currentHostId = null;

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

clearBoardBtn.addEventListener('click', () => {
  if (socket.id === currentHostId) {
    socket.emit('clear-board');
  }
  contextMenu.classList.add('hidden');
});

socket.on('clear-board', () => {
  board.innerHTML = '';
});

board.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY < 0 ? 0.1 : -0.1;
  scale = Math.min(1.8, Math.max(1, scale + delta));
  board.style.transform = `scale(${scale})`;
});
