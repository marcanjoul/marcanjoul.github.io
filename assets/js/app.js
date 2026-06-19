const { gsap, ScrollTrigger, Lenis, Splitting } = window;
gsap.registerPlugin(ScrollTrigger);

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- smooth scroll (Lenis <-> GSAP ScrollTrigger) ---------- */
let lenis;
if (!reduceMotion) {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ---------- letter-by-letter reveal on scroll ---------- */
Splitting({ target: '.split', by: 'chars' });
document.querySelectorAll('.split').forEach((el) => {
  gsap.from(el.querySelectorAll('.char'), {
    yPercent: 110,
    opacity: 0,
    stagger: 0.015,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 85%' },
  });
});

/* ---------- chapter entrances ---------- */
gsap.utils.toArray('.chapter-inner').forEach((el) => {
  gsap.from(el, {
    opacity: 0,
    y: 60,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 80%' },
  });
});

gsap.utils.toArray('.project-card').forEach((el, i) => {
  gsap.from(el, {
    opacity: 0,
    y: 30,
    duration: 0.7,
    delay: (i % 3) * 0.08,
    ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 90%' },
  });
});

/* ---------- project detail modal ---------- */
const projectData = {
  appnest: {
    type: 'Mobile App',
    title: 'AppNest',
    desc: "A job application tracker that parses pasted confirmation emails using Apple's on-device NaturalLanguage framework (no APIs), with SwiftData persistence, a centralized design system, search/sort/filter options, CSV export, and a profile stats dashboard.",
    features: [
      'On-device AI email parsing with NaturalLanguage framework',
      'SwiftData persistence: no server, no accounts',
      'Centralized design system for consistent UI',
      'Search, sort, and filter applications',
      'CSV export for spreadsheet tracking',
      'Profile stats dashboard with application analytics',
    ],
    links: [{ label: 'View on GitHub →', href: 'https://github.com/marcanjoul/AppNest' }],
    media: {
      type: 'video',
      poster: 'assets/appnest/poster.jpg',
      items: [
        { label: 'Parse email', src: 'assets/appnest/parse-email.mp4' },
        { label: 'Parse link', src: 'assets/appnest/parse-link.mp4' },
        { label: 'Import CSV', src: 'assets/appnest/import-csv.mp4' },
        { label: 'Manual entry', src: 'assets/appnest/manual-entry.mp4' },
      ],
    },
  },
  spotify: {
    type: 'Data Science / ML',
    title: 'Spotify Hit Song Predictor',
    desc: 'Logistic regression model exploring whether audio features can predict hit songs. Key insight: individual features have weak predictive power, and feature engineering is essential.',
    features: [
      'Audio features alone are weak predictors of commercial success',
      'Feature engineering and combination significantly improve accuracy',
      'Explored danceability, energy, valence, tempo, and more',
      'Built full data pipeline from Spotify API to model evaluation',
    ],
    links: [{ label: 'View on GitHub →', href: 'https://github.com/marcanjoul/hit-song-predictor' }],
  },
  groov: {
    type: 'Mobile App',
    title: 'Groov',
    desc: "iOS app that lets music lovers search for, track, and rate the albums they've listened to or save albums they want to check out later. What sets Groov apart is its attention to detail, making it a powerful tool for musical reflection and taste-building.",
    features: [
      'Album search powered by external music API',
      'Personal library with listened & want-to-listen lists',
      'Star rating system for albums',
      'Clean, detail-oriented UI built with UIKit',
      'Storyboard-based navigation flow',
    ],
    links: [{ label: 'View on GitHub →', href: 'https://github.com/marcanjoul/Groov' }],
  },
  noteweb: {
    type: 'RAG / AI',
    title: 'NoteWeb',
    desc: 'A local-first RAG tool that semantically indexes and searches your documents using LLaMA 3 and vector embeddings. Everything runs locally: no cloud, and no data leaves your machine.',
    features: [
      'Semantic search across local documents',
      'LLaMA 3 for local LLM inference',
      'Vector embeddings for document indexing',
      'Fully offline, no cloud dependencies',
      'RAG pipeline from ingestion to query',
    ],
    links: [{ label: 'View on GitHub →', href: 'https://github.com/marcanjoul/NoteWeb' }],
  },
  ois: {
    type: 'Web App',
    title: 'OIS Competition Tracker',
    desc: 'A fast, game-like retail competition web app built for my retail job. Associates log daily OIS (orders in store) performance, the app computes sales-per-hour automatically, and everyone can see where they stand on a live leaderboard. Managers get a PIN-protected admin view to oversee the competition.',
    features: [
      'Daily order logging with automatic sales-per-hour calculation',
      'Live, real-time leaderboard visible to the whole team',
      'Competition countdown timer with automatic winner reveal',
      'PIN-protected manager admin view',
      'Mobile-first UI built for quick use on the sales floor',
    ],
    links: [
      { label: 'View Live Site →', href: 'https://hco-ois.vercel.app/' },
      { label: 'View on GitHub →', href: 'https://github.com/marcanjoul/hco-ois-competition' },
    ],
    media: {
      type: 'images',
      items: [
        { label: 'Home', src: 'assets/hco-ois/screen-home.png' },
        { label: 'Leaderboard', src: 'assets/hco-ois/screen-leaderboard.png' },
        { label: 'Manager', src: 'assets/hco-ois/screen-login.png' },
      ],
    },
  },
  kiosk: {
    type: 'Systems / C',
    title: 'Interactive Restaurant Kiosk',
    desc: 'A C-based self-ordering restaurant simulation that mimics a digital kiosk system entirely from the terminal: browse a structured menu, build and modify an order, and complete a realistic payment flow.',
    features: [
      'Full menu navigation across appetizers, mains, beverages, and desserts',
      'Singly linked list order system: add, update, and remove items',
      'Simulated payment flow with tipping and change calculation',
      'Itemized receipt with subtotal, tax, and tip',
      'Input validation with graceful retry handling',
    ],
    links: [{ label: 'View on GitHub →', href: 'https://github.com/marcanjoul/Interactive-Restaurant-Kiosk' }],
  },
  houseprice: {
    type: 'Data Science / ML',
    title: 'House Price Predictor',
    desc: 'Explores linear regression for predicting house prices, comparing a single-variable baseline (area only) against a multi-variable model (area, bedrooms, bathrooms, stories, parking) to show how feature selection impacts prediction accuracy.',
    features: [
      'Single-feature models underfit real-world price variance',
      'Adding relevant features improves R² and lowers MSE',
      'House prices are driven by multiple factors, not size alone',
      'Evaluated with MSE, R², and residual analysis',
    ],
    links: [{ label: 'View on GitHub →', href: 'https://github.com/marcanjoul/house-price-predictor' }],
  },
};

const modal = document.getElementById('project-modal');
const modalType = modal.querySelector('.project-modal-type');
const modalTitle = modal.querySelector('.project-modal-title');
const modalDesc = modal.querySelector('.project-modal-desc');
const modalFeatures = modal.querySelector('.project-modal-features');
const modalLinks = modal.querySelector('.project-modal-links');
const modalMedia = modal.querySelector('.project-modal-media');

// demo videos/screenshots are only fetched once a modal actually opens, never preloaded
function renderMedia(media) {
  if (!media) {
    modalMedia.hidden = true;
    modalMedia.innerHTML = '';
    return;
  }
  modalMedia.hidden = false;
  const tabs = media.items
    .map((it, i) => `<button class="media-tab${i === 0 ? ' active' : ''}" data-src="${it.src}">${it.label}</button>`)
    .join('');

  if (media.type === 'video') {
    modalMedia.innerHTML = `
      <div class="demo-phone">
        <span class="demo-phone-notch"></span>
        <video class="demo-phone-screen" poster="${media.poster}" muted loop playsinline preload="none" src="${media.items[0].src}"></video>
      </div>
      <div class="media-tabs">${tabs}</div>
    `;
    const video = modalMedia.querySelector('video');
    video.play().catch(() => {});
    modalMedia.querySelectorAll('.media-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        modalMedia.querySelectorAll('.media-tab').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        video.src = btn.dataset.src;
        video.load();
        video.play().catch(() => {});
      });
    });
  } else if (media.type === 'images') {
    modalMedia.innerHTML = `
      <div class="demo-browser">
        <div class="demo-browser-bar"><span></span><span></span><span></span></div>
        <img class="demo-browser-screen" src="${media.items[0].src}" alt="${media.items[0].label} screenshot">
      </div>
      <div class="media-tabs">${tabs}</div>
    `;
    const img = modalMedia.querySelector('img');
    modalMedia.querySelectorAll('.media-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        modalMedia.querySelectorAll('.media-tab').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        img.src = btn.dataset.src;
        img.alt = btn.textContent + ' screenshot';
      });
    });
  }
}

