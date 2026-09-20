document.getElementById('footer-year').textContent = new Date().getFullYear();

// ============================================================
// Celestial Canvas Animation & Portfolio Logic
// ============================================================

const { gsap, ScrollTrigger, Lenis, Splitting } = window;
gsap.registerPlugin(ScrollTrigger);

const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

const state = {
  logoTransition: 0, // 0 = Centered Sun, 1 = Upper Moon navbar (docked by scrollTop = 600)
  time: 0
};

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Cache DOM elements globally to prevent layout thrashing inside the requestAnimationFrame draw loop
const cachedHeroContent = document.getElementById('hero-content');
const cachedTopBlur = document.getElementById('top-blur-header');
const cachedNavInner = document.querySelector('.nav-inner');
const cachedLogoLink = document.querySelector('.logo-link');
const cachedFooter = document.querySelector('.site-footer');
const cachedContactLinks = document.querySelector('#contact .contact-links');
let lastFooterOn = -1;
let lastHeroFade = -1, lastBlurOpacity = -1, lastNavFade = -1;

/* ---------- smooth scroll (Lenis <-> GSAP ScrollTrigger) ---------- */
let lenis;
if (!reduceMotion && !isMobile) {
  lenis = new Lenis({ duration: 0.85, smoothWheel: true });
  window.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ---------- letter-by-letter reveal on scroll ---------- */
Splitting({ target: '.split', by: 'chars' });
document.querySelectorAll('.split').forEach((el) => {
  gsap.fromTo(el.querySelectorAll('.char'), 
    {
      opacity: 0,
      y: () => gsap.utils.random(-15, 15),
      x: () => gsap.utils.random(-8, 8),
      rotation: () => gsap.utils.random(-18, 18),
      scale: () => gsap.utils.random(0.4, 0.7)
    },
    {
      opacity: 1,
      y: 0,
      x: 0,
      rotation: 0,
      scale: 1,
      duration: 0.5,
      stagger: 0.012,
      ease: 'back.out(1.2)',
      scrollTrigger: { trigger: el, start: 'top 98%' },
    }
  );
});

/* ---------- hero intro text fades out on scroll ---------- */
// ponytail: one tween over two elements. The old version animated blur + colour on ~97
// per-character spans every scroll frame, which Safari cannot GPU-accelerate.
// The canvas name reads this tween's own progress, so it fades on exactly the same curve
// and scrub lag as the text under it. (logoTransition uses a different scrub and is left
// alone — it still drives where the name travels, not how it fades.)
const heroFadeTween = gsap.fromTo('#hero-label, #hero-subhead',
  { opacity: 1 },
  {
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 450, scrub: 0.5 },
  });

/* ---------- chapter scroll animations (entrance + hold + exit suction) ---------- */
if (reduceMotion) {
  // Simple entrance animations for reduced motion preference
  gsap.utils.toArray('.chapter-inner').forEach((el) => {
    const parentChapter = el.closest('.chapter');
    if (!parentChapter) return;
    gsap.from(el, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: parentChapter, start: 'top 85%', toggleActions: 'play none none none' },
    });
  });
} else {
  // Standard card transition: smooth fade and slide-in as they enter the screen
  gsap.utils.toArray('.chapter-inner').forEach((el) => {
    const parentChapter = el.closest('.chapter');
    if (!parentChapter) return;

    // Skip entrance animation for the hero section so it is instantly readable on load
    if (parentChapter.classList.contains('chapter-hero')) {
      return;
    }

    const startState = { opacity: 0, y: 15 };
    const endState = {
      opacity: 1,
      y: 0,
      duration: 0.3,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: parentChapter,
        start: 'top 98%', // Animates in right as it enters so fast scrolls don't outrun it
        toggleActions: 'play none none none' // No reverse: avoids flicker on fast flicks
      }
    };

    gsap.fromTo(el, startState, endState);
  });

}

/* The skills grid is 30 icons that currently all land on the same frame, which reads as a
   render flash rather than an entrance. Staggering them is the whole fix. The transform is
   on .skill-item — its child carries the sketchy filter, so the filtered layer gets
   transformed rather than re-rasterized 30 times. */
if (!reduceMotion) {
  const skillItems = gsap.utils.toArray('.skill-item');
  if (skillItems.length) {
    gsap.from(skillItems, {
      opacity: 0,
      y: 12,
      duration: 0.32,
      ease: 'power2.out',
      stagger: 0.022,            // ~0.65s for the whole cascade
      scrollTrigger: { trigger: '#skills', start: 'top 80%', toggleActions: 'play none none none' },
    });
  }
}

function revealProjects() {
  gsap.utils.toArray('.proj').forEach((el) => {
  gsap.from(el, {
    opacity: 0,
    y: 24,
    duration: 0.5,
    ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 95%' },
  });
  });
}

/* ---------- project detail modal data ---------- */
/* Modal content is loaded from projects.json — see initProjects() at the end of this script. */
let projectData = {};

const modal = document.getElementById('project-modal');
const modalType = modal.querySelector('.project-modal-type');
const modalTitle = modal.querySelector('.project-modal-title');
const modalDesc = modal.querySelector('.project-modal-desc');
const modalFeatures = modal.querySelector('.project-modal-features');
const modalLinks = modal.querySelector('.project-modal-links');
const modalMedia = modal.querySelector('.project-modal-media');

// Fade the current frame out, swap the source, fade back in only once the new frame is
// actually decoded — otherwise the fade-in lands on the old picture and the cut still shows.
function fadeSwapMedia(el, apply, ready) {
  el.classList.add('media-swapping');
  const show = () => el.classList.remove('media-swapping');
  setTimeout(() => {
    apply();
    ready(show);
  }, 180);
}

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
        fadeSwapMedia(video, () => {
          video.src = btn.dataset.src;
          video.load();
          video.play().catch(() => {});
        }, (show) => video.addEventListener('loadeddata', show, { once: true }));
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
        const label = btn.textContent;
        fadeSwapMedia(img, () => {
          img.src = btn.dataset.src;
          img.alt = label + ' screenshot';
        }, (show) => (img.decode ? img.decode().then(show, show) : img.addEventListener('load', show, { once: true })));
      });
    });
  }
}

const modalPanel = modal.querySelector('.project-modal-panel');
const siteNav = document.querySelector('nav');
const scrollWrapperEl = document.querySelector('.scroll-wrapper');
let modalTriggerEl = null;

function trapModalTab(e) {
  if (e.key !== 'Tab') return;
  const focusable = modalPanel.querySelectorAll('a[href], button:not([disabled])');
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function openProjectModal(id, triggerEl) {
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
  modalPanel.scrollTop = 0;   // otherwise project B opens at wherever project A was left
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  if (lenis) lenis.stop();
  modalTriggerEl = triggerEl || document.activeElement;
  if (siteNav) siteNav.inert = true;
  if (scrollWrapperEl) scrollWrapperEl.inert = true;
  modal.querySelector('.project-modal-close').focus();
  modal.addEventListener('keydown', trapModalTab);
}
function closeProjectModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  if (lenis) lenis.start();
  const video = modalMedia.querySelector('video');
  if (video) video.pause();
  if (siteNav) siteNav.inert = false;
  if (scrollWrapperEl) scrollWrapperEl.inert = false;
  modal.removeEventListener('keydown', trapModalTab);
  if (modalTriggerEl) modalTriggerEl.focus();
  modalTriggerEl = null;
}

