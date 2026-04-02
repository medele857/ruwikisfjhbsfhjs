/* ════════════════════════════════════════
   RUMAPDEV WIKI — SCRIPT
   ════════════════════════════════════════ */

// ── Theme ──────────────────────────────
const html = document.documentElement;
const themeBtn  = document.getElementById('themeToggle');
const themeIcon = themeBtn?.querySelector('.theme-icon');

const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

themeBtn?.addEventListener('click', () => {
  const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('theme', next);
  playClick();
});

function applyTheme(t) {
  html.dataset.theme = t;
  if (themeIcon) themeIcon.textContent = t === 'dark' ? '🌙' : '☀️';
}

// ── Web Audio bleep ─────────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function getCtx() { if (!audioCtx) audioCtx = new AudioCtx(); return audioCtx; }

function playBleep(freq1, freq2, dur, vol) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq1, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq2, ctx.currentTime + dur);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur + 0.04);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur + 0.05);
  } catch(e) {}
}
const playHover = () => playBleep(880, 1100, 0.06, 0.055);
const playClick = () => playBleep(440, 700, 0.08, 0.07);

// attach hover sound to all [data-sound]
document.querySelectorAll('[data-sound]').forEach(el => {
  el.addEventListener('mouseenter', playHover);
});

// ── Logo hover: МапДев Вики → кто кто? ──
const logoText     = document.getElementById('logoText');
const galochkaAudio = document.getElementById('galochkaAudio');

if (logoText) {
  let hovered = false;

  logoText.addEventListener('mouseenter', () => {
    hovered = true;
    logoText.textContent = logoText.dataset.hover;
    playHover();
  });
  logoText.addEventListener('mouseleave', () => {
    hovered = false;
    logoText.textContent = logoText.dataset.default;
  });
  logoText.addEventListener('click', () => {
    if (galochkaAudio) {
      galochkaAudio.currentTime = 0;
      galochkaAudio.play().catch(()=>{});
    }
    playClick();
  });
}

// ── Meme button ─────────────────────────
const MEME_URLS = [
  'https://www.reddit.com/r/minecraftmemes/',
  'https://pikabu.ru/tag/%D0%BC%D0%B0%D0%B9%D0%BD%D0%BA%D1%80%D0%B0%D1%84%D1%82/hot',
  'https://9gag.com/tag/minecraft-meme',
  'https://memedroid.com/memes/tag/minecraft',
  'https://knowyourmeme.com/memes/subcultures/minecraft',
  'https://ifunny.co/tags/minecraft',
  'https://www.pinterest.com/search/pins/?q=minecraft+memes',
  'https://pikabu.ru/story/minekraft_memy_9565183',
  'https://risovach.ru/search/?q=%D0%BC%D0%B0%D0%B9%D0%BD%D0%BA%D1%80%D0%B0%D1%84%D1%82',
  'https://www.reddit.com/r/Minecraft/search/?q=meme&sort=top&t=all',
];
document.getElementById('memBtn')?.addEventListener('click', () => {
  playClick();
  window.open(MEME_URLS[Math.floor(Math.random() * MEME_URLS.length)], '_blank');
});

// ── Header scroll ───────────────────────
const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,0.35)' : 'none';
  });
}

// ════════════════════════════════════════
// DRAGGABLE HEAD
// ════════════════════════════════════════
const headWrap   = document.getElementById('headWrap');
const headBubble = document.getElementById('headBubble');

