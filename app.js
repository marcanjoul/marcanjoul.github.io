/* The living room: TV credits, records on the wall, tri-fold gatefolds. */
(() => {
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (fine && !reduce && window.Lenis) {
    lenis = window.lenis = new window.Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToY = (y, smooth = true) => (lenis ? lenis.scrollTo(y, { duration: smooth ? 1.2 : 0, immediate: !smooth }) : window.scrollTo({ top: y, behavior: smooth && !reduce ? 'smooth' : 'auto' }));

  /* ---------- the lamp ---------- */
  const lamp = $('.lamp');
  lamp.addEventListener('click', () => {
    const on = lamp.getAttribute('aria-pressed') !== 'true';
    lamp.setAttribute('aria-pressed', String(on));
    root.classList.toggle('is-dark', !on);
  });

  /* ---------- credits roll forever ---------- */
  const roll = $('.credits-roll');
  if (!reduce) {
    const copy = $('.credits-list', roll).cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    roll.append(copy);
  }

  /* ---------- icons for projects that don't ship one ---------- */
  const ICONS = {
    ois: `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#0e1b45"/><rect width="100" height="100" fill="url(#oisGlow)"/><defs><radialGradient id="oisGlow" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#2a3f8f"/><stop offset="1" stop-color="#0e1b45" stop-opacity="0"/></radialGradient></defs><rect x="9" y="9" width="82" height="82" rx="7" fill="none" stroke="#3fa8ff" stroke-width="2.2"/><path d="M17 24 V17 H24 M76 17 H83 V24 M83 76 V83 H76 M24 83 H17 V76" stroke="#ffd23f" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M39 33 l5 -8 l6 6 l6 -6 l5 8 v4 h-22 z" fill="#ffd23f"/><text x="50" y="66" text-anchor="middle" font-family="Mona Sans, sans-serif" font-weight="800" font-size="27" letter-spacing="1" fill="#ffd23f" style="font-stretch:75%">OIS</text><rect x="30" y="72" width="40" height="3" rx="1.5" fill="#e14bd1"/></svg>`,
    groov: `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#f2e3cc"/><circle cx="50" cy="50" r="36" fill="#1d1a18"/><g fill="none" stroke="#3a3532" stroke-width=".8"><circle cx="50" cy="50" r="31"/><circle cx="50" cy="50" r="27"/><circle cx="50" cy="50" r="23"/><circle cx="50" cy="50" r="19"/></g><path d="M24 32 A32 32 0 0 1 44 18" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="50" cy="50" r="12" fill="#d9613a"/><circle cx="50" cy="50" r="2.2" fill="#f2e3cc"/></svg>`,
    spotify: `<svg viewBox="0 0 100 100"><defs><linearGradient id="hitG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5a4e"/><stop offset="1" stop-color="#b8231d"/></linearGradient></defs><rect width="100" height="100" fill="url(#hitG)"/><g fill="#fff"><rect x="18" y="52" width="9" height="26" rx="4.5"/><rect x="31" y="38" width="9" height="40" rx="4.5"/><rect x="44" y="28" width="9" height="50" rx="4.5"/><rect x="57" y="44" width="9" height="34" rx="4.5"/></g><rect x="70.5" y="22.5" width="8" height="55" rx="4" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="3 2.4"/><text x="74.5" y="18" text-anchor="middle" font-family="Mona Sans, sans-serif" font-weight="800" font-size="13" fill="#fff">?</text></svg>`,
    noteweb: `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#3f4a1f"/><g stroke="#e8e39a" stroke-opacity=".55" stroke-width="1.4"><path d="M50 50 L24 28 M50 50 L78 26 M50 50 L80 70 M50 50 L22 72 M50 50 L50 18 M24 28 L50 18 L78 26 M22 72 L50 84 L80 70"/></g><g fill="#e8e39a"><circle cx="24" cy="28" r="4"/><circle cx="78" cy="26" r="4"/><circle cx="80" cy="70" r="4"/><circle cx="22" cy="72" r="4"/><circle cx="50" cy="18" r="3"/><circle cx="50" cy="84" r="3"/></g><rect x="40" y="38" width="20" height="25" rx="2.5" fill="#fbf8e4"/><path d="M44 45 h12 M44 50 h12 M44 55 h8" stroke="#3f4a1f" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  };
  const iconHTML = (p) => (p.logo ? `<img src="${esc(p.logo)}" alt="" loading="lazy" decoding="async">` : ICONS[p.id] || '');

  /* cover backdrops: each project gets its own world behind the icon */
  const ART = {
    airborder: `<svg class="cover-art" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="runway" d="M0 92 L100 74 M0 97 L100 82"/><path d="M-4 86 C 18 44, 58 10, 104 16"/></svg>`,
    spotify: `<svg class="cover-art" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect x="6" y="70" width="8" height="30"/><rect x="18" y="58" width="8" height="42"/><rect x="30" y="76" width="8" height="24"/><rect x="42" y="64" width="8" height="36"/><rect x="54" y="80" width="8" height="20"/><rect x="66" y="68" width="8" height="32"/><rect x="78" y="74" width="8" height="26"/><path d="M0 100 L100 0"/></svg>`,
    noteweb: `<svg class="cover-art" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1="8" y1="12" x2="30" y2="26"/><line x1="30" y1="26" x2="18" y2="52"/><line x1="18" y1="52" x2="10" y2="86"/><line x1="70" y1="10" x2="92" y2="24"/><line x1="92" y1="24" x2="84" y2="58"/><line x1="84" y1="58" x2="94" y2="90"/><line x1="30" y1="26" x2="70" y2="10"/><line x1="18" y1="52" x2="50" y2="94"/><line x1="84" y1="58" x2="50" y2="94"/><circle cx="8" cy="12" r="1.2"/><circle cx="30" cy="26" r="1.4"/><circle cx="18" cy="52" r="1.2"/><circle cx="10" cy="86" r="1"/><circle cx="70" cy="10" r="1.2"/><circle cx="92" cy="24" r="1.4"/><circle cx="84" cy="58" r="1.2"/><circle cx="94" cy="90" r="1"/><circle cx="50" cy="94" r="1.4"/></svg>`,
  };

  const sleeveHTML = (p, tag, extra = '') => `
    <${tag} class="sleeve cover--${esc(p.id)}" ${extra}>
      ${ART[p.id] || ''}
      <span class="sleeve-cat">${esc(p.catalog)}</span>
      <span class="icon-tile">${iconHTML(p)}</span>
      <span class="sleeve-title">${esc(p.shortTitle || p.title)}</span>
      <span class="sleeve-sub">${esc(p.shortType || p.type)}</span>
      ${p.sticker ? `<span class="sleeve-sticker">${esc(p.sticker)}</span>` : ''}
      <span class="sleeve-mark">MA</span>
    </${tag}>`;

  const itemHTML = (p) => `
    <li class="item" data-id="${esc(p.id)}" style="--label:${esc(p.label?.color || '')}">
      <div class="item-art">
        <span class="wall-record" aria-hidden="true"></span>
        ${sleeveHTML(p, 'button', `type="button" aria-label="Open ${esc(p.title)}" aria-haspopup="dialog"`)}
      </div>
      <div class="item-caption">
        <h3 class="item-title">${esc(p.title)}</h3>
        <p class="item-meta">${esc(p.shortType || p.type)} · ${esc(p.year)}</p>
      </div>
    </li>`;

  /* ---------- the gatefold ---------- */
  const layer = $('.gf-layer');
  const gfScroll = $('.gf-scroll', layer);
  const gfTrack = $('.gf-track', layer);
  const gf = $('.gf', layer);
  const center = $('.gf-center', gf);
  const flapL = $('.gf-flap--left', gf);
  const flapR = $('.gf-flap--right', gf);
  const front = $('.gf-front', gf);
  const leftP = $('.gf-left', gf);
  const rightP = $('.gf-right', gf);
  const hint = $('.gf-hint-scroll', layer);
  let open = null, tourST = null;

  const linkLabel = (l) => (/github/i.test(l.label) ? 'GitHub' : /live/i.test(l.label) ? 'Live site' : l.label);
  const leftHTML = (p) => {
    const credits = [['Role', p.role], ['Team', p.team], ['Timeline', p.timeline], ['Tools', p.stack], ['Status', p.status]]
      .filter(([, v]) => v).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
    const links = [];
    if (p.caseStudy) links.push(`<a class="btn btn-primary" href="${esc(p.caseStudy)}">Read the case study&nbsp;↗</a>`);
    (p.links || []).forEach((l) => links.push(`<a class="btn btn-secondary" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(linkLabel(l))}&nbsp;↗</a>`));
    return `<div class="gf-icon">${iconHTML(p)}</div>
      <p class="gf-meta">${esc(p.shortType || p.type)} · ${esc(p.year)}</p>
      <h2 class="gf-title" id="gf-title" tabindex="-1">${esc(p.title)}</h2>
      <p class="gf-tagline">${esc(p.tagline)}</p>
      <dl class="gf-credits">${credits}</dl>
      ${links.length ? `<div class="gf-links">${links.join('')}</div>` : ''}`;
  };
  const shotsHTML = (p) => {
    const g = p.gallery || { items: [] };
    const wide = g.frame !== 'phone';
    const hasDark = g.items.some((it) => it.dark);
    const shots = g.items.map((it) => `<figure class="${wide ? 'wide' : ''}"><img src="${esc(it.src)}" ${it.dark ? `data-light="${esc(it.src)}" data-dark="${esc(it.dark)}"` : ''} alt="${esc(p.title)}: ${esc(it.label)}" loading="lazy" decoding="async"><figcaption>${esc(it.label)}</figcaption></figure>`)
      .concat((p.screens || []).map((it) => `<figure><img src="${esc(it.src)}" alt="${esc(p.title)}: ${esc(it.label)}" loading="lazy" decoding="async"><figcaption>${esc(it.label)}</figcaption></figure>`)).join('');
    return shots ? `<div class="gf-screens-head"><h3 class="gf-h">Screens</h3>${hasDark ? `<button class="slide-switch" type="button" role="switch" aria-checked="false"><span class="track-sw"><span class="nub"></span></span>Dark mode</button>` : ''}</div><div class="gf-screens">${shots}</div>` : '';
  };
  const aboutText = (p) => p.about || `${p.tagline} The full process, from interviews to edge cases, is in the case study.`;
  const featuresHTML = (p) => (p.features ? `<h3 class="gf-h">Features</h3><ol class="gf-features">${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ol>` : '');

  /* center panel: a zoom tour through the screens, driven by scrolling */
  const buildTour = (p) => {
    const stops = p.tour || [];
    if (!stops.length) {
      center.innerHTML = `<div class="gf-panel" style="position:absolute;inset:0;width:auto;height:auto;left:0"><h3 class="gf-h">About</h3><p class="gf-about-big">${esc(aboutText(p))}</p></div>`;
      gfTrack.style.height = '100%';
      return;
    }
    const srcs = [...new Set(stops.map((s) => s.src))];
    center.innerHTML = `<div class="tour">
      ${srcs.map((src) => `<img class="tour-img" src="${esc(src)}" alt="">`).join('')}
      <p class="tour-step">Detail <span class="tour-n">1</span> of ${stops.length}</p>
      <div class="tour-dots" aria-hidden="true">${stops.map(() => '<i></i>').join('')}</div>
      <p class="tour-cap" aria-live="polite"></p>
    </div>`;
    const imgs = Object.fromEntries(srcs.map((src, i) => [src, $$('.tour-img', center)[i]]));
    const cap = $('.tour-cap', center), dots = $$('.tour-dots i', center), num = $('.tour-n', center);
    const first = imgs[stops[0].src];
    gsap.set(Object.values(imgs), { transformOrigin: '0 0', x: 0, y: 0, scale: 1, opacity: 0 });
    gsap.set(first, { opacity: 1 });

    if (reduce) {
      cap.textContent = stops.map((s) => s.text).join(' · ');
      gsap.set(cap, { opacity: 1 });
      gfTrack.style.height = '100%';
      return;
    }

    const ready = Promise.all(Object.values(imgs).map((im) => im.decode().catch(() => {})));
    ready.then(() => {
      Object.values(imgs).forEach((im) => im.classList.toggle('is-wide', im.naturalWidth > im.naturalHeight));
      const vh = innerHeight;
      gfTrack.style.height = `${vh + stops.length * vh * 0.9 + vh * 0.5}px`;
      const target = (s) => () => {
        const im = imgs[s.src];
        const cw = center.clientWidth, ch = center.clientHeight;
        return { x: cw / 2 - im.offsetLeft - s.s * im.offsetWidth * (s.x / 100), y: ch / 2 - im.offsetTop - s.s * im.offsetHeight * (s.y / 100) };
      };
      const spans = [];
      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
      let cur = first;
      stops.forEach((s, i) => {
        const im = imgs[s.src];
        if (im !== cur) {
          tl.to(cur, { x: 0, y: 0, scale: 1, duration: 0.5 })
            .to(cur, { opacity: 0, duration: 0.25 })
            .fromTo(im, { opacity: 0, x: 0, y: 0, scale: 1 }, { opacity: 1, duration: 0.25 }, '<');
          cur = im;
        }
        const t = target(s);
        const start = tl.duration();
        tl.to(im, { x: () => t().x, y: () => t().y, scale: s.s, duration: 1 });
        tl.to({}, { duration: 0.6 });
        spans.push([start + 0.55, tl.duration() + 0.1, i]);
      });
      tl.to(cur, { x: 0, y: 0, scale: 1, duration: 0.8 });
      let shown = -1;
      tl.eventCallback('onUpdate', () => {
          const t = tl.time();
          const hit = spans.find(([a, b]) => t >= a && t <= b);
          const idx = hit ? hit[2] : -1;
          if (idx !== shown) {
            shown = idx;
            if (idx >= 0) { cap.textContent = stops[idx].text; num.textContent = idx + 1; }
            gsap.to(cap, { opacity: idx >= 0 ? 1 : 0, y: idx >= 0 ? 0 : 6, duration: 0.25, overwrite: 'auto' });
            dots.forEach((d, k) => d.classList.toggle('is-on', k === idx));
          }
      });
      tourST = ScrollTrigger.create({
        scroller: gfScroll, trigger: gfTrack, start: 'top top', end: 'bottom bottom', scrub: 0.5, animation: tl, invalidateOnRefresh: true,
        onUpdate: () => { if (gfScroll.scrollTop > 20) gsap.to(hint, { opacity: 0, duration: 0.3, overwrite: 'auto' }); },
      });
    });
  };

  const vertical = () => innerWidth < 760 || innerWidth / innerHeight < 1;
  const rot = (v, side, openIt) => (v ? { rotationX: openIt ? (side === 'L' ? -180 : 180) : 0, rotationY: 0 } : { rotationY: openIt ? (side === 'L' ? -180 : 180) : 0, rotationX: 0 });

  const openGatefold = (p, sleeve) => {
    open = { p, sleeve };
    front.innerHTML = sleeveHTML(p, 'div', 'aria-hidden="true"');
    leftP.innerHTML = leftHTML(p);
    rightP.innerHTML = p.tour
      ? `<h3 class="gf-h">About</h3><p>${esc(aboutText(p))}</p>${featuresHTML(p)}${shotsHTML(p)}`
      : `${featuresHTML(p)}${shotsHTML(p)}`;
    const sw = $('.slide-switch', rightP);
    if (sw) sw.addEventListener('click', () => {
      const dark = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', String(dark));
      $$('img[data-dark]', rightP).forEach((img) => { img.src = dark ? img.dataset.dark : img.dataset.light; });
    });

    const v = vertical();
    gf.classList.toggle('is-vertical', v);
    layer.hidden = false;
    gfScroll.scrollTop = 0;
    leftP.scrollTop = rightP.scrollTop = 0;
    lenis && lenis.stop();
    root.style.overflow = 'hidden';
    buildTour(p);

    gsap.set(gf, { x: 0, y: 0, scale: 1, transformOrigin: '50% 50%' });
    gsap.set(flapL, { ...rot(v, 'L', false), z: 2 });
    gsap.set(flapR, { ...rot(v, 'R', false), z: 1 });
    gsap.set(hint, { opacity: 0 });
    const cr = flapL.getBoundingClientRect();
    const sr = sleeve.getBoundingClientRect();
    const from = { x: sr.left + sr.width / 2 - (cr.left + cr.width / 2), y: sr.top + sr.height / 2 - (cr.top + cr.height / 2), scale: sr.width / cr.width };
    sleeve.style.visibility = 'hidden';

    if (reduce) {
      gsap.set(flapL, rot(v, 'L', true));
      gsap.set(flapR, rot(v, 'R', true));
      gsap.fromTo(layer, { opacity: 0 }, { opacity: 1, duration: 0.15 });
    } else {
      gsap.timeline()
        .fromTo('.gf-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'quart.out' }, 0)
        .fromTo(gf, from, { x: 0, y: 0, scale: 1, duration: 0.65, ease: 'expo.out' }, 0)
        .to(flapL, { ...rot(v, 'L', true), duration: 0.85, ease: 'quart.inOut' }, 0.45)
        .to(flapR, { ...rot(v, 'R', true), duration: 0.85, ease: 'quart.inOut' }, 0.85)
        .to(hint, { opacity: p.tour ? 1 : 0, duration: 0.4 }, 1.6);
    }
    setTimeout(() => $('#gf-title').focus({ preventScroll: true }), reduce ? 0 : 1000);
  };

  const closeGatefold = () => {
    if (!open) return;
    const { sleeve } = open;
    const v = gf.classList.contains('is-vertical');
    const done = () => {
      tourST && tourST.kill(); tourST = null;
      layer.hidden = true;
      sleeve.style.visibility = '';
      root.style.overflow = '';
      lenis && lenis.start();
      sleeve.focus({ preventScroll: true });
      open = null;
    };
    if (reduce) return done();
    tourST && tourST.disable(false);
    const sr = sleeve.getBoundingClientRect();
    gsap.timeline({ onComplete: done })
      .to(hint, { opacity: 0, duration: 0.2 }, 0)
      .to(flapR, { ...rot(v, 'R', false), duration: 0.6, ease: 'quart.inOut' }, 0)
      .to(flapL, { ...rot(v, 'L', false), duration: 0.6, ease: 'quart.inOut' }, 0.35)
      .add(() => {
        const cr = flapL.getBoundingClientRect();
        gsap.to(gf, { x: `+=${sr.left + sr.width / 2 - (cr.left + cr.width / 2)}`, y: `+=${sr.top + sr.height / 2 - (cr.top + cr.height / 2)}`, scale: sr.width / cr.width, duration: 0.5, ease: 'expo.inOut' });
      }, 0.95)
      .to('.gf-backdrop', { opacity: 0, duration: 0.4 }, 1.05)
      .to({}, { duration: 0.01 }, 1.45);
  };

  $('.gf-close').addEventListener('click', closeGatefold);
  $('.gf-backdrop').addEventListener('click', closeGatefold);
  gfScroll.addEventListener('click', (e) => { if (e.target === gfScroll || e.target.classList.contains('gf-stage')) closeGatefold(); });
  layer.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') return closeGatefold();
    if (e.key !== 'Tab') return;
    const f = $$('a, button', layer).filter((el) => el.offsetParent !== null);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- the room: TV down, records up, browse sideways, TV back up ---------- */
  const room = $('.room');
  const tv = $('.tv');
  const track = $('.track');
  const intro = $('.screen--intro');
  const end = $('.screen--end');
  end.inert = true;
  let st = null, marks = {}, items = [];

  const build = () => {
    if (st) { st.scrollTrigger.kill(true); st.kill(); }
    gsap.set([tv, track, '.scroll-cue', '.vinyls-title', '.vinyl-hint', '.ledge', intro, end], { clearProps: 'transform,opacity,visibility' });
    items.forEach((it) => gsap.set([it, $('.item-art', it), $('.wall-record', it), $('.item-caption', it)], { clearProps: 'transform,opacity,visibility' }));
    room.classList.add('is-cinema');

    const vh = innerHeight;
    const dist = Math.max(0, track.scrollWidth - innerWidth);
    const A = 0.9, B = 0.6, C = dist / vh, D = 0.9;
    const tD = A + B + C;
    const focus = () => {
      const cx = innerWidth / 2;
      items.forEach((it) => {
        const art = $('.item-art', it);
        const r = art.getBoundingClientRect();
        const f = Math.max(0, 1 - Math.abs(r.left + r.width / 2 - cx) / (r.width * 1.25));
        gsap.set(art, { scale: 0.9 + 0.14 * f });
        gsap.set($('.wall-record', it), { xPercent: 34 * f, rotation: 120 * f });
        gsap.set($('.item-caption', it), { opacity: 0.45 + 0.55 * f });
      });
    };

    st = gsap.timeline({
      scrollTrigger: {
        trigger: room, pin: true, start: 'top top', end: () => '+=' + (tD + D + 0.3) * vh, scrub: 0.6, anticipatePin: 1,
        onUpdate: (self) => {
          const t = self.progress * st.duration();
          end.inert = t < tD + 0.5;
          if (t > A - 0.2 && t < tD + 0.4) focus();
        },
      },
    })
      .to('.scroll-cue', { autoAlpha: 0, duration: 0.15 }, 0)
      .to(tv, { yPercent: 100, duration: A, ease: 'power2.inOut' }, 0)
      .fromTo('.ledge', { scaleX: 0, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: 0.35, ease: 'expo.out' }, A - 0.15)
      .fromTo(items, { y: 70, scale: 0.72, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.4, stagger: 0.05, ease: 'expo.out' }, A - 0.1)
      .fromTo(['.vinyls-title', '.vinyl-hint'], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.25 }, A)
      .to(track, { x: -dist, duration: C, ease: 'none' }, A + B)
      .to(items, { y: -40, autoAlpha: 0, duration: 0.3, stagger: 0.02, ease: 'quart.in' }, tD)
      .to(['.vinyls-title', '.vinyl-hint', '.ledge'], { autoAlpha: 0, duration: 0.25 }, tD)
      .set(intro, { autoAlpha: 0 }, tD + 0.3)
      .set(end, { autoAlpha: 1 }, tD + 0.3)
      .to(tv, { yPercent: 0, duration: D - 0.3, ease: 'power2.inOut' }, tD + 0.3)
      .to({}, { duration: 0.3 });

    marks = {
      projects: () => st.scrollTrigger.start + (A + B) * vh,
      contact: () => st.scrollTrigger.end,
      item: (i) => st.scrollTrigger.start + (A + B + (items.length > 1 ? (C * i) / (items.length - 1) : 0)) * vh,
    };
  };

  const cinema = () => room.classList.contains('is-cinema') && st;
  $$('[data-jump]').forEach((a) => a.addEventListener('click', (e) => {
    if (!cinema()) return;
    e.preventDefault();
    scrollToY(marks[a.dataset.jump]());
  }));
  $('.nav-mark').addEventListener('click', (e) => { e.preventDefault(); scrollToY(0); });
  $('.skip').addEventListener('click', (e) => {
    if (!cinema() || !items[0]) return;
    e.preventDefault();
    scrollToY(marks.projects(), false);
    setTimeout(() => $('.sleeve', items[0]).focus({ preventScroll: true }), 50);
  });

  fetch('projects.json', { cache: 'no-cache' })
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(({ projects }) => {
      track.innerHTML = projects.map(itemHTML).join('');
      items = $$('.item', track);
      const byId = Object.fromEntries(projects.map((p) => [p.id, p]));
      items.forEach((it, i) => {
        const sleeve = $('.sleeve', it);
        sleeve.addEventListener('click', () => openGatefold(byId[it.dataset.id], sleeve));
        sleeve.addEventListener('focus', () => {
          if (!cinema() || open) return;
          const y = marks.item(i);
          if (Math.abs(window.scrollY - y) > 4) scrollToY(y, false);
        });
      });
      if (!reduce) {
        build();
        let w = innerWidth;
        addEventListener('resize', () => {
          if (innerWidth === w) return;
          w = innerWidth;
          clearTimeout(build.t);
          build.t = setTimeout(() => { build(); ScrollTrigger.refresh(); }, 200);
        });
      }
      ScrollTrigger.refresh();
    })
    .catch(() => {
      track.outerHTML = `<p class="vinyls-error">The projects didn’t load. Everything is also on <a href="https://github.com/marcanjoul">GitHub</a>.</p>`;
    });

  /* ---------- copy email (pointer devices); phones keep mailto ---------- */
  const status = $('#copy-status');
  $$('[data-copy]').forEach((a) => {
    if (!fine || !navigator.clipboard) return;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(a.dataset.copy).then(() => {
        const label = a.textContent;
        a.textContent = 'Copied';
        status.textContent = 'Email address copied';
        setTimeout(() => { a.textContent = label; status.textContent = ''; }, 1800);
      }, () => { location.href = a.href; });
    });
  });
})();