// Each tile is one target: it opens the case study. Repo/live links live in the modal.
function wireTiles() {
  document.querySelectorAll('.proj').forEach((tile) => {
  const name = tile.querySelector('h3').textContent.trim();
  tile.setAttribute('tabindex', '0');
  tile.setAttribute('role', 'button');
  tile.setAttribute('aria-label', `${name} — open case study`);
  const open = () => openProjectModal(tile.dataset.project, tile);
  tile.addEventListener('click', open);
  // the badges are their own destinations — clicking one must not also open the case study
  tile.querySelectorAll('.proj-badge').forEach((b) => {
    b.addEventListener('click', (e) => e.stopPropagation());
  });
  tile.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });

  // ponytail: play the demo clip on hover/focus only, so the section costs nothing at load
  const video = tile.querySelector('video');
  if (video && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const play = () => { video.play().catch(() => {}); };
    const stop = () => { video.pause(); video.currentTime = 0; };
    tile.addEventListener('mouseenter', play);
    tile.addEventListener('mouseleave', stop);
    tile.addEventListener('focus', play);
    tile.addEventListener('blur', stop);
  }
  });
}

/* ---------- projects come from projects.json ----------
   Edit projects.json and commit; nothing else to run. The cards and the modal
   content both read from it, so the two can't drift apart. */
const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function projectThumb(t) {
  if (t.video) {
    return `<video src="${esc(t.video)}" poster="${esc(t.poster)}" muted loop playsinline` +
           ` preload="none" aria-hidden="true"></video>`;
  }
  return `<img src="${esc(t.image)}" alt="" loading="lazy" decoding="async">`;
}

// Three screens beat one when the project has three. A still gallery becomes a lead shot
// with two supporting views; anything else (a video demo, or a project with a single
// screenshot) keeps the one frame, because three stills of a clip is worse than the clip.
function projectShot(p) {
  const g = p.gallery;
  const canTriptych = g && g.type === 'images' && Array.isArray(g.items) && g.items.length >= 3;
  if (!canTriptych) {
    return `<div class="proj-shot">${projectThumb(p.thumbnail)}</div>`;
  }
  const [lead, ...rest] = g.items.slice(0, 3);
  const cell = (it, cls) =>
    `<img class="${cls}" src="${esc(it.src)}" alt="${esc(p.title)} — ${esc(it.label)}"` +
    ` loading="lazy" decoding="async">`;
  return `<div class="proj-shot is-triptych">` +
    cell(lead, 'shot-lead') + rest.map((it) => cell(it, 'shot-aside')).join('') +
  `</div>`;
}

const BADGE_ICON = {
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor"/></svg>',
  site: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.6" y="4.6" width="18.8" height="14.8" rx="2.6" stroke="currentColor" stroke-width="1.9"/><path d="M2.6 9.6H21.4" stroke="currentColor" stroke-width="1.9"/><circle cx="5.9" cy="7.1" r="0.85" fill="currentColor"/><circle cx="8.5" cy="7.1" r="0.85" fill="currentColor"/><circle cx="11.1" cy="7.1" r="0.85" fill="currentColor"/></svg>'
};

// The repo and the deployed site are worth reaching without opening the case study first,
// so they come back as badges rather than as more pills in the action row.
function projectBadges(links) {
  return (links || []).map((l) => {
    const isRepo = /github\.com/i.test(l.href);
    const kind = isRepo ? 'github' : 'site';
    const label = isRepo ? 'Open the repository on GitHub' : 'Open the live site';
    return `<a class="proj-badge proj-badge-${kind}" href="${esc(l.href)}" target="_blank"` +
      ` rel="noopener" aria-label="${label}" title="${label}">${BADGE_ICON[kind]}</a>`;
  }).join('');
}

function projectCard(p, i) {
  // shortTitle / shortType are card-only overrides; everything else is shared with the modal
  // Five slots, always the same five, always in the same place. The repo and live links
  // live in the case study, which is one click away and where someone goes to act on them;
  // keeping them here made the action row wrap and shoved the whole column around.
  return `<article class="proj proj-panel" data-project="${esc(p.id)}">` +
    `<div class="proj-body">` +
    `<div class="proj-info">` +
      `<span class="proj-kicker">${esc(p.shortType || p.type)}</span>` +
      `<h3>${esc(p.shortTitle || p.title)}</h3>` +
      `<p class="proj-tagline">${esc(p.tagline)}</p>` +
      `<div class="proj-actions">` + projectBadges(p.links) + `</div>` +
    `</div>` +
    projectShot(p) +
    `</div>` +
  `</article>`;
}

// the modal reads its own field names, so map once here
function projectModal(p) {
  return { type: p.type, title: p.title, desc: p.about,
           features: p.features, links: p.links, media: p.gallery };
}

/* ---------- the box holds still; its contents change ----------
   The panel is the fixed thing on the page. What travels is `.proj-body` — the text column
   and the screenshot — swapping inside a box that never moves, never resizes and never
   leaves. That also means the transition can be soft-edged without the box's outline
   flickering, because the outline is not part of the animation. */
let projectList = [];
let projectIndex = -1;
let outgoingIndex = -1;

const WIPE_ZONE = 0.30;   // share of each project's scroll segment spent changing over

/* Scrubbed, not timed: the scroll IS the timeline, so a strong ease-out would front-load
   the whole change into the first fifth of the gesture. Smoothstep tracks the hand in the
   middle and only softens the two ends. */
const ease = (x) => { const c = Math.min(Math.max(x, 0), 1); return c * c * (3 - 2 * c); };
const clamp01 = (x) => Math.min(Math.max(x, 0), 1);

function layerHTML(i) {
  return projectCard(projectList[i], i);
}

// just the contents of the box — the part that actually changes
function bodyHTML(i) {
  const p = projectList[i];
  return `<div class="proj-info">` +
      `<span class="proj-kicker">${esc(p.shortType || p.type)}</span>` +
      `<h3>${esc(p.shortTitle || p.title)}</h3>` +
      `<p class="proj-tagline">${esc(p.tagline)}</p>` +
      `<div class="proj-actions">` + projectBadges(p.links) + `</div>` +
    `</div>` + projectShot(p);
}