if (headWrap) {

  // ── Phrases ──
  const PHRASES = [
    'йо, не трогай меня',
    'чел ты чё, я тут живу',
    'ладно ладно, потаскай меня',
    'а ты знал что ру мапдев существует?',
    'эй, отпусти!!',
    'мне не нравится когда меня бросают',
    'кинь меня в стену, интересно что будет',
    'я голова. просто голова.',
    'вернул меня? уважаю',
    'буду висеть тут пока не надоем',
    'моя мечта - стать маппером',
    'ты читаешь это? норм',
    'зачем ты это делаешь',
    'я смотрю на тебя',
    'хватит меня таскать, мне нужно отдохнуть',
    'кто вообще придумал говорящие головы на сайтах',
    'я не знаю что тут написать',
    'передвинь меня поближе к кнопке "авторы"',
    'ладно, мне понравилось что ты меня поднял',
    'я знаю всё про ру мапдев',
  ];

  let phraseIndex = Math.floor(Math.random() * PHRASES.length);
  let bubbleTimer = null;
  let idleTimer = null;

  function showBubble(text) {
    clearTimeout(bubbleTimer);
    headBubble.textContent = text;
    headBubble.classList.add('visible');
    bubbleTimer = setTimeout(() => headBubble.classList.remove('visible'), 3500);
  }

  function scheduleIdleBubble() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      phraseIndex = (phraseIndex + 1) % PHRASES.length;
      showBubble(PHRASES[phraseIndex]);
      scheduleIdleBubble();
    }, 8000 + Math.random() * 6000);
  }

  // show first bubble after 2s
  setTimeout(() => {
    showBubble(PHRASES[phraseIndex]);
    scheduleIdleBubble();
  }, 2000);

  // ── Drag logic ──
  let isDragging = false;
  let startX, startY, origLeft, origTop;
  let velX = 0, velY = 0;
  let lastX, lastY, lastT;
  let animId = null;

  // init position from CSS (fixed bottom/right)
  // convert to top/left on first drag
  function initPos() {
    const r = headWrap.getBoundingClientRect();
    headWrap.style.position = 'fixed';
    headWrap.style.left = r.left + 'px';
    headWrap.style.top  = r.top  + 'px';
    headWrap.style.bottom = 'auto';
    headWrap.style.right  = 'auto';
  }

  function onDown(e) {
    e.preventDefault();
    initPos();
    isDragging = true;
    headWrap.classList.add('dragging');
    cancelAnimationFrame(animId);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startX = clientX - parseFloat(headWrap.style.left);
    startY = clientY - parseFloat(headWrap.style.top);
    lastX = clientX; lastY = clientY; lastT = Date.now();

    phraseIndex = Math.floor(Math.random() * PHRASES.length);
    showBubble(PHRASES[phraseIndex]);
    playHover();
  }

  function onMove(e) {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const now = Date.now();
    const dt = Math.max(now - lastT, 1);
    velX = (clientX - lastX) / dt * 16;
    velY = (clientY - lastY) / dt * 16;
    lastX = clientX; lastY = clientY; lastT = now;

    headWrap.style.left = (clientX - startX) + 'px';
    headWrap.style.top  = (clientY - startY) + 'px';
  }

  function onUp() {
    if (!isDragging) return;
    isDragging = false;
    headWrap.classList.remove('dragging');

    // throw physics
    const speed = Math.sqrt(velX*velX + velY*velY);
    if (speed > 3) {
      headWrap.classList.add('thrown');
      const phrase = ['эй!!', 'АААА', 'лети!', 'не так сильно!!', 'ловите меня'][Math.floor(Math.random()*5)];
      showBubble(phrase);
      animateThrow();
    } else {
      const phrase = PHRASES[Math.floor(Math.random()*PHRASES.length)];
      showBubble(phrase);
    }
    scheduleIdleBubble();
  }

  function animateThrow() {
    const friction = 0.88;
    let left = parseFloat(headWrap.style.left);
    let top  = parseFloat(headWrap.style.top);

    function step() {
      velX *= friction;
      velY *= friction;
      velY += 0.4; // gravity
      left += velX;
      top  += velY;

      // clamp to viewport
      const maxX = window.innerWidth  - headWrap.offsetWidth;
      const maxY = window.innerHeight - headWrap.offsetHeight;
      if (left < 0)    { left = 0;    velX *= -0.5; }
      if (left > maxX) { left = maxX; velX *= -0.5; }
      if (top  < 0)    { top  = 0;    velY *= -0.5; }
      if (top  > maxY) { top  = maxY; velY *= -0.6; }

      headWrap.style.left = left + 'px';
      headWrap.style.top  = top  + 'px';

      if (Math.abs(velX) > 0.2 || Math.abs(velY) > 0.2) {
        animId = requestAnimationFrame(step);
      } else {
        headWrap.classList.remove('thrown');
      }
    }
    animId = requestAnimationFrame(step);
  }

  headWrap.addEventListener('mousedown',  onDown);
  headWrap.addEventListener('touchstart', onDown, { passive:false });
  window.addEventListener('mousemove',  onMove);
  window.addEventListener('touchmove',  onMove, { passive:false });
  window.addEventListener('mouseup',   onUp);
  window.addEventListener('touchend',  onUp);

  // click (no drag) → phrase
  headWrap.addEventListener('click', (e) => {
    phraseIndex = Math.floor(Math.random() * PHRASES.length);
    showBubble(PHRASES[phraseIndex]);
    playHover();
  });
}
