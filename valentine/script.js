(() => {
const noMessages = [
  'Are you sure?',
  'Really sure?',
  'Think again please.',
  'No button looks suspicious...',
  'Last chance to pick Yes.',
  'Please do not break my heart.',
  'Still no? Are you super sure?',
  'I will ask one more time: yes?'
];

const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const cardFrame = document.querySelector('.card');
const sureNote = document.getElementById('sureNote');
const successModal = document.getElementById('successModal');
const closeModal = document.getElementById('closeModal');

let noCount = 0;
let noHidden = false;
let noScaleNow = 1;
let lastNoPosition = null;
const noDisappearCount = 30;
let runawayStarted = false;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function placeNoButtonAt(left, top) {
  noBtn.style.left = `${left}px`;
  noBtn.style.top = `${top}px`;
  noBtn.style.right = 'auto';
  noBtn.style.bottom = 'auto';
}

function moveNoButtonRandomly() {
  if (noHidden || !cardFrame) {
    return;
  }

  runawayStarted = true;
  noBtn.classList.add('runaway');

  const framePadding = 10;
  const frameWidth = cardFrame.clientWidth;
  const frameHeight = cardFrame.clientHeight;
  const baseWidth = noBtn.offsetWidth || 90;
  const baseHeight = noBtn.offsetHeight || 44;
  const buttonWidth = baseWidth * noScaleNow;
  const buttonHeight = baseHeight * noScaleNow;

  const minX = framePadding;
  const minY = framePadding;
  const maxX = Math.max(minX, frameWidth - buttonWidth - framePadding);
  const maxY = Math.max(minY, frameHeight - buttonHeight - framePadding);

  let candidate = {
    left: clamp((frameWidth - buttonWidth) / 2, minX, maxX),
    top: clamp((frameHeight - buttonHeight) / 2, minY, maxY)
  };
  let bestCandidate = candidate;
  let bestDistance = -1;
  const frameDiag = Math.hypot(Math.max(1, maxX - minX), Math.max(1, maxY - minY));
  const minMove = Math.max(24, Math.min(76, frameDiag * 0.2));

  for (let i = 0; i < 60; i += 1) {
    const left = minX + Math.random() * Math.max(1, maxX - minX);
    const top = minY + Math.random() * Math.max(1, maxY - minY);
    const distance = !lastNoPosition
      ? Number.POSITIVE_INFINITY
      : Math.hypot(left - lastNoPosition.left, top - lastNoPosition.top);

    if (distance > bestDistance) {
      bestDistance = distance;
      bestCandidate = { left, top };
    }

    if (distance >= minMove) {
      candidate = { left, top };
      break;
    }
  }

  if (lastNoPosition) {
    const selectedDistance = Math.hypot(candidate.left - lastNoPosition.left, candidate.top - lastNoPosition.top);
    if (selectedDistance < minMove * 0.6) {
      candidate = bestCandidate;
    }
  }

  candidate.left = clamp(candidate.left, minX, maxX);
  candidate.top = clamp(candidate.top, minY, maxY);
  lastNoPosition = { left: candidate.left, top: candidate.top };
  placeNoButtonAt(candidate.left, candidate.top);
}

function updateButtons() {
  const yesScale = Math.min(1 + noCount * 0.18, 2.4);
  const latePhase = Math.max(0, noCount - (noDisappearCount - 6));
  const noScale = Math.max(1 - latePhase * 0.08, 0.78);
  const noOpacity = Math.max(1 - latePhase * 0.16, 0.7);
  noScaleNow = noScale;

  yesBtn.style.transform = `scale(${yesScale})`;
  noBtn.style.transform = `scale(${noScale})`;
  noBtn.style.opacity = String(noOpacity);
  noBtn.style.pointerEvents = 'auto';
  noBtn.style.display = '';

  yesBtn.textContent = noCount > 2 ? 'YES YES YES' : 'Yes';

  if (noCount >= noDisappearCount) {
    noBtn.style.opacity = '0';
    noBtn.style.pointerEvents = 'none';
    noBtn.style.display = 'none';
    noHidden = true;
  }
}

function handleNo() {
  if (noHidden) {
    return;
  }

  noCount += 1;
  sureNote.textContent = noMessages[Math.min(noCount - 1, noMessages.length - 1)];
  updateButtons();

  if (!noHidden) {
    moveNoButtonRandomly();
  }
}

function initNoButton() {
  if (!cardFrame) {
    return;
  }

  runawayStarted = false;
  noBtn.classList.remove('runaway');
  noBtn.style.left = '';
  noBtn.style.top = '';
  noBtn.style.right = '';
  noBtn.style.bottom = '';

  // Capture the in-flow initial location to compute meaningful jump distance later.
  const cardRect = cardFrame.getBoundingClientRect();
  const noRect = noBtn.getBoundingClientRect();
  lastNoPosition = {
    left: noRect.left - cardRect.left,
    top: noRect.top - cardRect.top
  };
}

function openSuccess() {
  successModal.classList.add('show');
  successModal.setAttribute('aria-hidden', 'false');
}

function closeSuccess() {
  successModal.classList.remove('show');
  successModal.setAttribute('aria-hidden', 'true');
}

noBtn.addEventListener('click', handleNo);
yesBtn.addEventListener('click', openSuccess);
closeModal.addEventListener('click', closeSuccess);

window.addEventListener('resize', () => {
  if (!noHidden) {
    if (runawayStarted) {
      moveNoButtonRandomly();
    } else {
      initNoButton();
    }
  }
});

successModal.addEventListener('click', (event) => {
  if (event.target === successModal) {
    closeSuccess();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeSuccess();
  }
});

initNoButton();
})();