function renderBase(i) {
  if (i === projectIndex) return;
  projectIndex = i;
  const holder = document.querySelector('.proj-holder');
  const out = holder.querySelector('.proj-layer-out');
  holder.innerHTML = layerHTML(i);
  if (out) holder.querySelector(':scope > .proj-panel').appendChild(out);
  const count = document.querySelector('.proj-count');
  if (count) count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(projectList.length).padStart(2, '0')}`;
  document.querySelectorAll('.proj-tick').forEach((t, k) => t.classList.toggle('on', k === i));
  wireTiles();
}

// the departing contents, laid over the arriving ones inside the same box
function setOutgoing(i) {
  const holder = document.querySelector('.proj-holder');
  const panel = holder.querySelector(':scope > .proj-panel');
  let out = holder.querySelector('.proj-layer-out');
  if (i === -1) { if (out) out.remove(); outgoingIndex = -1; return null; }
  if (i !== outgoingIndex) {
    if (out) out.remove();
    out = document.createElement('div');
    out.className = 'proj-layer-out';
    out.innerHTML = `<div class="proj-body">${bodyHTML(i)}</div>`;
    if (panel) panel.appendChild(out);
    outgoingIndex = i;
  }
  return out;
}

/* Every piece of the contents leaves on its own beat and the next set arrives the same
   way — the text column is five separate pieces plus the screenshot. */

// in reading order — the order they leave in, and the order they come back in
function bodyPieces(body) {
  if (!body) return [];
  return ['.proj-kicker', 'h3', '.proj-tagline', '.proj-actions', '.proj-shot']
    .map((s) => body.querySelector(s)).filter(Boolean);
}

function resetPieces(body) {
  bodyPieces(body).forEach((el) => { el.style.cssText = ''; });
  if (body) body.style.cssText = '';
}

/* w: 0 = the departing contents are untouched, 1 = the arriving ones are fully in place. */
function applyTransition(w) {
  const holder = document.querySelector('.proj-holder');
  const out = holder.querySelector('.proj-layer-out > .proj-body');
  const base = holder.querySelector(':scope > .proj-panel > .proj-body');
  resetPieces(out);
  resetPieces(base);
  if (!out) return;
  const outs = bodyPieces(out);
  const ins = bodyPieces(base);

  const leaveEnd = 0.58;                       // the old is gone by here, the new starts after
  const L = clamp01(w / leaveEnd);
  const A = clamp01((w - (1 - leaveEnd)) / leaveEnd);

  outs.forEach((el, k) => {
    const l = ease(clamp01((L - k * 0.09) / (1 - 0.09 * (outs.length - 1))));
    el.style.transform = `translate3d(0, ${(-l * 34).toFixed(1)}px, 0)`;
    el.style.opacity = (1 - l).toFixed(3);
  });
  ins.forEach((el, k) => {
    const a = ease(clamp01((A - k * 0.09) / (1 - 0.09 * (ins.length - 1))));
    el.style.transform = `translate3d(0, ${((1 - a) * 34).toFixed(1)}px, 0)`;
    el.style.opacity = a.toFixed(3);
  });
}

function clearTransition() {
  const holder = document.querySelector('.proj-holder');
  if (!holder) return;
  resetPieces(holder.querySelector(':scope > .proj-panel > .proj-body'));
}

function wireProjectScroll() {
  const track = document.querySelector('.proj-scroll');
  const ticks = document.querySelector('.proj-ticks');
  if (!track) return;
  const n = projectList.length;

  track.style.height = `${n * 100}vh`;
  if (ticks) ticks.innerHTML = projectList.map(() => '<span class="proj-tick"></span>').join('');
  renderBase(0);

  if (reduceMotion) {
    ScrollTrigger.create({ trigger: track, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: (s) => renderBase(Math.min(Math.floor(s.progress * n), n - 1)) });
    return;
  }

  ScrollTrigger.create({
    trigger: track,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = Math.min(self.progress, 0.9999) * n;
      const i = Math.floor(p);
      const frac = p - i;
      const wipeStart = 1 - WIPE_ZONE;
      if (frac > wipeStart && i < n - 1) {
        renderBase(i + 1);
        setOutgoing(i);
        applyTransition((frac - wipeStart) / WIPE_ZONE);
      } else {
        renderBase(i);
        setOutgoing(-1);
        clearTransition();
      }
    },
  });
}

async function initProjects() {
  const holder = document.querySelector('.proj-holder');
  if (!holder) return;
  try {
    const res = await fetch('projects.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`projects.json ${res.status}`);
    const { projects } = await res.json();
    projectData = Object.fromEntries(projects.map((p) => [p.id, projectModal(p)]));
    projectList = projects;
    wireProjectScroll();
    ScrollTrigger.refresh();
  } catch (err) {
    // Leave the rail empty rather than half-built, and say why in the console.
    console.error('Could not load projects.json —', err.message);
  }
}
initProjects();

// Dynamically assign brand class names to skill items based on their label text
document.querySelectorAll('.skill-item').forEach(item => {
  const label = item.querySelector('.skill-label');
  if (label) {
    let text = label.textContent.trim().toLowerCase()
      .replace(' / ', '-')
      .replace('/', '-')
      .replace(' ', '-');
    if (text === 'c-c++') text = 'cpp';
    item.classList.add(text);
  }
});

// Cursor scrubbing/coloring effect for project card headings (Emil Kowalski style spring/lerp motion)
class CanvasTextScribbler {
  constructor(heading) {
    this.heading = heading;
    this.text = heading.textContent.trim();
    this.points = [];
    this.isHovered = false;
    this.fadeOpacity = 0;
    this.animating = false;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'doodle-text-canvas';
    this.ctx = this.canvas.getContext('2d');
    
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    
    this.heading.appendChild(this.canvas);
    this.heading.style.color = 'transparent';
    this.heading.style.position = 'relative';
    this.heading.style.display = 'inline-block';
    
    this.init();
    this.bindEvents();
  }
  
  init() {
    const rect = this.heading.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Headroom matters: the canvas is sized from the heading's advance width, and
    // canvas.width truncates to a whole pixel. Without slack the usable width can land a
    // fraction under the real text width, which makes getWrappedLines() push the final
    // word onto a second line that falls outside the one-line-tall canvas and disappears.
    const st = window.getComputedStyle(this.heading);
    this.padX = Math.max(8, parseFloat(st.fontSize) * 0.2);
    // the headline face's ascenders overshoot the em box, so a canvas exactly line-height
    // tall slices the tops off tall letters. Give it vertical headroom too.
    this.padY = Math.max(6, parseFloat(st.fontSize) * 0.22);

    // Size from the metrics of the text we are about to draw, not from the element box.
    // Those are two separate measurements that have to agree, and when they disagree by a
    // fraction the wrap logic drops the final word onto an invisible second line.
    const probe = document.createElement('canvas').getContext('2d');
    probe.font = `${st.fontWeight} ${st.fontSize} ${st.fontFamily}`;
    const textW = probe.measureText(this.text).width;
    // A heading that occupies one line in the DOM must stay one line on the canvas.
    this.singleLine = rect.height < parseFloat(st.fontSize) * 2;
    const w = Math.ceil(Math.max(rect.width, textW)) + this.padX * 2;

    const hh = Math.ceil(rect.height) + this.padY * 2;
    this.canvas.width = Math.ceil(w * dpr);
    this.canvas.height = Math.ceil(hh * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${hh}px`;
    this.canvas.style.left = `${-this.padX}px`;
    this.canvas.style.top = `${-this.padY}px`;
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
    
    const style = window.getComputedStyle(this.heading);
    this.fontFamily = style.fontFamily;
    this.fontSize = style.fontSize;
    this.fontWeight = style.fontWeight;
    this.textAlign = style.textAlign || 'left';
    
    let lh = parseFloat(style.lineHeight);
    if (isNaN(lh)) {
      lh = parseFloat(style.fontSize) * 1.35;
    }
    this.lineHeight = lh;
    
    this.draw();
  }
  
  bindEvents() {
    this.heading.addEventListener('mouseenter', (e) => {
      this.isHovered = true;
      this.fadeOpacity = 1;
      const rect = this.heading.getBoundingClientRect();
      this.targetX = e.clientX - rect.left;
      this.targetY = e.clientY - rect.top;
      this.brushX = this.targetX;
      this.brushY = this.targetY;
      this.points = [{ x: this.brushX, y: this.brushY }];
      this.startLoop();
    });
    
    this.heading.addEventListener('mousemove', (e) => {
      if (!this.isHovered) return;
      const rect = this.heading.getBoundingClientRect();
      this.targetX = e.clientX - rect.left;
      this.targetY = e.clientY - rect.top;
    });
    
    this.heading.addEventListener('mouseleave', () => {
      this.isHovered = false;
    });
    
    window.addEventListener('resize', () => {
      setTimeout(() => this.init(), 50);
    });
  }
  
  startLoop() {
    if (this.animating) return;
    this.animating = true;
    const tick = () => {
      this.update();
      this.draw();
      if (this.animating) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }
  
  update() {
    if (this.isHovered) {
      const dx = this.targetX - this.brushX;
      const dy = this.targetY - this.brushY;
      
      if (Math.hypot(dx, dy) > 0.5) {
        this.brushX += dx * 0.15;
        this.brushY += dy * 0.15;
        this.points.push({ x: this.brushX, y: this.brushY });
        
        if (this.points.length > 800) {
          this.points.shift();
        }
      }
    } else {
      this.fadeOpacity -= 0.05;
      if (this.fadeOpacity <= 0) {
        this.fadeOpacity = 0;
        this.points = [];
        this.animating = false;
      }
    }
  }
  
  draw() {
    // Read the CSS size directly. init() sizes the backing store with a dpr clamped to 2,
    // so dividing by the raw devicePixelRatio here disagreed whenever it exceeded 2 — the
    // centred text was then drawn left of true centre and the first letter ran off the edge.
    const width = parseFloat(this.canvas.style.width);
    const height = parseFloat(this.canvas.style.height);
    const ctx = this.ctx;
    
    ctx.clearRect(0, 0, width, height);
    if (width === 0 || height === 0) return;
    
    const rootStyles = window.getComputedStyle(document.documentElement);
    const currentInk = rootStyles.getPropertyValue('--ink').trim() || '#1c1812';
    const currentYellow = rootStyles.getPropertyValue('--scribble').trim()
      || rootStyles.getPropertyValue('--yellow').trim() || '#e0b000';
    
    ctx.font = `${this.fontWeight} ${this.fontSize} ${this.fontFamily}`;
    ctx.textBaseline = 'top';
    ctx.textAlign = this.textAlign;
    
    const pad = this.padX || 0;
    const lines = this.singleLine ? [this.text] : this.getWrappedLines(width - pad * 2);

    // Belt and braces: if wrapping ever produces more lines than the canvas is tall, grow
    // it and redraw. Without this a wrapped line is painted below the canvas and vanishes,
    // which reads as the heading losing its last word.
    const needed = lines.length * this.lineHeight;
    if (needed > height + 1 && !this._grew) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this._grew = true;
      this.canvas.height = Math.ceil(needed * dpr);
      this.canvas.style.height = `${needed}px`;
      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);
      this.draw();
      this._grew = false;
      return;
    }
    
    ctx.fillStyle = currentInk;
    lines.forEach((line, index) => {
      let x = pad;
      if (this.textAlign === 'center') x = width / 2;
      else if (this.textAlign === 'right') x = width - pad;
      ctx.fillText(line, x, (this.padY || 0) + index * this.lineHeight);
    });
    
    if (this.points.length > 0 && this.fadeOpacity > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-atop';
      
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 42;
      ctx.strokeStyle = currentYellow;
      ctx.globalAlpha = this.fadeOpacity;
      
      if (this.points.length === 1) {
        ctx.arc(this.points[0].x, this.points[0].y, 21, 0, Math.PI * 2);
        ctx.fillStyle = currentYellow;
        ctx.fill();
      } else {
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
          ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.stroke();
      }
      
      ctx.restore();
    }
  }
  
  getWrappedLines(maxWidth) {
    const words = this.text.split(/\s+/);
    let line = '';
    const lines = [];
    
    this.ctx.font = `${this.fontWeight} ${this.fontSize} ${this.fontFamily}`;
    
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = this.ctx.measureText(testLine.trim());
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());
    return lines;
  }
}