function openProjectModal(id) {
  const data = projectData[id];
  if (!data) return;
  renderMedia(data.media);
  modalType.textContent = data.type;
  modalTitle.textContent = data.title;
  modalDesc.textContent = data.desc;
  modalFeatures.innerHTML = data.features.map((f) => `<li>${f}</li>`).join('');
  modalLinks.innerHTML = data.links
    .map((l) => `<a href="${l.href}" target="_blank">${l.label}</a>`)
    .join('');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  if (lenis) lenis.stop();
}
function closeProjectModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  if (lenis) lenis.start();
  const video = modalMedia.querySelector('video');
  if (video) video.pause();
}

document.querySelectorAll('.project-card').forEach((card) => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    openProjectModal(card.dataset.project);
  });
});
modal.querySelector('.project-modal-close').addEventListener('click', closeProjectModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeProjectModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeProjectModal();
});

/* ---------- mobile nav ---------- */
const menuBtn = document.querySelector('.mobile-menu-btn');
const mobileNav = document.querySelector('.mobile-nav');
const mobileNavClose = document.querySelector('.mobile-nav-close');
menuBtn.addEventListener('click', () => {
  mobileNav.classList.add('active');
  document.body.style.overflow = 'hidden';
});
mobileNavClose.addEventListener('click', () => {
  mobileNav.classList.remove('active');
  document.body.style.overflow = '';
});
mobileNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('active');
    document.body.style.overflow = '';
  });
});

