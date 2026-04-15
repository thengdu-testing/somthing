(() => {
const imagePool = [
  'images/1.jpg',
  'images/2.jpg',
  'images/3.jpg',
  'images/663835532_26600859356213507_8698796688762840301_n.jpg',
  'images/664585787_1479707357226909_1906691122830428980_n.jpg',
  'images/664751073_1545705653645042_7316583021994911116_n.jpg',
  'images/665222683_2155632265259664_699956261836097665_n.jpg',
  'images/665647214_965066595935322_8223952792517368431_n.jpg',
  'images/666109926_934215519218655_4025595168742919079_n.jpg',
  'images/668110996_1265480601866281_7984651281331054546_n.jpg',
  'images/669361847_2019091105311591_6979237146762778459_n.jpg',
  'images/670315158_950370107366060_616113743160085956_n.jpg'
];

const cuteMessages = [
  'You are my favorite notification.',
  'Plot twist: today is still your day.',
  'Your smile just unlocked bonus hearts.',
  'Certified cuteness overload detected.',
  'Dragging papers, stealing hearts.',
  'This page likes you a lot.'
];

const cuteStickers = ['💖', '✨', '🌸', '🫶', '💘', '🐰'];

const papers = Array.from(document.querySelectorAll('.paper'));
const imageEls = Array.from(document.querySelectorAll('.paper.image img'));
const imagePapers = Array.from(document.querySelectorAll('.paper.image'));
const toolbar = document.querySelector('.cute-toolbar');
const moodText = document.getElementById('moodText');
const toast = document.getElementById('cuteToast');

let imageCursor = 0;
let loveMeter = 0;
let raining = false;
let rainInterval = null;
let toastTimer = null;

function notifyPaperAdded(paper) {
  document.dispatchEvent(new CustomEvent('paper:added', { detail: { paper } }));
}

function createExtraPaper(imageSrc, index) {
  const paper = document.createElement('div');
  paper.className = 'paper image';

  const caption = document.createElement('p');
  caption.textContent = ['Cute moment ✨', 'My favorite smile 💫', 'A sweet memory 💖'][index % 3];

  const img = document.createElement('img');
  img.src = imageSrc;
  img.alt = 'Cute memory photo';

  paper.appendChild(caption);
  paper.appendChild(img);

  paper.style.left = `${10 + (index % 4) * 20}%`;
  paper.style.top = `${20 + (index % 3) * 18}%`;
  paper.style.zIndex = String(25 + index);

  document.body.appendChild(paper);
  notifyPaperAdded(paper);
}

function ensureAllPhotosVisible() {
  if (imagePapers.length >= imagePool.length) {
    return;
  }

  for (let i = imagePapers.length; i < imagePool.length; i += 1) {
    createExtraPaper(imagePool[i], i);
  }

  showToast('Added all photos to your cute stack.');
}

function updateLoveMeter(amount) {
  loveMeter += amount;
  moodText.textContent = `Love meter: ${loveMeter}`;
}

function showToast(message, duration = 2600) {
  if (!toast) {
    return;
  }
  toast.textContent = message;
  toast.classList.add('show');
  if (toastTimer) {
    window.clearTimeout(toastTimer);
  }
  toastTimer = window.setTimeout(() => {
    toast.classList.remove('show');
    toastTimer = null;
  }, duration);
}

function rotatePhotos(step = 1) {
  if (!imageEls.length || !imagePool.length) {
    return;
  }

  imageCursor = (imageCursor + step + imagePool.length) % imagePool.length;

  imageEls.forEach((img, idx) => {
    img.src = imagePool[(imageCursor + idx) % imagePool.length];
  });

  updateLoveMeter(3);
  showToast('New photo combo unlocked!');
}

function shufflePapers() {
  const maxX = Math.max(window.innerWidth * 0.28, 120);
  const maxY = Math.max(window.innerHeight * 0.24, 90);

  papers.forEach((paper, idx) => {
    const shiftX = Math.round((Math.random() - 0.5) * maxX);
    const shiftY = Math.round((Math.random() - 0.5) * maxY);
    const rotate = Math.round(Math.random() * 32 - 16);
    const isHeart = paper.classList.contains('heart');
    const scale = isHeart ? 1 : 1 + Math.random() * 0.05;

    paper.style.zIndex = String(10 + idx);
    paper.style.transform = `translateX(${shiftX}px) translateY(${shiftY}px) rotateZ(${rotate}deg) scale(${scale.toFixed(2)})`;
  });

  updateLoveMeter(5);
  showToast('Shuffled into adorable chaos.');
}

function spawnHeartDrop() {
  const heart = document.createElement('span');
  heart.className = 'heart-drop';
  heart.textContent = ['💗', '💖', '💘', '💕'][Math.floor(Math.random() * 4)];
  heart.style.left = `${Math.random() * window.innerWidth}px`;
  heart.style.fontSize = `${14 + Math.random() * 16}px`;
  heart.style.animationDuration = `${2.2 + Math.random() * 1.7}s`;
  document.body.appendChild(heart);

  window.setTimeout(() => heart.remove(), 4200);
}

function startHeartRain() {
  if (raining) {
    return;
  }
  raining = true;
  rainInterval = window.setInterval(spawnHeartDrop, 130);
  showToast('Heart rain started!');
}

function stopHeartRain() {
  raining = false;
  if (rainInterval) {
    window.clearInterval(rainInterval);
    rainInterval = null;
  }
  showToast('Heart rain paused.');
}

function toggleHeartRain() {
  if (raining) {
    stopHeartRain();
  } else {
    startHeartRain();
    window.setTimeout(() => {
      if (raining) {
        stopHeartRain();
      }
    }, 3500);
  }

  updateLoveMeter(2);
}

function spawnSticker(x, y) {
  const sticker = document.createElement('span');
  sticker.className = 'tap-sticker';
  sticker.textContent = cuteStickers[Math.floor(Math.random() * cuteStickers.length)];
  sticker.style.left = `${x}px`;
  sticker.style.top = `${y}px`;
  sticker.style.fontSize = `${16 + Math.random() * 18}px`;
  document.body.appendChild(sticker);

  window.setTimeout(() => sticker.remove(), 720);
}

function handleTapSticker(evt) {
  const target = evt.target;
  if (toolbar && toolbar.contains(target)) {
    return;
  }

  const x = evt.clientX || (evt.touches && evt.touches[0] && evt.touches[0].clientX);
  const y = evt.clientY || (evt.touches && evt.touches[0] && evt.touches[0].clientY);

  if (typeof x !== 'number' || typeof y !== 'number') {
    return;
  }

  spawnSticker(x, y);
  updateLoveMeter(1);
}

function randomMessage() {
  const text = cuteMessages[Math.floor(Math.random() * cuteMessages.length)];
  showToast(text, 4200);
  updateLoveMeter(4);
}

function openShufflePage() {
  window.location.assign('./shuffle/');
}

function openValentinePage() {
  window.location.assign('/valentine');
}

if (toolbar) {
  toolbar.addEventListener('click', (evt) => {
    const button = evt.target.closest('[data-action]');
    if (!button) {
      return;
    }

    const action = button.getAttribute('data-action');
    if (action === 'shuffle') {
      openShufflePage();
    }
    if (action === 'valentine') {
      openValentinePage();
    }
    if (action === 'message') {
      randomMessage();
    }
    if (action === 'heart-rain') {
      toggleHeartRain();
    }
  });
}

document.addEventListener('click', handleTapSticker);
document.addEventListener('touchstart', handleTapSticker, { passive: true });

window.setTimeout(() => {
  showToast('Tap anywhere for stickers ✨');
}, 500);

ensureAllPhotosVisible();
})();