// Skip the title scribble on phones. The hover query alone isn't enough: a desktop
// window resized to phone width still reports hover:hover, so match the 760px
// breakpoint the rest of the stylesheet uses.
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && window.matchMedia('(min-width: 761px)').matches) {
  // Wait for webfonts: the scribbler paints its canvas once in the constructor, so building
  // it early bakes in a fallback face and it never repaints.
  document.fonts.ready.then(() => {
    document.querySelectorAll('.chapter-title').forEach(heading => {
      new CanvasTextScribbler(heading);
    });
  });
}

modal.querySelector('.project-modal-close').addEventListener('click', closeProjectModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeProjectModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeProjectModal();
});

/* ---------- mobile nav trigger ---------- */
const menuBtn = document.querySelector('.mobile-menu-btn');
const mobileNav = document.querySelector('.mobile-nav');
const mobileNavClose = document.querySelector('.mobile-nav-close');
mobileNav.inert = true;
function openMobileNav() {
  mobileNav.classList.add('active');
  mobileNav.inert = false;
  document.body.style.overflow = 'hidden';
  if (siteNav) siteNav.inert = true;
  if (scrollWrapperEl) scrollWrapperEl.inert = true;
  mobileNavClose.focus();
}
function closeMobileNav() {
  mobileNav.classList.remove('active');
  mobileNav.inert = true;
  document.body.style.overflow = '';
  if (siteNav) siteNav.inert = false;
  if (scrollWrapperEl) scrollWrapperEl.inert = false;
  menuBtn.focus();
}
/* Anchor links were doing a native jump — measured 0 -> 5701px in a single frame. That
   skips the whole scroll choreography and leaves Lenis's internal position out of sync with
   the real scrollY, so the next wheel event lurches. Route them through Lenis instead.
   Page travel is spatial explanation, not UI chrome, so it gets a longer curve than 300ms. */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (!id || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis && !reduceMotion) {
      lenis.scrollTo(target, { offset: -24, duration: 1.1 });
    } else {
      target.scrollIntoView();
    }
    history.replaceState(null, '', id);   // keep the URL honest without a second jump
  });
});

menuBtn.addEventListener('click', openMobileNav);
mobileNavClose.addEventListener('click', closeMobileNav);
mobileNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMobileNav);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileNav.classList.contains('active')) closeMobileNav();
});

/* ---------- scroll progress bar & celestial canvas drawing logic ---------- */

const canvas = document.getElementById('celestial-canvas');
let ctx = canvas.getContext('2d');
const decorCanvas = document.getElementById('decor-canvas');
const decorCtx = decorCanvas.getContext('2d');
let lastDecorBlur = -1;
const LOGO_FONT = '"Sirukota", cursive';   // must match --font-head in the CSS above
const logoCanvas = document.getElementById('logo-canvas');
const logoCtx = logoCanvas.getContext('2d');

let dpr = Math.min(window.devicePixelRatio || 1, 2);
let width = window.innerWidth;
let height = window.innerHeight;

// Optimization caches to avoid DOM writes / layout thrashing
let lastLogoX = -1;
let lastLogoY = -1;
let lastLogoSize = -1;
let lastLogoTransition = -1;

let mouseX = -1000;
let mouseY = -1000;
let lastMouseX = -1000;
let lastMouseY = -1000;
let logoHoverScale = 1.0;
let logoTilt = 0;
let lastLogoHoverScale = 1.0;
let lastLogoTilt = 0;
let glitchFrameCount = 0;
let lastIsHoveredState = false;
let lastBlinkState = false;

// Pseudo-random seeded generator for organic, 12fps sketch jitter
let seed = 1;
let jitterSeed = 0;
// The horizon is generated once per viewport size with a fixed seed, so it never
// joins the 12fps sketch boil the rest of the scene runs on.
let horizonStrokeCache = null;
let horizonStrokeKey = '';

// The sun's path on the water is a fixed constellation of marker strokes, laid out once
// per viewport. Re-rolling it every frame is what made it strobe; now each glint only
// sways on its own slow phase, the way light actually sits on a swell.
let glintCache = null;
let glintKey = '';
function buildGlints(width, seaHeight) {
  const glints = [];
  seed = 90210;                                  // repeatable layout, not frame noise
  const rows = Math.max(6, Math.floor(seaHeight / 12));
  for (let i = 0; i < rows; i++) {
    // rows drift off a perfect ladder — an even grid is what reads as machine-made
    const depth = Math.min(1, Math.max(0, i / (rows - 1) + (seededRandom() - 0.5) * 0.09));
    const spread = 20 + depth * 200;             // narrow at the horizon, fanning toward you
    const count = 2 + Math.floor(seededRandom() * (2 + depth * 6));
    for (let d = 0; d < count; d++) {
      const bias = (seededRandom() + seededRandom() - 1);   // clusters near the centre line
      glints.push({
        depth,
        x: bias * spread,
        len: (12 + depth * 42) * (0.45 + seededRandom() * 0.85),
        tilt: (seededRandom() - 0.5) * 0.13,     // no two marker dashes sit perfectly level
        kink: (seededRandom() - 0.5) * 3.4,      // the stroke bends, it isn't a ruled line
        phase: seededRandom() * 6.283,
        speed: 0.00035 + seededRandom() * 0.0007,
        sway: 4 + seededRandom() * 13
      });
    }
  }
  return glints;
}
let lastJitterUpdate = 0;

function seededRandom() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Static watercolor sky gradient stops
const skyStops = ['#8cb5e1', '#b9d5f3', '#f3ede0'];
// Late-afternoon Mediterranean: pink into peach into warm sand. Deliberately light —
// this is Anfeh at golden hour, not night.
const sunsetStops = ['#eda3b0', '#f9c6a4', '#ffe8d2'];
const seaStops = ['#7fb3bd', '#3f8aa6', '#256781'];
const mix = (a, b, k) => {
  const A = parseColor(a), B = parseColor(b);
  return `rgb(${Math.round(A.r + (B.r - A.r) * k)}, ${Math.round(A.g + (B.g - A.g) * k)}, ${Math.round(A.b + (B.b - A.b) * k)})`;
};

