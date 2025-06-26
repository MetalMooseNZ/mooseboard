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
const addImageBtn = document.getElementById('addImage');

const images = new Map();
let activeImage = null;
let dragOffset = { x: 0, y: 0 };

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

function createImageElement(obj) {
  const g = document.createElementNS(drawingNS, 'g');
  g.classList.add('image-group');
  g.dataset.id = obj.id;

  const img = document.createElementNS(drawingNS, 'image');
  img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', obj.dataUrl);
  img.setAttribute('x', obj.x);
  img.setAttribute('y', obj.y);
  img.setAttribute('width', obj.width);
  img.setAttribute('height', obj.height);

  const rect = document.createElementNS(drawingNS, 'rect');
  rect.setAttribute('x', obj.x);
  rect.setAttribute('y', obj.y);
  rect.setAttribute('width', obj.width);
  rect.setAttribute('height', obj.height);
  rect.setAttribute('fill', 'none');
  rect.setAttribute('stroke', obj.color);
  rect.setAttribute('stroke-width', 2);

  g.appendChild(img);
  g.appendChild(rect);
  board.appendChild(g);

  g.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      activeImage = g;
      const pos = getPos(e);
      dragOffset = { x: pos.x - obj.x, y: pos.y - obj.y };
      e.stopPropagation();
    }
  });

  g.addEventListener('wheel', (e) => {
    if (activeImage === g) {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      obj.width *= factor;
      obj.height *= factor;
      img.setAttribute('width', obj.width);
      img.setAttribute('height', obj.height);
      rect.setAttribute('width', obj.width);
      rect.setAttribute('height', obj.height);
      socket.emit('update-image', obj);
    }
  });

  images.set(obj.id, { g, img, rect, obj });
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
  if (e.target.closest('.image-group')) {
    return;
  }
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
  if (activeImage && e.button === 0) {
    activeImage = null;
  } else if (e.button === 0) {
    drawing = false;
  } else if (e.button === 1) {
    panning = false;
  }
});

board.addEventListener('mouseleave', () => { drawing = false; panning = false; activeImage = null; });

board.addEventListener('mousemove', (e) => {
  if (activeImage) {
    const pos = getPos(e);
    const { img, rect, obj } = images.get(activeImage.dataset.id);
    obj.x = pos.x - dragOffset.x;
    obj.y = pos.y - dragOffset.y;
    img.setAttribute('x', obj.x);
    img.setAttribute('y', obj.y);
    rect.setAttribute('x', obj.x);
    rect.setAttribute('y', obj.y);
    socket.emit('update-image', obj);
    return;
  }
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
  if (activeImage) return;
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

addImageBtn.addEventListener('click', async () => {
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const type = item.types.find(t => t.startsWith('image/'));
      if (type) {
        const blob = await item.getType(type);
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
          const obj = {
            id,
            x: BOARD_WIDTH / 2 - 75,
            y: BOARD_HEIGHT / 2 - 75,
            width: 150,
            height: 150,
            dataUrl,
            color: myColor
          };
          createImageElement(obj);
          socket.emit('add-image', obj);
        };
        reader.readAsDataURL(blob);
        break;
      }
    }
  } catch (err) {
    console.error('Paste failed', err);
  }
  contextMenu.classList.add('hidden');
});

clearBoardBtn.addEventListener('click', () => {
  if (confirm('Clear board for everyone?')) {
    socket.emit('clear-board');
  }
  contextMenu.classList.add('hidden');
});

socket.on('init', ({ color, history }) => {
  myColor = color;
  history.forEach((item) => {
    if (item.type === 'line') {
      drawLine(item.x0, item.y0, item.x1, item.y1, item.color);
    } else if (item.type === 'image') {
      createImageElement(item);
    }
  });
});

socket.on('draw', (d) => {
  drawLine(d.x0, d.y0, d.x1, d.y1, d.color);
});

socket.on('add-image', (d) => {
  createImageElement(d);
});

socket.on('update-image', (d) => {
  const entry = images.get(d.id);
  if (entry) {
    entry.obj.x = d.x;
    entry.obj.y = d.y;
    entry.obj.width = d.width;
    entry.obj.height = d.height;
    entry.img.setAttribute('x', d.x);
    entry.img.setAttribute('y', d.y);
    entry.img.setAttribute('width', d.width);
    entry.img.setAttribute('height', d.height);
    entry.rect.setAttribute('x', d.x);
    entry.rect.setAttribute('y', d.y);
    entry.rect.setAttribute('width', d.width);
    entry.rect.setAttribute('height', d.height);
  }
});
socket.on('clear-board', () => {
  board.replaceChildren();
  images.clear();
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