/* ---------- scroll progress bar ---------- */
(function scrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  const update = () => {
    const el = document.documentElement;
    const max = el.scrollHeight - el.clientHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? el.scrollTop / max : 0) + ')';
  };
  document.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* ---------- hand-sketched stars, doodled by the cursor ---------- */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

if (!ctx) {
  // no canvas support: the cream paper background alone still reads fine
} else {
  const INK = '28, 24, 18';
  const ACCENT = '43, 77, 255';
  const dpr = Math.min(devicePixelRatio || 1, 2);

  function resize() {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // a single wobbly five-point star path, redrawn every frame so the line
  // never sits still — that hand-pressure jitter is what reads as "sketched"
  function drawStar(cx, cy, r, rotation, jitter, alpha, color, width) {
    const points = 5;
    const step = Math.PI / points;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? r : r * 0.42;
      const angle = i * step + rotation;
      const jx = (Math.random() - 0.5) * jitter;
      const jy = (Math.random() - 0.5) * jitter;
      const x = cx + Math.cos(angle) * radius + jx;
      const y = cy + Math.sin(angle) * radius + jy;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(${color}, ${alpha})`;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  // faint ambient constellation — always present, gently twinkling
  const AMBIENT_COUNT = Math.round((innerWidth * innerHeight) / 22000);
  const ambient = Array.from({ length: AMBIENT_COUNT }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: 4 + Math.random() * 7,
    rotation: Math.random() * Math.PI,
    seed: Math.random() * 100,
  }));
  window.addEventListener('resize', () => {
    ambient.forEach((s) => {
      s.x = Math.min(s.x, innerWidth);
      s.y = Math.min(s.y, innerHeight);
    });
  });

  // the cursor leaves a trail of doodled stars that fade out and vanish
  let trail = [];
  function spawnTrailStar(x, y) {
    trail.push({
      x,
      y,
      r: 9 + Math.random() * 10,
      rotation: Math.random() * Math.PI,
      born: performance.now(),
      life: 1100 + Math.random() * 500,
    });
    if (trail.length > 60) trail.shift();
  }

  let lastSpawn = 0;
  function setPointer(x, y) {
    const now = performance.now();
    if (now - lastSpawn > 60) {
      spawnTrailStar(x, y);
      lastSpawn = now;
    }
  }
  window.addEventListener('pointermove', (e) => setPointer(e.clientX, e.clientY));
  window.addEventListener(
    'touchmove',
    (e) => {
      const t = e.touches[0];
      if (t) setPointer(t.clientX, t.clientY);
    },
    { passive: true }
  );

  // idle ambient trail star so the page still feels alive with no pointer input
  setInterval(() => {
    if (reduceMotion) return;
    spawnTrailStar(Math.random() * innerWidth, Math.random() * innerHeight * 0.6);
  }, 1400);

  // gentle parallax: ambient stars drift opposite scroll for a hint of depth
  let scrollY = 0;
  window.addEventListener('scroll', () => (scrollY = window.scrollY), { passive: true });

  let raf;
  function tick(time) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const parallax = scrollY * 0.04;

    ambient.forEach((s) => {
      const twinkle = 0.18 + 0.14 * Math.sin(time * 0.0006 + s.seed);
      drawStar(s.x, (s.y - parallax) % (innerHeight + 40), s.r, s.rotation + time * 0.00005, 1.2, twinkle, INK, 1.2);
    });

    const now = performance.now();
    trail = trail.filter((s) => now - s.born < s.life);
    trail.forEach((s) => {
      const age = (now - s.born) / s.life;
      const alpha = age < 0.15 ? age / 0.15 : 1 - (age - 0.15) / 0.85;
      const scale = 0.7 + age * 0.5;
      drawStar(s.x, s.y, s.r * scale, s.rotation, 1.6, Math.max(alpha, 0) * 0.85, ACCENT, 1.8);
    });

    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(tick);
  });
}