function parseColor(color) {
  if (color.startsWith('#')) {
    let hex = color.substring(1);
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }
  const match = color.match(/\d+/g);
  if (match) return { r: parseInt(match[0]), g: parseInt(match[1]), b: parseInt(match[2]) };
  return { r: 255, g: 255, b: 255 };
}

// Static cloud/bird colors (previously interpolated between day/night states)
const cloudFillColor = parseColor('#ffffff');
const cloudStrokeColor = parseColor('#1c1812');
const birdColor = parseColor('#1c1812');

// Sketched path generator (used to pre-calculate paths)
function generateSketchedPath(points, jitter = 1.2, strokeCount = 2, close = false) {
  const strokes = [];
  for (let s = 0; s < strokeCount; s++) {
    const strokePoints = [];
    if (points.length < 2) continue;

    seed = jitterSeed + s * 300;

    const startJitterX = (seededRandom() - 0.5) * jitter;
    const startJitterY = (seededRandom() - 0.5) * jitter;
    strokePoints.push({ x: points[0].x + startJitterX, y: points[0].y + startJitterY });

    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.floor(len / 36));

      for (let k = 1; k <= steps; k++) {
        const t = k / steps;
        const px = p1.x + dx * t;
        const py = p1.y + dy * t;
        const jx = (seededRandom() - 0.5) * jitter;
        const jy = (seededRandom() - 0.5) * jitter;
        strokePoints.push({ x: px + jx, y: py + jy });
      }
    }

    if (close) {
      const p1 = points[points.length - 1];
      const p2 = points[0];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.floor(len / 12));
      for (let k = 1; k <= steps; k++) {
        const t = k / steps;
        const px = p1.x + dx * t;
        const py = p1.y + dy * t;
        const jx = (seededRandom() - 0.5) * jitter;
        const jy = (seededRandom() - 0.5) * jitter;
        strokePoints.push({ x: px + jx, y: py + jy });
      }
    }
    strokes.push(strokePoints);
  }
  return strokes;
}

// Sketched path renderer for pre-calculated paths
function drawCachedStrokes(strokes, color, width, targetCtx = ctx, close = false) {
  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = width;
  targetCtx.lineCap = 'round';
  targetCtx.lineJoin = 'round';
  
  strokes.forEach(strokePoints => {
    targetCtx.beginPath();
    if (strokePoints.length < 2) return;
    targetCtx.moveTo(strokePoints[0].x, strokePoints[0].y);
    for (let i = 1; i < strokePoints.length; i++) {
      targetCtx.lineTo(strokePoints[i].x, strokePoints[i].y);
    }
    if (close) {
      targetCtx.closePath();
    }
    targetCtx.stroke();
  });
}

// Dynamic sketched path drawing function (used for birds)
function drawSketchedPath(points, color, width, jitter = 1.2, strokeCount = 2, close = false, targetCtx = ctx) {
  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = width;
  targetCtx.lineCap = 'round';
  targetCtx.lineJoin = 'round';

  for (let s = 0; s < strokeCount; s++) {
    targetCtx.beginPath();
    if (points.length < 2) return;

    seed = jitterSeed + s * 300;

    const startJitterX = (seededRandom() - 0.5) * jitter;
    const startJitterY = (seededRandom() - 0.5) * jitter;
    targetCtx.moveTo(points[0].x + startJitterX, points[0].y + startJitterY);

    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.floor(len / 36));

      for (let k = 1; k <= steps; k++) {
        const t = k / steps;
        const px = p1.x + dx * t;
        const py = p1.y + dy * t;
        const jx = (seededRandom() - 0.5) * jitter;
        const jy = (seededRandom() - 0.5) * jitter;
        targetCtx.lineTo(px + jx, py + jy);
      }
    }

    if (close) {
      const p1 = points[points.length - 1];
      const p2 = points[0];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.floor(len / 12));
      for (let k = 1; k <= steps; k++) {
        const t = k / steps;
        const px = p1.x + dx * t;
        const py = p1.y + dy * t;
        const jx = (seededRandom() - 0.5) * jitter;
        const jy = (seededRandom() - 0.5) * jitter;
        targetCtx.lineTo(px + jx, py + jy);
      }
      targetCtx.closePath();
    }
    targetCtx.stroke();
  }
}

// Sketched flapping bird drawing function
function drawSketchedBird(bx, by, size, flap, color, opacity) {
  const strokeColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const strokeCount = 2;
  for (let s = 0; s < strokeCount; s++) {
    seed = jitterSeed + s * 180;

    const leftX = bx - size;
    const leftY = by - size * 0.25 + flap * size * 0.45;
    const rightX = bx + size;
    const rightY = by - size * 0.25 + flap * size * 0.45;

    const ctrlLeftX = bx - size * 0.5;
    const ctrlLeftY = by - size * 0.65 - flap * size * 0.15;
    const ctrlRightX = bx + size * 0.5;
    const ctrlRightY = by - size * 0.65 - flap * size * 0.15;

    // Draw left wing curve
    drawSketchedPath([
      { x: leftX, y: leftY },
      { x: ctrlLeftX, y: ctrlLeftY },
      { x: bx, y: by }
    ], strokeColor, 1.4, 1.0, 1);

    // Draw right wing curve
    drawSketchedPath([
      { x: bx, y: by },
      { x: ctrlRightX, y: ctrlRightY },
      { x: rightX, y: rightY }
    ], strokeColor, 1.4, 1.0, 1);
  }
}

// Drifting Clouds Config
// bx/by are resting positions as fractions of the viewport, so resize can restore them
const cloudSpec = [
  { bx: 0.30, by: 0.09, scale: 1.32, speed: 0.19 },
  { bx: 0.03, by: 0.04, scale: 0.92, speed: 0.15 },
  { bx: 0.54, by: 0.22, scale: 1.46, speed: 0.11 },
  { bx: 0.42, by: 0.03, scale: 0.86, speed: 0.27 },
  { bx: 0.83, by: 0.08, scale: 1.34, speed: 0.17 },
  { bx: 0.67, by: 0.33, scale: 1.30, speed: 0.13 },
  { bx: 0.97, by: 0.26, scale: 0.90, speed: 0.24 },
  { bx: 0.18, by: 0.29, scale: 0.84, speed: 0.29 },
  { bx: 0.90, by: 0.02, scale: 1.00, speed: 0.21 },
  { bx: 0.09, by: 0.18, scale: 0.78, speed: 0.31 },
];
const clouds = cloudSpec.map((c) => ({ ...c, x: width * c.bx, y: height * c.by }));

// Hand-drawn sketched sun, parked in the upper sky
const sun = { x: width * 0.15, y: height * 0.24, radius: 46 };

// Hand-drawn Flapping Birds Setup
const birds = [
  { x: width * 0.2, y: height * 0.28, size: 13, speedX: 0.7, flapSpeed: 0.05, phase: 0 },
  { x: width * 0.55, y: height * 0.22, size: 16, speedX: 0.55, flapSpeed: 0.04, phase: Math.PI * 0.5 },
  { x: width * 0.85, y: height * 0.32, size: 11, speedX: 0.9, flapSpeed: 0.07, phase: Math.PI }
];

/* ---------- sky-to-ground scroll scene ---------- */
const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);




// Dynamic Sketch Path Cache definition
const pathCache = {
  clouds: [],
  sun: { circle: [], rays: [] }
};

