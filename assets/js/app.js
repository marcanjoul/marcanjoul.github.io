import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

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

/* ---------- painted, cursor-reactive background ---------- */
const canvas = document.getElementById('bg-canvas');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch (e) {
  renderer = null;
}

if (!renderer) {
  document.body.classList.add('no-webgl');
} else {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 50);
  camera.position.set(0, 2.4, 3.2);
  camera.lookAt(0, 0, 0);

  // cool-family palette only — hue drifts slowly (cyan -> teal -> blue -> indigo),
  // never crossing into warm hues, so the shift reads as ambient, not a scene change
  const palette = [
    ['#05060a', '#00d4ff'], // hero
    ['#06080f', '#22b8f0'],
    ['#070a12', '#2dd4bf'],
    ['#080a14', '#3b82f6'],
    ['#07060f', '#6366f1'],
    ['#06070d', '#818cf8'],
  ];
  const toVec3 = (hex) => {
    const c = new THREE.Color(hex);
    return new THREE.Vector3(c.r, c.g, c.b);
  };
  const colorsA = palette.map((p) => toVec3(p[0]));
  const colorsB = palette.map((p) => toVec3(p[1]));

  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(innerWidth, innerHeight) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uMouseStrength: { value: 0 },
    uColorA: { value: colorsA[0].clone() },
    uColorB: { value: colorsB[0].clone() },
    uScrollPhase: { value: 0 },
  };

  // VARIANT 4: wireframe terrain / waves
  const terrainGeo = new THREE.PlaneGeometry(8, 8, 90, 90);
  terrainGeo.rotateX(-Math.PI / 2);

  const material = new THREE.ShaderMaterial({
    uniforms,
    wireframe: true,
    vertexShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uMouseStrength;
      uniform float uScrollPhase;
      varying float vHeight;

      vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
      vec2 mod289(vec2 x){return x - floor(x*(1.0/289.0))*289.0;}
      vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                 -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
              + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec3 pos = position;
        float n = snoise(pos.xz * 0.35 + vec2(0.0, uScrollPhase) + uTime * 0.08);
        float ripple = 0.0;
        vec2 mouseWorld = (uMouse - 0.5) * 8.0;
        float d = distance(pos.xz, mouseWorld);
        ripple = sin(d * 2.2 - uTime * 1.8) * exp(-d * 0.5) * uMouseStrength;
        pos.y += n * 0.45 + ripple * 0.6;
        vHeight = pos.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      precision mediump float;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying float vHeight;
      void main() {
        float t = smoothstep(-0.5, 0.7, vHeight);
        vec3 col = mix(uColorA, uColorB, t);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  scene.add(new THREE.Mesh(terrainGeo, material));
  renderer.setClearColor(0x05060a, 1);

  function resize() {
    renderer.setSize(innerWidth, innerHeight);
    uniforms.uResolution.value.set(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  /* cursor / touch reactivity */
  let targetMouse = { x: 0.5, y: 0.5 };
  let targetStrength = 0;
  function setPointer(x, y) {
    targetMouse.x = x / innerWidth;
    targetMouse.y = 1 - y / innerHeight;
    targetStrength = 1;
  }
  window.addEventListener('pointermove', (e) => setPointer(e.clientX, e.clientY));
  window.addEventListener('pointerleave', () => (targetStrength = 0));
  window.addEventListener(
    'touchmove',
    (e) => {
      const t = e.touches[0];
      if (t) setPointer(t.clientX, t.clientY);
    },
    { passive: true }
  );

  /* scroll drives two subtle, simultaneous effects: a slow cool-hue drift
     and a gentle camera/terrain flythrough — both eased so neither is abrupt */
  function lerpVec3(a, b, t, out) {
    out.x = a.x + (b.x - a.x) * t;
    out.y = a.y + (b.y - a.y) * t;
    out.z = a.z + (b.z - a.z) * t;
  }
  let scrollProgress = 0;
  let targetColorA = colorsA[0];
  let targetColorB = colorsB[0];
  if (!reduceMotion) {
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate(self) {
        scrollProgress = self.progress;
        const f = self.progress * (palette.length - 1);
        const i = Math.min(Math.floor(f), palette.length - 2);
        const t = f - i;
        targetColorA = { x: colorsA[i].x + (colorsA[i + 1].x - colorsA[i].x) * t, y: colorsA[i].y + (colorsA[i + 1].y - colorsA[i].y) * t, z: colorsA[i].z + (colorsA[i + 1].z - colorsA[i].z) * t };
        targetColorB = { x: colorsB[i].x + (colorsB[i + 1].x - colorsB[i].x) * t, y: colorsB[i].y + (colorsB[i + 1].y - colorsB[i].y) * t, z: colorsB[i].z + (colorsB[i + 1].z - colorsB[i].z) * t };
      },
    });
  }

  let raf;
  function tick(time) {
    uniforms.uTime.value = time * 0.001;
    uniforms.uMouse.value.x += (targetMouse.x - uniforms.uMouse.value.x) * 0.08;
    uniforms.uMouse.value.y += (targetMouse.y - uniforms.uMouse.value.y) * 0.08;
    uniforms.uMouseStrength.value += (targetStrength - uniforms.uMouseStrength.value) * 0.05;
    uniforms.uScrollPhase.value += (scrollProgress * 6.0 - uniforms.uScrollPhase.value) * 0.05;
    // slow ease (0.015) keeps the hue drift imperceptible frame-to-frame
    lerpVec3(uniforms.uColorA.value, targetColorA, 0.015, uniforms.uColorA.value);
    lerpVec3(uniforms.uColorB.value, targetColorB, 0.015, uniforms.uColorB.value);

    const targetX = Math.sin(scrollProgress * Math.PI * 2) * 0.7;
    const targetY = 2.0 + scrollProgress * 0.8;
    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (targetY - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(tick);
  });
}
