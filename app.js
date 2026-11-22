/* The living room: TV credits, records on the wall, gatefolds. */
(() => {
  const { gsap, ScrollTrigger, Draggable } = window;
  gsap.registerPlugin(ScrollTrigger, Draggable, window.InertiaPlugin);

  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lightness = (c = '') => parseFloat((c.match(/oklch\(\s*([\d.]+)%/) || [])[1] || 70);
  const shade = (c, d) => c.replace(/oklch\(\s*([\d.]+)%/, (_, l) => `oklch(${Math.max(0, l - d)}%`);

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

  /* ---------- credits roll forever: a second copy follows the first ---------- */
  const roll = $('.credits-roll');
  if (!reduce) {
    const copy = $('.credits-list', roll).cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    roll.append(copy);
  }

  /* ---------- sleeves ---------- */
  const sleeveHTML = (p, tag, extra = '') => {
    const s = p.sleeve || {};
    const ink = lightness(s.color) < 66 ? 'var(--paper)' : 'var(--ink)';
    const title = esc(p.shortTitle || p.title);
    let cover = `<span class="sleeve-title">${title}</span>`;
    if (s.layout === 'phone') {
      cover += `<img class="sleeve-shot" src="${esc(s.image)}" alt="" loading="lazy" decoding="async">` +
        (p.logo ? `<img class="sleeve-icon" src="${esc(p.logo)}" alt="" loading="lazy">` : '');
    } else if (s.layout === 'crop') {
      cover = `<img class="sleeve-shot" src="${esc(s.image)}" alt="" loading="lazy" decoding="async" style="object-position:${esc(s.position || '50% 50%')}">` + cover;
    }
    return `<${tag} class="sleeve sleeve--${esc(s.layout || 'type')}${s.tone === 'invert' ? ' is-invert' : ''}" ${extra}
      style="--c:${esc(s.color)};--c2:${esc(shade(s.color || '', 14))};--sleeve-ink:${ink}">
      <span class="sleeve-cat">${esc(p.catalog)}</span>${cover}
      ${p.sticker ? `<span class="sleeve-sticker">${esc(p.sticker)}</span>` : ''}
      <span class="sleeve-mark">MA</span></${tag}>`;
  };
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

  /* ---------- gatefold ---------- */
  const layer = $('.gf-layer');
  const gf = $('.gf', layer);
  const cover = $('.gf-cover', gf);
  const front = $('.gf-front', gf);
  const inside = $('.gf-inside', gf);
  const right = $('.gf-right', gf);
  const gRecord = $('.gf-record', gf);
  const gSpin = $('.record-spin', gf);
  let open = null, spinTween = null, scratch = null;

  const linkLabel = (l) => (/github/i.test(l.label) ? 'GitHub' : /live/i.test(l.label) ? 'Live site' : l.label);
  const insideHTML = (p) => {
    const credits = [['Role', p.role], ['Team', p.team], ['Timeline', p.timeline], ['Tools', p.stack], ['Status', p.status]]
      .filter(([, v]) => v).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
    const links = [];
    if (p.caseStudy) links.push(`<a class="btn btn-primary" href="${esc(p.caseStudy)}">Read the case study&nbsp;↗</a>`);
    (p.links || []).forEach((l) => links.push(`<a class="btn btn-secondary" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(linkLabel(l))}&nbsp;↗</a>`));
    return `<p class="gf-meta">${esc(p.shortType || p.type)} · ${esc(p.year)}</p>
      <h2 class="gf-title" id="gf-title">${esc(p.title)}</h2>
      <p class="gf-tagline">${esc(p.tagline)}</p>
      <dl class="gf-credits">${credits}</dl>
      ${links.length ? `<div class="gf-links">${links.join('')}</div>` : ''}
      ${fine && !reduce ? '<p class="gf-hint">Grab the record to spin it.</p>' : ''}`;
  };
  const rightHTML = (p) => {
    const g = p.gallery || { items: [] };
    const wide = g.frame !== 'phone';
    const hasDark = g.items.some((it) => it.dark);
    const shots = g.items.map((it) => `<figure class="${wide ? 'wide' : ''}"><img src="${esc(it.src)}" ${it.dark ? `data-light="${esc(it.src)}" data-dark="${esc(it.dark)}"` : ''} alt="${esc(p.title)}: ${esc(it.label)}" loading="lazy" decoding="async"><figcaption>${esc(it.label)}</figcaption></figure>`)
      .concat((p.screens || []).map((it) => `<figure><img src="${esc(it.src)}" alt="${esc(p.title)}: ${esc(it.label)}" loading="lazy" decoding="async"><figcaption>${esc(it.label)}</figcaption></figure>`)).join('');
    const about = p.about || `${p.tagline} The full process, from interviews to edge cases, is in the case study.`;
    return `<h3 class="gf-h">About</h3><p>${esc(about)}</p>
      ${p.features ? `<h3 class="gf-h">Features</h3><ol class="gf-features">${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ol>` : ''}
      ${shots ? `<div class="gf-screens-head"><h3 class="gf-h">Screens</h3>${hasDark ? `<button class="slide-switch" type="button" role="switch" aria-checked="false"><span class="track-sw"><span class="nub"></span></span>Dark mode</button>` : ''}</div><div class="gf-screens">${shots}</div>` : ''}`;
  };

  const vertical = () => innerWidth < 760 || innerWidth / innerHeight < 1;
  const P = () => cover.offsetWidth;

  const startSpin = () => {
    spinTween && spinTween.kill();
    spinTween = gsap.to(gSpin, { rotation: '+=360', duration: open?.format === 'single' ? 1.33 : 1.8, ease: 'none', repeat: -1 });
  };

  const openGatefold = (p, sleeve) => {
    open = { ...p, sleeve };
    front.innerHTML = sleeveHTML(p, 'div', 'aria-hidden="true"');
    inside.innerHTML = insideHTML(p);
    right.innerHTML = rightHTML(p);
    const rec = $('.record', gf);
    rec.style.setProperty('--label', p.label?.color || '');
    rec.style.setProperty('--label-ink', lightness(p.label?.color) < 55 ? 'var(--paper)' : 'var(--ink)');
    $('.label-title', gf).textContent = p.shortTitle || p.title;
    $('.label-meta', gf).textContent = `${p.catalog} · ${p.format === 'single' ? '45' : '33⅓'} rpm`;
    const sw = $('.slide-switch', right);
    if (sw) sw.addEventListener('click', () => {
      const dark = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', String(dark));
      $$('img[data-dark]', right).forEach((img) => { img.src = dark ? img.dataset.dark : img.dataset.light; });
    });

    const v = vertical();
    gf.classList.toggle('is-vertical', v);
    layer.hidden = false;
    lenis && lenis.stop();
    root.style.overflow = 'hidden';
    right.scrollTop = inside.scrollTop = 0;

    const p0 = P();
    const shut = v ? { x: 0, y: -p0 / 2 } : { x: -p0 / 2, y: 0 };
    const axis = v ? 'rotationX' : 'rotationY';
    gsap.set(gf, { transformOrigin: v ? '50% 75%' : '75% 50%', ...shut, scale: 1 });
    gsap.set(cover, { rotationX: 0, rotationY: 0 });
    gsap.set(gRecord, { yPercent: 0 });
    const cr = cover.getBoundingClientRect();
    const sr = sleeve.getBoundingClientRect();
    const from = { x: shut.x + (sr.left + sr.width / 2) - (cr.left + cr.width / 2), y: shut.y + (sr.top + sr.height / 2) - (cr.top + cr.height / 2), scale: sr.width / cr.width };
    sleeve.style.visibility = 'hidden';

    if (reduce) {
      gsap.set(cover, { [axis]: v ? 180 : -180 });
      gsap.set(gf, { x: 0, y: 0 });
      gsap.fromTo(layer, { opacity: 0 }, { opacity: 1, duration: 0.15 });
    } else {
      gsap.timeline()
        .fromTo('.gf-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'quart.out' }, 0)
        .fromTo(gf, from, { ...shut, scale: 1, duration: 0.65, ease: 'expo.out' }, 0)
        .to(cover, { [axis]: v ? 180 : -180, duration: 0.95, ease: 'quart.inOut' }, 0.5)
        .to(gf, { x: 0, y: 0, duration: 0.95, ease: 'quart.inOut' }, 0.5)
        .to(gRecord, { yPercent: -30, duration: 0.7, ease: 'expo.out' }, 1.2)
        .call(startSpin, null, 1.2);
    }
    if (fine && !reduce && !scratch) {
      [scratch] = Draggable.create(gSpin, {
        type: 'rotation', inertia: true,
        onPress: () => spinTween && spinTween.kill(),
        onRelease() { if (!this.isThrowing) startSpin(); },
        onThrowComplete: startSpin,
      });
    }
    const title = $('#gf-title');
    title.setAttribute('tabindex', '-1');
    setTimeout(() => title.focus({ preventScroll: true }), reduce ? 0 : 900);
  };

  const closeGatefold = () => {
    if (!open) return;
    const { sleeve } = open;
    const v = gf.classList.contains('is-vertical');
    const axis = v ? 'rotationX' : 'rotationY';
    const done = () => {
      layer.hidden = true;
      sleeve.style.visibility = '';
      spinTween && spinTween.kill();
      root.style.overflow = '';
      lenis && lenis.start();
      sleeve.focus({ preventScroll: true });
      open = null;
    };
    if (reduce) return done();
    const p0 = P();
    const shut = v ? { x: 0, y: -p0 / 2 } : { x: -p0 / 2, y: 0 };
    const sr = sleeve.getBoundingClientRect();
    gsap.timeline({ onComplete: done })
      .to(gRecord, { yPercent: 0, duration: 0.35, ease: 'quart.in' }, 0)
      .to(cover, { [axis]: 0, duration: 0.7, ease: 'quart.inOut' }, 0.15)
      .to(gf, { ...shut, duration: 0.7, ease: 'quart.inOut' }, 0.15)
      .add(() => {
        const cr = cover.getBoundingClientRect();
        gsap.to(gf, { x: shut.x + (sr.left + sr.width / 2) - (cr.left + cr.width / 2), y: shut.y + (sr.top + sr.height / 2) - (cr.top + cr.height / 2), scale: sr.width / cr.width, duration: 0.5, ease: 'expo.inOut' });
      }, 0.85)
      .to('.gf-backdrop', { opacity: 0, duration: 0.4 }, 0.95)
      .to({}, { duration: 0.01 }, 1.35);
  };

  $('.gf-close').addEventListener('click', closeGatefold);
  $('.gf-backdrop').addEventListener('click', closeGatefold);
  layer.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') return closeGatefold();
    if (e.key !== 'Tab') return;
    const f = $$('a, button, [tabindex="0"]', layer).filter((el) => el.offsetParent !== null);
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

  /* nav jumps land on the right moment in the room */
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