// Generates wobbly lines/circles once and stores them, updating only on resize or at 12fps
function updateCachedPaths() {
  // Clouds pre-rendering (local coordinates)
  pathCache.clouds = clouds.map(cloud => {
    const circles = [
      { dx: -58, dy: 10, r: 27 },
      { dx: -34, dy: -8, r: 35 },
      { dx: -8,  dy: -20, r: 40 },
      { dx: 20,  dy: -11, r: 35 },
      { dx: 46,  dy: 4,  r: 29 },
      { dx: 66,  dy: 14, r: 22 },
      { dx: 12,  dy: 16, r: 31 },
      { dx: -22, dy: 18, r: 29 }
    ];
    
    const isMobile = width < 760;
    const finalScale = isMobile ? cloud.scale * 0.52 : cloud.scale;
    
    return {
      scale: finalScale,
      circles: circles.map(c => {
        // no outline any more, so no sketched path to generate
        return { dx: c.dx, dy: c.dy, r: c.r };
      })
    };
  });

  // Sun: sketchy disc outline + radiating rays (local coordinates, drawn around 0,0)
  const sunCirclePoints = [];
  const sunSteps = Math.max(12, Math.floor(2 * Math.PI * sun.radius / 30));
  for (let i = 0; i <= sunSteps; i++) {
    const angle = (i / sunSteps) * Math.PI * 2;
    sunCirclePoints.push({ x: Math.cos(angle) * sun.radius, y: Math.sin(angle) * sun.radius });
  }
  pathCache.sun.circle = generateSketchedPath(sunCirclePoints, 1.4, 1, true);

  const rayCount = 10;
  pathCache.sun.rays = [];
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2;
    const innerR = sun.radius + 8;
    const outerR = sun.radius + 20;
    pathCache.sun.rays.push(generateSketchedPath([
      { x: Math.cos(angle) * innerR, y: Math.sin(angle) * innerR },
      { x: Math.cos(angle) * outerR, y: Math.sin(angle) * outerR }
    ], 1.0, 1)[0]);
  }
}

function drawSketchedCloudCached(cloudIndex, cx, cy, opacity) {
  const fillParsed = cloudFillColor;
  ctx.fillStyle = `rgba(${fillParsed.r}, ${fillParsed.g}, ${fillParsed.b}, ${Math.min(opacity * 1.2, 1) * 0.97})`;

  const cachedCloud = pathCache.clouds[cloudIndex];
  if (!cachedCloud) return;

  // Clean silhouettes — no outlines at all, so there is no interior lattice to see.
  ctx.beginPath();
  cachedCloud.circles.forEach(c => {
    ctx.arc(cx + c.dx * cachedCloud.scale, cy + c.dy * cachedCloud.scale, c.r * cachedCloud.scale, 0, Math.PI * 2);
  });
  ctx.fill();
}

function drawSun(targetCtx, cx, cy, opacity, time, scale = 1) {
  if (opacity < 0.01) return;
  const pulse = (0.85 + Math.sin(time * 0.0012) * 0.15) * scale; // slow gentle breathing glow, scaled when docking

  targetCtx.save();
  targetCtx.translate(cx, cy);

  // Soft radial glow behind the disc
  const glowR = sun.radius * 2.6 * pulse;
  const glow = targetCtx.createRadialGradient(0, 0, sun.radius * 0.4 * scale, 0, 0, glowR);
  glow.addColorStop(0, `rgba(255, 212, 0, ${0.35 * opacity})`);
  glow.addColorStop(1, 'rgba(255, 212, 0, 0)');
  targetCtx.fillStyle = glow;
  targetCtx.beginPath();
  targetCtx.arc(0, 0, glowR, 0, Math.PI * 2);
  targetCtx.fill();

  // Sketchy radiating rays, slowly rotating
  targetCtx.save();
  targetCtx.rotate(time * 0.00006);
  targetCtx.scale(scale, scale);
  pathCache.sun.rays.forEach(ray => {
    drawCachedStrokes([ray], `rgba(243, 94, 7, ${opacity * 0.55})`, 2 / scale, targetCtx);
  });
  targetCtx.restore();

  // Sun disc fill + sketchy outline (scaled together so they breathe in sync)
  targetCtx.save();
  targetCtx.scale(pulse, pulse);
  targetCtx.beginPath();
  targetCtx.arc(0, 0, sun.radius, 0, Math.PI * 2);
  targetCtx.fillStyle = `rgba(255, 212, 0, ${opacity})`;
  targetCtx.fill();
  drawCachedStrokes(pathCache.sun.circle, `rgba(28, 24, 18, ${opacity * 0.7})`, 1.6 / pulse, targetCtx, true);
  targetCtx.restore();

  targetCtx.restore();
}

// ScrollTrigger state management variable
let scrollTriggerLogoTransition;

function setupScrollTriggers() {
  if (scrollTriggerLogoTransition) scrollTriggerLogoTransition.kill();

  // Name logo transition (Centered sun -> docked moon)
  scrollTriggerLogoTransition = ScrollTrigger.create({
    trigger: document.documentElement,
    start: "top top",
    end: 450,
    scrub: 0.85,
    onUpdate: (self) => {
      state.logoTransition = self.progress;
    }
  });
}

// Resize recalculates coordinates & rebuilds caches/triggers
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;

  decorCanvas.width = width * dpr;
  decorCanvas.height = height * dpr;
  decorCtx.setTransform(1, 0, 0, 1, 0, 0);
  decorCtx.scale(dpr, dpr);

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  logoCanvas.width = width * dpr;
  logoCanvas.height = height * dpr;
  logoCtx.scale(dpr, dpr);

  
  clouds.forEach((c) => { c.x = width * c.bx; c.y = height * c.by; });
  sun.x = width * 0.15;
  sun.y = height * 0.24;
  if (birds && birds.length >= 3) {
    birds[0].x = width * 0.2; birds[0].y = height * 0.28;
    birds[1].x = width * 0.55; birds[1].y = height * 0.22;
    birds[2].x = width * 0.85; birds[2].y = height * 0.32;
  }

  updateCachedPaths();
  setupScrollTriggers();
}

let resizeDebounceId;
window.addEventListener('resize', () => {
  clearTimeout(resizeDebounceId);
  resizeDebounceId = setTimeout(resize, 150);
});

