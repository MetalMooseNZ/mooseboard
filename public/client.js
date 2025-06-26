const socket = io();
let username = '';
while (!username) {
  username = prompt('Enter username');
}
socket.emit('join', { username });

const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 600;
const drawingNS = 'http://www.w3.org/2000/svg';
const board = document.getElementById('board');
board.setAttribute('viewBox', `0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`);
const userList = document.getElementById('userList');
const contextMenu = document.getElementById('contextMenu');
const clearBoardBtn = document.getElementById('clearBoard');

let myColor = '#fff';
let drawing = false;
let panning = false;
let scale = 1;
let panX = 0;
let panY = 0;
let prev = {x:0,y:0};
let panStart = {x:0,y:0};
const maxZoom = 1.4;

function updateTransform() {
  board.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
}

function drawLine(x0, y0, x1, y1, color) {
  const line = document.createElementNS(drawingNS, 'line');
  line.setAttribute('x1', x0);
  line.setAttribute('y1', y0);
  line.setAttribute('x2', x1);
  line.setAttribute('y2', y1);
  line.setAttribute('stroke', color);
  board.appendChild(line);
}

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

board.addEventListener('mousedown', (e) => {
  if (e.button === 0) {
    drawing = true;
    prev = getPos(e);
  } else if (e.button === 1) {
    panning = true;
    panStart = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }
});

board.addEventListener('mouseup', (e) => {
  if (e.button === 0) {
    drawing = false;
  } else if (e.button === 1) {
    panning = false;
  }
});

board.addEventListener('mouseleave', () => { drawing = false; panning = false; });

board.addEventListener('mousemove', (e) => {
  if (drawing) {
    const pos = getPos(e);
    socket.emit('draw', { x0: prev.x, y0: prev.y, x1: pos.x, y1: pos.y });
    drawLine(prev.x, prev.y, pos.x, pos.y, myColor);
    prev = pos;
  } else if (panning) {
    panX += e.clientX - panStart.x;
    panY += e.clientY - panStart.y;
    panStart = { x: e.clientX, y: e.clientY };
    updateTransform();
  }
});

board.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = board.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;
  board.style.transformOrigin = `${offsetX}px ${offsetY}px`;
  const delta = e.deltaY < 0 ? 0.1 : -0.1;
  scale = Math.min(maxZoom, Math.max(1, scale + delta));
  updateTransform();
});

board.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  contextMenu.style.left = `${e.pageX}px`;
  contextMenu.style.top = `${e.pageY}px`;
  contextMenu.classList.remove('hidden');
});

document.addEventListener('click', () => {
  contextMenu.classList.add('hidden');
});

clearBoardBtn.addEventListener('click', () => {
  socket.emit('clear-board');
  contextMenu.classList.add('hidden');
});

socket.on('init', ({ color, history }) => {
  myColor = color;
  history.forEach((l) => drawLine(l.x0, l.y0, l.x1, l.y1, l.color));
});

socket.on('draw', (d) => {
  drawLine(d.x0, d.y0, d.x1, d.y1, d.color);
});

socket.on('clear-board', () => {
  board.replaceChildren();
});

socket.on('users', (list) => {
  userList.innerHTML = '';
  list.forEach((u) => {
    const div = document.createElement('div');
    div.textContent = u.username;
    div.style.color = u.color;
    userList.appendChild(div);
  });
});
