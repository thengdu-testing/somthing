const imagePool = [
  '../images/1.jpg',
  '../images/2.jpg',
  '../images/3.jpg',
  '../images/663835532_26600859356213507_8698796688762840301_n.jpg',
  '../images/664585787_1479707357226909_1906691122830428980_n.jpg',
  '../images/664751073_1545705653645042_7316583021994911116_n.jpg',
  '../images/665222683_2155632265259664_699956261836097665_n.jpg',
  '../images/665647214_965066595935322_8223952792517368431_n.jpg',
  '../images/666109926_934215519218655_4025595168742919079_n.jpg',
  '../images/668110996_1265480601866281_7984651281331054546_n.jpg',
  '../images/669361847_2019091105311591_6979237146762778459_n.jpg',
  '../images/670315158_950370107366060_616113743160085956_n.jpg'
];

const track = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');
const counterText = document.getElementById('counterText');
const shell = document.getElementById('carouselShell');
const thumbs = document.getElementById('thumbs');
const playBtn = document.getElementById('playBtn');
const fitBtn = document.getElementById('fitBtn');
const sparkBtn = document.getElementById('sparkBtn');
const randomBtn = document.getElementById('randomBtn');
const miniToast = document.getElementById('miniToast');

let current = 0;
let startX = 0;
let deltaX = 0;
let dragging = false;
let fitMode = 'contain';
let autoPlay = false;
let autoTimer = null;
let toastTimer = null;

const stickers = ['💖', '✨', '🌸', '🫶', '💘', '🐰', '⭐'];

function showToast(text, duration = 1900) {
  if (!miniToast) {
    return;
  }
  miniToast.textContent = text;
  miniToast.classList.add('show');
  if (toastTimer) {
    window.clearTimeout(toastTimer);
  }
  toastTimer = window.setTimeout(() => {
    miniToast.classList.remove('show');
    toastTimer = null;
  }, duration);
}

function renderSlides() {
  const markup = imagePool
    .map((src, index) => `
      <article class="slide" data-index="${index}">
        <div class="slide-frame">
          <img src="${src}" alt="Memory ${index + 1}">
        </div>
      </article>
    `)
    .join('');

  track.innerHTML = markup;
  renderThumbs();
  applyFitMode();
}

function renderThumbs() {
  if (!thumbs) {
    return;
  }

  const markup = imagePool
    .map(
      (src, index) => `
        <button class="thumb" type="button" data-index="${index}" aria-label="Go to image ${index + 1}">
          <img src="${src}" alt="Thumb ${index + 1}">
        </button>
      `
    )
    .join('');

  thumbs.innerHTML = markup;
}

function clampIndex(index) {
  if (index < 0) {
    return imagePool.length - 1;
  }
  if (index >= imagePool.length) {
    return 0;
  }
  return index;
}

function updateCarousel() {
  track.style.transform = `translateX(-${current * 100}%)`;
  counterText.textContent = `${current + 1} / ${imagePool.length}`;
  highlightActiveThumb();
}

function highlightActiveThumb() {
  if (!thumbs) {
    return;
  }

  const thumbButtons = thumbs.querySelectorAll('.thumb');
  thumbButtons.forEach((button, idx) => {
    button.classList.toggle('active', idx === current);
  });

  const active = thumbButtons[current];
  if (active) {
    active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }
}

function goNext() {
  current = clampIndex(current + 1);
  updateCarousel();
  spawnCuteBurst(window.innerWidth * 0.75, window.innerHeight * 0.45, 3);
}

function goPrev() {
  current = clampIndex(current - 1);
  updateCarousel();
  spawnCuteBurst(window.innerWidth * 0.25, window.innerHeight * 0.45, 3);
}

function goTo(index) {
  current = clampIndex(index);
  updateCarousel();
}

function toggleAutoPlay() {
  autoPlay = !autoPlay;
  playBtn.classList.toggle('active', autoPlay);
  playBtn.textContent = autoPlay ? 'Pause' : 'Auto Play';

  if (autoTimer) {
    window.clearInterval(autoTimer);
    autoTimer = null;
  }

  if (autoPlay) {
    autoTimer = window.setInterval(goNext, 2400);
    showToast('Auto play on');
  } else {
    showToast('Auto play off');
  }
}

function applyFitMode() {
  const images = track.querySelectorAll('img');
  images.forEach((img) => {
    img.style.objectFit = fitMode;
  });
}

function toggleFitMode() {
  fitMode = fitMode === 'contain' ? 'cover' : 'contain';
  fitBtn.textContent = `Fit: ${fitMode === 'contain' ? 'Contain' : 'Cover'}`;
  fitBtn.classList.toggle('active', fitMode === 'cover');
  applyFitMode();
  showToast(`Image mode: ${fitMode}`);
}

function randomJump() {
  const next = Math.floor(Math.random() * imagePool.length);
  goTo(next);
  showToast('Random cute jump!');
  spawnCuteBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 8);
}

function sparkles() {
  showToast('Sparkle mode ✨');
  for (let i = 0; i < 12; i += 1) {
    const x = 30 + Math.random() * (window.innerWidth - 60);
    const y = 120 + Math.random() * (window.innerHeight - 200);
    spawnCuteSticker(x, y);
  }
}

function spawnCuteSticker(x, y) {
  const el = document.createElement('span');
  el.className = 'float-cute';
  el.textContent = stickers[Math.floor(Math.random() * stickers.length)];
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.fontSize = `${16 + Math.random() * 16}px`;
  document.body.appendChild(el);
  window.setTimeout(() => el.remove(), 820);
}

function spawnCuteBurst(x, y, count = 5) {
  for (let i = 0; i < count; i += 1) {
    const shiftX = x + (Math.random() - 0.5) * 90;
    const shiftY = y + (Math.random() - 0.5) * 90;
    spawnCuteSticker(shiftX, shiftY);
  }
}

function onTouchStart(evt) {
  dragging = true;
  startX = evt.touches[0].clientX;
  deltaX = 0;
}

function onTouchMove(evt) {
  if (!dragging) {
    return;
  }
  deltaX = evt.touches[0].clientX - startX;
}

function onTouchEnd() {
  if (!dragging) {
    return;
  }

  if (deltaX < -45) {
    goNext();
  } else if (deltaX > 45) {
    goPrev();
  }

  dragging = false;
  deltaX = 0;
}

renderSlides();
updateCarousel();

nextBtn.addEventListener('click', goNext);
prevBtn.addEventListener('click', goPrev);
playBtn.addEventListener('click', toggleAutoPlay);
fitBtn.addEventListener('click', toggleFitMode);
sparkBtn.addEventListener('click', sparkles);
randomBtn.addEventListener('click', randomJump);

if (thumbs) {
  thumbs.addEventListener('click', (evt) => {
    const button = evt.target.closest('.thumb');
    if (!button) {
      return;
    }
    const idx = Number(button.getAttribute('data-index'));
    if (!Number.isNaN(idx)) {
      goTo(idx);
    }
  });
}

backBtn.addEventListener('click', () => {
  window.location.assign('../');
});

shell.addEventListener('touchstart', onTouchStart, { passive: true });
shell.addEventListener('touchmove', onTouchMove, { passive: true });
shell.addEventListener('touchend', onTouchEnd);

window.addEventListener('keydown', (evt) => {
  if (evt.key === 'ArrowRight') {
    goNext();
  }
  if (evt.key === 'ArrowLeft') {
    goPrev();
  }
});

shell.addEventListener('click', (evt) => {
  spawnCuteSticker(evt.clientX, evt.clientY);
});

showToast('Welcome to cute shuffle!');