window.addEventListener('pointermove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});
window.addEventListener('pointerleave', () => {
  mouseX = -1000;
  mouseY = -1000;
});
logoCanvas.addEventListener('click', () => {
  if (window.lenis) {
    window.lenis.scrollTo(0);
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

document.fonts.ready.then(() => {
  resize();
});

// Scramble helper for matrix transition on hover
const matrixChars = "01<>/_[]$#@%&*?+=!x-";
function getScrambledText(targetText, frameCount, totalFrames = 12) {
  if (frameCount <= 0) return targetText;
  let result = "";
  const progress = (totalFrames - frameCount) / totalFrames;
  for (let i = 0; i < targetText.length; i++) {
    if (Math.random() > progress * 1.25 && targetText[i] !== ' ') {
      result += matrixChars[Math.floor(Math.random() * matrixChars.length)];
    } else {
      result += targetText[i];
    }
  }
  return result;
}

// Main Draw Loop
function draw(rafTime) {
  // Every ambient motion in the scene reads `time`; the scroll choreography reads scrollTop.
  // Freezing the clock under prefers-reduced-motion stops the drift, flapping, shimmer and
  // sketch boil while leaving the scroll-driven sunset fully intact.
  const time = reduceMotion ? 0 : rafTime;
  state.time = time;
  ctx.clearRect(0, 0, width, height);
  const scrollTop = window.scrollY;

  // Sky-to-ground scroll progress (0 = top of page, 1 = bottom)
  const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
  const rawProgress = scrollMax > 0 ? Math.min(Math.max(scrollTop / scrollMax, 0), 1) : 0;
  const sceneProgress = easeInOutQuad(rawProgress);

  // 1. Draw watercolor sky background; gradient's middle stop migrates downward as we descend
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  const skyMidStop = Math.min(0.6 + sceneProgress * 0.35, 0.95);
  // how far into the sunset we are — eased so the turn is gradual, capped short of full
  // saturation so the page never gets dark
  const duskT = Math.min(Math.max((rawProgress - 0.12) / 0.62, 0), 1);
  const dusk = duskT * duskT * (3 - 2 * duskT) * 0.92;
  grad.addColorStop(0, mix(skyStops[0], sunsetStops[0], dusk));
  grad.addColorStop(skyMidStop, mix(skyStops[1], sunsetStops[1], dusk));
  grad.addColorStop(1, mix(skyStops[2], sunsetStops[2], dusk));

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Trigger wobbly sketch jitter state swap at 12fps (80ms interval) on desktop.
  // Disabled on mobile to prevent garbage collection spikes and keep fast scrolls fluid.
  if (!isMobile && (time - lastJitterUpdate > 80)) {
    jitterSeed = Math.random() * 5000;
    lastJitterUpdate = time;
    updateCachedPaths();
  }

  // 1b, 2 & 3. Draw the ambient sun, clouds and birds, fading out as we descend below them
  const skyFade = 1 - Math.min(Math.max((sceneProgress - 0.3) / 0.2, 0), 1);
  // Clouds and birds stay for the whole page but soften as you descend, so they read as
  // depth behind the content instead of competing with it. One number to tune:
  const DECOR_MAX_BLUR_PX = 14;
  const decorBlur = DECOR_MAX_BLUR_PX * Math.min(Math.max(rawProgress, 0), 1);
  {
    // Blur the element, not the context: WebKit ignores canvas ctx.filter entirely.
    if (Math.abs(decorBlur - lastDecorBlur) > 0.05) {
      decorCanvas.style.filter = decorBlur > 0.1 ? `blur(${decorBlur.toFixed(2)}px)` : 'none';
      lastDecorBlur = decorBlur;
    }
    decorCtx.clearRect(0, 0, width, height);
    // The decor helpers all draw to the module-level ctx, so point it at the decor canvas
    // for this block rather than threading a target through four call layers.
    const mainCtx = ctx;
    ctx = decorCtx;
    // Scroll opens the sky: the clouds draw apart and thin out, while the sun climbs to
    // the top centre. The blur ramp above is untouched — this is position and opacity only.

    // Two clocks. The clouds run on scroll distance so they part early no matter how long
    // the page gets; the sun keeps to overall page progress so it lands up top at the end.
    const cloudT = Math.min(Math.max(scrollTop / (height * 1.15), 0), 1);
    const cloudEase = cloudT * cloudT * (3 - 2 * cloudT);

    const sunT = Math.min(Math.max(rawProgress / 0.85, 0), 1);
    const sunEase = sunT * sunT * (3 - 2 * sunT);

    // the sun slides to centre and sinks to meet the sea
    const sunX = sun.x + (width * 0.5 - sun.x) * sunEase;
    const sunY = sun.y + (height * 0.60 - sun.y) * sunEase;
    drawSun(decorCtx, sunX, sunY, 0.9, time);

    const ease = cloudEase;
    const cloudAlpha = 0.75 * (1 - ease);
    if (cloudAlpha > 0.004) {
      clouds.forEach((cloud, index) => {
        if (!reduceMotion) cloud.x += cloud.speed;
        if (cloud.x > width + 120) {
          cloud.x = -120 - Math.random() * 180;
          cloud.y = height * (0.05 + Math.random() * 0.20);
        }
        // each cloud is shoved toward whichever edge it already favours
        const side = cloud.bx < 0.5 ? -1 : 1;
        const bias = 0.45 + Math.abs(cloud.bx - 0.5);    // outer clouds leave faster
        const part = side * width * bias * ease;
        drawSketchedCloudCached(index, cloud.x + part, cloud.y, cloudAlpha);
      });
    }

    birds.forEach(bird => {
      if (!reduceMotion) bird.x += bird.speedX;
      if (bird.x > width + 50) {
        bird.x = -50;
        bird.y = height * (0.12 + Math.random() * 0.35);
      }

      const flap = Math.sin(time * bird.flapSpeed + bird.phase);
      drawSketchedBird(bird.x, bird.y, bird.size, flap, birdColor, 0.75);
    });
    ctx = mainCtx; // hand the sky canvas back before anything else draws
  }

  // The sea occupies the lower third, fading in as you descend. Drawn on the sky canvas
  // so the sun's glitter can sit on top of it.
  const seaReveal = Math.min(Math.max((rawProgress - 0.45) / 0.4, 0), 1);
  const seaEase = seaReveal * seaReveal * (3 - 2 * seaReveal);
  // A real horizon doesn't slide. The sea sits at a fixed waterline and fades in
  // instead of rising, so the line never travels up the screen.
  const seaHeight = 0.38 * height;
  const horizonY = height - seaHeight;

  if (seaEase > 0.01) {
    ctx.save();
    ctx.globalAlpha = seaEase;
    const seaGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    const seaTop = parseColor(mix(seaStops[0], '#e8b391', dusk * 0.55));  // warm at the horizon
    // feather the top ~5% so sky meets water in a soft band, not a hard cut
    seaGrad.addColorStop(0, `rgba(${seaTop.r}, ${seaTop.g}, ${seaTop.b}, 0)`);
    seaGrad.addColorStop(0.05, `rgb(${seaTop.r}, ${seaTop.g}, ${seaTop.b})`);
    seaGrad.addColorStop(0.45, seaStops[1]);
    seaGrad.addColorStop(1, seaStops[2]);
    ctx.fillStyle = seaGrad;
    ctx.fillRect(0, horizonY, width, seaHeight);

    // the sun's path on the water
    const seaKey = width + 'x' + height;
    if (glintKey !== seaKey) {
      glintCache = buildGlints(width, seaHeight);
      glintKey = seaKey;
    }
    const glowX = width * 0.5;
    ctx.lineCap = 'round';
    for (const g of glintCache) {
      const alpha = (1 - g.depth * 0.75) * 0.6 * (0.35 + dusk * 0.65);
      if (alpha < 0.012) continue;
      const y = horizonY + g.depth * seaHeight;
      const cx = glowX + g.x + Math.sin(time * g.speed + g.phase) * g.sway;
      const half = g.len * 0.5 * (0.85 + Math.sin(time * g.speed * 1.7 + g.phase) * 0.15);
      const dy = half * g.tilt;
      ctx.beginPath();
      ctx.moveTo(cx - half, y - dy);
      ctx.quadraticCurveTo(cx, y + g.kink, cx + half, y + dy);
      // one wide soft pass under a tighter core — canvas has no blur in WebKit
      ctx.strokeStyle = `rgba(255, 228, 186, ${(alpha * 0.26).toFixed(3)})`;
      ctx.lineWidth = 7 + g.depth * 7;
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 240, 214, ${(alpha * 0.42).toFixed(3)})`;
      ctx.lineWidth = 2.5 + g.depth * 2.5;
      ctx.stroke();
    }
    ctx.restore();
  }
  if (cachedFooter) {
    // Gate on the last piece of visible contact content, not the section box — the box runs
    // far below its own text, which cost a screenful of dead scroll to clear. Measured
    // against the boat's own top, so overlap still can't happen.
    const linksRect = cachedContactLinks && cachedContactLinks.getBoundingClientRect();
    const wanted = linksRect && linksRect.bottom < cachedFooter.getBoundingClientRect().top - 32 ? 1 : 0;
    if (wanted !== lastFooterOn) {
      cachedFooter.style.opacity = wanted;
      // the bob (and the SVG filter it drags along) only runs while the boat is visible
      cachedFooter.classList.toggle('is-sailing', wanted === 1);
      lastFooterOn = wanted;
    }
  }

  // Horizon line fades in with the sea, at the same fixed waterline.
  const horizonAlpha = seaEase;
  if (horizonAlpha > 0.01) {
    const key = width + 'x' + height;
    if (horizonStrokeKey !== key) {
      const prevSeed = jitterSeed;
      jitterSeed = 1337;
      horizonStrokeCache = generateSketchedPath([
        { x: -20, y: horizonY },
        { x: width * 0.3, y: horizonY - 4 },
        { x: width * 0.6, y: horizonY + 3 },
        { x: width + 20, y: horizonY }
      ], 2.5, 2);
      jitterSeed = prevSeed;
      horizonStrokeKey = key;
    }
    const horizonStrokes = horizonStrokeCache;
    // ctx.filter is a no-op in WebKit, so the blur is faked: wide faint passes
    // underneath a narrow one. Reads soft instead of inked.
    const ink = horizonAlpha * 0.6;
    for (const [w, k] of [[26, 0.045], [19, 0.05], [13, 0.06], [8, 0.07], [4, 0.08]])
      drawCachedStrokes(horizonStrokes, `rgba(28, 24, 18, ${(ink * k).toFixed(3)})`, w, ctx);
  }


  // 6. Compute name typography layout values
  const clientWidth = document.documentElement.clientWidth;
  // The name is treated exactly like the hero text below it: it keeps its size, scrolls
  // away with the page, and only fades. No travel to the navbar, no shrink.
  // (the canvas is viewport-fixed, so subtract scrollTop to anchor it to the document)
  const textX = clientWidth / 2;
  const textY = height / 2 - 30 - scrollTop;
  const fontSize = Math.max(48, Math.min(width * 0.09, height * 0.12, 105));

  // Measure text dimensions for hover bounding box
  logoCtx.font = `bold ${fontSize}px ${LOGO_FONT}`;
  const textWidth = logoCtx.measureText("Mark Anjoul").width;
  const textHeight = fontSize * 0.85;

  // Check if cursor is hovering over the name text
  const isHovered = mouseX >= textX - textWidth / 2 - 20 &&
                    mouseX <= textX + textWidth / 2 + 20 &&
                    mouseY >= textY - textHeight / 2 - 20 &&
                    mouseY <= textY + textHeight / 2 + 20;

  // Trigger glitch scramble countdown on mouse enter
  if (isHovered && !lastIsHoveredState) {
    glitchFrameCount = 12;
  }
  lastIsHoveredState = isHovered;

  const logoHoverScaleTarget = isHovered ? 1.15 : 1.0;
  logoHoverScale += (logoHoverScaleTarget - logoHoverScale) * 0.16;

  const dx = mouseX - textX;
  const targetTilt = isHovered ? Math.max(-4.5, Math.min(4.5, (dx / (textWidth / 2)) * 4.0)) : 0;
  logoTilt += (targetTilt - logoTilt) * 0.12;

  if (isHovered) {
    logoCanvas.classList.add('hovered');
    logoCanvas.style.pointerEvents = 'auto';
  } else {
    logoCanvas.classList.remove('hovered');
    logoCanvas.style.pointerEvents = 'none';
  }

  // Redraw logo canvas ONLY when position/size changes OR hover scale/tilt updates OR mouse moves while hovering OR matrix scramble is active
  let logoMoved = Math.abs(textX - lastLogoX) > 0.01 ||
                  Math.abs(textY - lastLogoY) > 0.01 ||
                  Math.abs(fontSize - lastLogoSize) > 0.01 ||
                  Math.abs(state.logoTransition - lastLogoTransition) > 0.01 ||
                  Math.abs(logoHoverScale - lastLogoHoverScale) > 0.001 ||
                  Math.abs(logoTilt - lastLogoTilt) > 0.01 ||
                  glitchFrameCount > 0 ||
                  skyFade > 0.01 || // keep redrawing while the sun's idle pulse/ray rotation is visible
                  (isHovered && (Math.abs(mouseX - lastMouseX) > 0.5 || Math.abs(mouseY - lastMouseY) > 0.5));

  const blinkState = isHovered && glitchFrameCount === 0 && (Math.floor(time / 350) % 2 === 0);
  if (blinkState !== lastBlinkState) {
    lastBlinkState = blinkState;
    logoMoved = true;
  }

  if (logoMoved) {
    logoCtx.clearRect(0, 0, width, height);

    let text = "Mark Anjoul";
    let isTech = isHovered;

    logoCtx.textAlign = 'center';
    logoCtx.textBaseline = 'middle';

    if (isTech) {
      logoCtx.font = `bold ${fontSize * 0.82}px "Share Tech Mono", monospace`;

      const rawTechText = "<mark_anjoul />";
      const scrambledText = getScrambledText(rawTechText, glitchFrameCount);
      const cursorStr = (glitchFrameCount === 0 && blinkState) ? "_" : "";
      text = scrambledText + cursorStr;

      const baseColor = '#ffd400';
      const strokeColor = 'rgba(28, 24, 18, 0.05)';

      logoCtx.save();
      logoCtx.translate(textX, textY);
      logoCtx.scale(logoHoverScale, logoHoverScale);
      if (Math.abs(logoTilt) > 0.01) {
        logoCtx.rotate(logoTilt * Math.PI / 180);
      }
      logoCtx.fillStyle = baseColor;
      logoCtx.fillText(text, 0, 0);
      logoCtx.strokeStyle = strokeColor;
      logoCtx.lineWidth = 1.0;
      logoCtx.strokeText(text, 0, 0);
      logoCtx.restore();
    } else {
      // ponytail: the name simply fades as you scroll. The old per-letter version set
      // logoCtx.filter = blur() for every character on every frame — very expensive.
      const alpha = skyFade * (1 - heroFadeTween.progress());
      if (alpha > 0.01) {
        logoCtx.save();
        logoCtx.globalAlpha = alpha;
        logoCtx.translate(textX, textY);
        logoCtx.scale(logoHoverScale, logoHoverScale);
        if (Math.abs(logoTilt) > 0.01) logoCtx.rotate(logoTilt * Math.PI / 180);
        logoCtx.font = `bold ${fontSize}px ${LOGO_FONT}`;
        logoCtx.textAlign = 'center';
        logoCtx.textBaseline = 'middle';
        logoCtx.fillStyle = '#1c1812';
        logoCtx.fillText(text, 0, 0);
        if (fontSize > 36) {
          logoCtx.strokeStyle = '#1c1812';
          logoCtx.lineWidth = Math.max(0.4, fontSize * 0.015);
          logoCtx.strokeText(text, 0, 0);
        }
        logoCtx.restore();
      }
    }

    lastLogoX = textX;
    lastLogoY = textY;
    lastLogoSize = fontSize;
    lastLogoTransition = state.logoTransition;
    lastLogoHoverScale = logoHoverScale;
    lastLogoTilt = logoTilt;
    lastMouseX = mouseX;
    lastMouseY = mouseY;

    if (glitchFrameCount > 0) {
      glitchFrameCount--;
    }
  }

  // 7. Fade out hero elements on scroll
  if (cachedHeroContent) {
    const heroFade = Math.max(0, 1 - (scrollTop / (window.innerHeight * 0.5)));
    // ponytail: only touch the DOM when the value actually moved — this ran every frame
    if (Math.abs(heroFade - lastHeroFade) > 0.002) {
      cachedHeroContent.style.opacity = heroFade;
      lastHeroFade = heroFade;
    }
  }



  // Fade in the top blur header overlay on scroll to avoid text overlap
  if (cachedTopBlur) {
    const blurOpacity = Math.min(scrollTop / 60, 1);
    if (Math.abs(blurOpacity - lastBlurOpacity) > 0.002) {
      cachedTopBlur.style.opacity = blurOpacity;
      lastBlurOpacity = blurOpacity;
    }
  }

  // Fade in and slide the navigation capsule quickly on scroll
  if (cachedNavInner) {
    const navFade = Math.min(scrollTop / (window.innerHeight * 0.4), 1);
    if (Math.abs(navFade - lastNavFade) > 0.002) {
    lastNavFade = navFade;
    gsap.set(cachedNavInner, {
      opacity: navFade,
      y: (1 - navFade) * -15,
      pointerEvents: navFade > 0.8 ? 'auto' : 'none'
    });
    }
  }


  requestAnimationFrame(draw);
}

// Start visual frame loop once fonts are loaded
document.fonts.ready.then(() => {
  requestAnimationFrame(draw);
});
