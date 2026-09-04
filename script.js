// CHAIC 2026 — interactive behaviors

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

/* ── Multi-page navigation fallback ──
   Modern Chromium/WebKit browsers use the shared CSS @view-transition rules.
   Other browsers get a short content exit before a normal static-page load. */
const supportsCrossDocumentTransitions =
  'CSSViewTransitionRule' in window && 'onpagereveal' in window;
const PAGE_EXIT_MS = 180;

function isEligiblePageNavigation(event, link) {
  if (
    prefersReducedMotion ||
    supportsCrossDocumentTransitions ||
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    link.target ||
    link.hasAttribute('download')
  ) {
    return false;
  }

  let destination;
  try {
    destination = new URL(link.href, window.location.href);
  } catch (error) {
    return false;
  }

  const current = new URL(window.location.href);
  const isHttp = destination.protocol === 'http:' || destination.protocol === 'https:';
  const isSameOrigin = destination.origin === current.origin;
  const isSameDocument = destination.pathname === current.pathname
    && destination.search === current.search;

  return isHttp && isSameOrigin && !isSameDocument;
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link || !isEligiblePageNavigation(event, link)) return;

  event.preventDefault();
  if (document.documentElement.classList.contains('is-page-leaving')) return;

  document.documentElement.classList.add('is-page-leaving');
  window.setTimeout(() => {
    window.location.href = link.href;
  }, PAGE_EXIT_MS);
});

window.addEventListener('pageshow', () => {
  document.documentElement.classList.remove('is-page-leaving');
});

/* ── Countdown to September 25, 2026 ── */
const TARGET = new Date('2026-09-25T00:00:00');

const elDays    = document.getElementById('cd-days');
const elHours   = document.getElementById('cd-hours');
const elMinutes = document.getElementById('cd-minutes');
const elSeconds = document.getElementById('cd-seconds');

function pad(n, len) {
  return String(n).padStart(len, '0');
}

/* ── Early-bird promotion (ends August 1 at 12:00 a.m. AST) ── */
const promotion = window.CHAICPromotion;
const promotionCountdown = document.querySelector('[data-early-bird-countdown]');
let promotionTimerId = null;

function renderPromotionCountdown(nowMs) {
  if (!promotion || !promotionCountdown) return;

  const diff = Math.max(0, promotion.endAtMs - nowMs);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const values = {
    '[data-promo-days]': pad(days, 2),
    '[data-promo-hours]': pad(hours, 2),
    '[data-promo-minutes]': pad(minutes, 2),
    '[data-promo-seconds]': pad(seconds, 2),
  };

  Object.entries(values).forEach(([selector, value]) => {
    const el = promotionCountdown.querySelector(selector);
    if (el) el.textContent = value;
  });
}

function syncPromotionState(nowMs = Date.now()) {
  const active = Boolean(promotion && promotion.isActive(nowMs));
  document.documentElement.classList.toggle('early-bird-active', active);

  document.querySelectorAll('[data-early-price][data-regular-price]').forEach(el => {
    el.textContent = active ? el.dataset.earlyPrice : el.dataset.regularPrice;
  });

  document.querySelectorAll('[data-promo-text][data-regular-text]').forEach(el => {
    el.textContent = active ? el.dataset.promoText : el.dataset.regularText;
  });

  renderPromotionCountdown(nowMs);

  if (!active && promotionTimerId !== null) {
    window.clearInterval(promotionTimerId);
    promotionTimerId = null;
  }

  return active;
}

if (syncPromotionState() && promotionCountdown) {
  promotionTimerId = window.setInterval(() => syncPromotionState(), 1000);
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;

  const active = syncPromotionState();
  if (active && promotionCountdown && promotionTimerId === null) {
    promotionTimerId = window.setInterval(() => syncPromotionState(), 1000);
  }
});

document.querySelectorAll('[data-early-bird-cta]').forEach(cta => {
  cta.addEventListener('click', () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'early_bird_banner_click',
      page_path: window.location.pathname,
    });
  });
});

function tick() {
  const diff = TARGET - Date.now();

  if (diff <= 0) {
    elDays.textContent    = '000';
    elHours.textContent   = '00';
    elMinutes.textContent = '00';
    elSeconds.textContent = '00';
    return;
  }

  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000)  / 60000);
  const seconds = Math.floor((diff % 60000)    / 1000);

  elDays.textContent    = pad(days, 3);
  elHours.textContent   = pad(hours, 2);
  elMinutes.textContent = pad(minutes, 2);
  elSeconds.textContent = pad(seconds, 2);
}

if (elDays && elHours && elMinutes && elSeconds) {
  tick();
  setInterval(tick, 1000);
}

/* ── Mobile nav ── */
const navToggle = document.querySelector('.nav-toggle');
const navMenu   = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
});

navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ── Avatar initials renderer ──
   For any .speaker-avatar or .agenda-speaker-avatar that has data-initials
   and no nested <img>, render the initials as text. */
function renderInitials() {
  const avatars = document.querySelectorAll(
    '.speaker-avatar[data-initials], .agenda-speaker-avatar[data-initials]'
  );
  avatars.forEach(avatar => {
    if (avatar.querySelector('img')) return;
    if (avatar.querySelector('.avatar-initials')) return;
    const initials = avatar.getAttribute('data-initials') || '';
    if (!initials) return;
    const span = document.createElement('span');
    span.className = 'avatar-initials';
    span.textContent = initials;
    avatar.appendChild(span);
  });
}

renderInitials();

/* ── Viewport-aware media and ambient motion ──
   Videos and infinite decorative animations only run while their target is
   visible. This also covers tab switches and the reduced-motion preference. */
function initViewportMotion() {
  const motionItems = new Map();

  document.querySelectorAll('video').forEach(video => {
    motionItems.set(video, {
      element: video,
      video,
      animations: [],
      isVisible: false,
    });
  });

  document.getAnimations({ subtree: true }).forEach(animation => {
    if (animation.effect?.getTiming?.().iterations !== Infinity) return;
    const target = animation.effect?.target;
    if (!(target instanceof Element)) return;

    const item = motionItems.get(target) || {
      element: target,
      video: null,
      animations: [],
      isVisible: false,
    };
    item.animations.push(animation);
    motionItems.set(target, item);
  });

  if (motionItems.size === 0) return;

  function isNearViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.bottom >= -120 && rect.top <= window.innerHeight + 120;
  }

  function syncItem(item) {
    const shouldRun = item.isVisible
      && document.visibilityState === 'visible'
      && !prefersReducedMotion
      && !item.element.closest('[data-marquee-hold]');

    if (item.video) {
      if (shouldRun) {
        item.video.play().catch(() => {});
      } else {
        item.video.pause();
      }
    }

    item.animations.forEach(animation => {
      if (shouldRun && animation.playState === 'paused') animation.play();
      if (!shouldRun && animation.playState === 'running') animation.pause();
    });
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const item = motionItems.get(entry.target);
      if (!item) return;
      item.isVisible = entry.isIntersecting || isNearViewport(entry.target);
      syncItem(item);
    });
  }, { rootMargin: '120px 0px', threshold: 0.01 });

  motionItems.forEach((item, element) => {
    item.isVisible = isNearViewport(element);
    syncItem(item);
    observer.observe(element);
  });

  function syncAllItems() {
    motionItems.forEach(item => {
      item.isVisible = isNearViewport(item.element);
      syncItem(item);
    });
  }

  document.addEventListener('visibilitychange', syncAllItems);
  window.addEventListener('pageshow', syncAllItems);
  let motionSyncFrame = 0;
  function queueMotionSync() {
    if (motionSyncFrame) return;
    motionSyncFrame = window.requestAnimationFrame(() => {
      motionSyncFrame = 0;
      syncAllItems();
    });
  }
  window.addEventListener('scroll', queueMotionSync, { passive: true });
  window.addEventListener('resize', queueMotionSync, { passive: true });
  window.requestAnimationFrame(() => {
    syncAllItems();
  });
}

/* ── Hero sponsors dock (desktop pointers only) ──
   macOS-style magnification: each mark eases toward a scale driven by its
   distance to the cursor with a Gaussian falloff, and the flex width grows
   with it so neighbours are pushed aside exactly like the Dock. A duplicate
   visual set makes the roster travel continuously from right to left. The
   travel pauses for hover/focus interaction; coarse-pointer viewports get
   the mobile centre-spotlight dock instead (below), and reduced motion keeps
   the static wrapped layout. */
function initSponsorDock() {
  const dock = document.querySelector('.sponsors-bar .sponsors-logos');
  if (!dock || dock.dataset.dockBound) return;
  dock.dataset.dockBound = 'true';

  const originals = Array.from(dock.children).filter(el => el.tagName === 'A');
  if (originals.length === 0) return;

  const MAX_ADD = 0.6; // peak magnification directly under the cursor (1.6x)
  const SIGMA = 110;   // px — width of the falloff bulge around the cursor
  const EASE = 0.32;   // per-frame lerp toward the target scale
  const TRAVEL_SPEED = 34; // px per second, moving visually right to left

  // Keep in sync with the CSS block that turns on .sponsors-bar dock mode.
  const mql = window.matchMedia(
    '(hover: hover) and (pointer: fine) and (min-width: 1025px)' +
      ' and (prefers-reduced-motion: no-preference)'
  );

  let items = originals;
  let imgs = items.map(item => item.querySelector('img'));
  let scales = new Float32Array(items.length).fill(1);
  let mouseX = null;
  let focusIndex = -1;
  let frame = 0;
  let lastFrameTime = 0;
  let pointerInside = false;
  let travelPosition = 0;

  function addLoopSet() {
    if (dock.querySelector('[data-dock-clone]')) return;

    originals.forEach(original => {
      const clone = original.cloneNode(true);
      clone.dataset.dockClone = 'true';
      clone.setAttribute('aria-hidden', 'true');
      clone.tabIndex = -1;
      dock.appendChild(clone);
    });

    items = Array.from(dock.children).filter(el => el.tagName === 'A');
    imgs = items.map(item => item.querySelector('img'));
    scales = new Float32Array(items.length).fill(1);
  }

  function removeLoopSet() {
    dock.querySelectorAll('[data-dock-clone]').forEach(clone => clone.remove());
    items = originals;
    imgs = items.map(item => item.querySelector('img'));
    scales = new Float32Array(items.length).fill(1);
    dock.scrollLeft = 0;
    travelPosition = 0;
  }

  function targetFor(index, center) {
    if (index === focusIndex) return 1 + MAX_ADD;
    if (mouseX === null) return 1;
    const distance = mouseX - center;
    return 1 + MAX_ADD * Math.exp(-(distance * distance) / (2 * SIGMA * SIGMA));
  }

  function step(time) {
    if (!mql.matches) {
      frame = 0;
      return;
    }

    const elapsed = lastFrameTime ? Math.min(time - lastFrameTime, 50) : 0;
    lastFrameTime = time;
    const isInteractive = pointerInside || focusIndex !== -1;
    const needsMagnification =
      isInteractive || scales.some(scale => Math.abs(scale - 1) > 0.0015);

    if (needsMagnification) {
      // Batch every read before the writes so the frame costs one layout.
      const rects = items.map(item => item.getBoundingClientRect());
      const imgRects = imgs.map(img => img && img.getBoundingClientRect());
      let settled = true;

      items.forEach((item, i) => {
        // The natural width comes from the mark's own rect, not the anchor's
        // box. Dividing out the current uniform scale recovers its base size.
        const imgWidth = imgRects[i] ? imgRects[i].width : 0;
        const base = imgWidth / scales[i];
        const center = rects[i].left + rects[i].width / 2;
        const target = targetFor(i, center);
        const next = scales[i] + (target - scales[i]) * EASE;
        scales[i] = next;
        item.style.width = `${base * next}px`;
        item.style.transform = `scale(${next})`;
        if (Math.abs(next - target) > 0.0015) settled = false;
      });

      if (!isInteractive && settled) {
        scales.fill(1);
        items.forEach(item => {
          item.style.width = '';
          item.style.transform = '';
        });
      }
    } else {
      // Keep a sub-pixel accumulator because some browsers round scrollLeft
      // assignments; adding each half-pixel frame directly can otherwise
      // leave a slow marquee stuck at zero.
      travelPosition += TRAVEL_SPEED * elapsed / 1000;
      dock.scrollLeft = travelPosition;

      const firstClone = dock.querySelector('[data-dock-clone]');
      const loopWidth = firstClone
        ? firstClone.offsetLeft - originals[0].offsetLeft
        : 0;
      if (loopWidth > 0 && dock.scrollLeft >= loopWidth) {
        travelPosition -= loopWidth;
        dock.scrollLeft = travelPosition;
      }
    }

    frame = requestAnimationFrame(step);
  }

  function wake() {
    if (!frame && mql.matches) {
      lastFrameTime = 0;
      frame = requestAnimationFrame(step);
    }
  }

  function disable() {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    mouseX = null;
    focusIndex = -1;
    pointerInside = false;
    lastFrameTime = 0;
    scales.fill(1);
    items.forEach(item => {
      item.style.width = '';
      item.style.transform = '';
    });
    removeLoopSet();
  }

  dock.addEventListener('pointerenter', () => {
    pointerInside = true;
    travelPosition = dock.scrollLeft;
    wake();
  });

  dock.addEventListener('pointermove', event => {
    mouseX = event.clientX;
    wake();
  });

  dock.addEventListener('pointerleave', () => {
    pointerInside = false;
    mouseX = null;
    travelPosition = dock.scrollLeft;
    wake();
  });

  dock.addEventListener('focusin', event => {
    const index = items.indexOf(event.target);
    if (index === -1) return;
    focusIndex = index;
    travelPosition = dock.scrollLeft;
    event.target.scrollIntoView({ block: 'nearest', inline: 'center' });
    wake();
  });

  dock.addEventListener('focusout', event => {
    if (!dock.contains(event.relatedTarget)) {
      focusIndex = -1;
      travelPosition = dock.scrollLeft;
      wake();
    }
  });

  function syncMode() {
    if (mql.matches) {
      addLoopSet();
      wake();
    } else {
      disable();
    }
  }

  if (mql.addEventListener) mql.addEventListener('change', syncMode);
  else mql.addListener(syncMode);
  syncMode();
}

initSponsorDock();

/* ── Hero sponsors dock (mobile centre spotlight) ──
   Touch keeps the travelling roster but swaps the cursor for the screen's
   centre as the focus point: whichever mark crosses the middle eases toward
   a gentle ~1.14x, full opacity, a slight brightness lift and a few pixels
   of elevation, while marks near the edges stay dimmer. The strip remains a
   native scroller, so swiping works with momentum; auto-travel pauses while
   a finger is down and resumes once the glide settles. Focus pulls a mark to
   the centre like on desktop; offscreen and reduced motion keep the static
   wrapped layout. */
function initSponsorMobileDock() {
  const dock = document.querySelector('.sponsors-bar .sponsors-logos');
  if (!dock || dock.dataset.mobileDockBound) return;
  dock.dataset.mobileDockBound = 'true';

  const originals = Array.from(dock.children).filter(el => el.tagName === 'A');
  if (originals.length === 0) return;

  const MAX_ADD = 0.14; // peak centre emphasis (1.14x) — gentler than desktop
  const EASE = 0.32;    // per-frame lerp toward the target scale
  const LIFT = 4;       // px the centred mark rises
  const DIM_OPACITY = 0.55; // edge opacity; the centred mark is fully opaque
  const BRIGHT = 0.1;   // extra brightness at the centre
  const TRAVEL_SPEED = 24; // px per second — slower than the desktop dock
  const SETTLE_MS = 160; // quiet period after a swipe before travel resumes

  // Keep in sync with the CSS block that turns on .sponsors-bar mobile dock
  // mode.
  const mql = window.matchMedia(
    '(hover: none) and (pointer: coarse) and (max-width: 1024px)' +
      ' and (prefers-reduced-motion: no-preference)'
  );

  let items = originals;
  let imgs = items.map(item => item.querySelector('img'));
  let scales = new Float32Array(items.length).fill(1);
  let sigma = 90;
  let focusIndex = -1;
  let frame = 0;
  let lastFrameTime = 0;
  let active = false;
  let visible = false;
  let touchActive = false;
  let settling = false;
  let settleTimer = 0;
  let travelPosition = 0;

  const io =
    'IntersectionObserver' in window
      ? new IntersectionObserver(entries => {
          visible = entries.some(entry => entry.isIntersecting);
          if (visible) wake();
        })
      : null;
  if (io) io.observe(dock);
  else visible = true;

  function addLoopSet() {
    if (dock.querySelector('[data-dock-clone]')) return;

    originals.forEach(original => {
      const clone = original.cloneNode(true);
      clone.dataset.dockClone = 'true';
      clone.setAttribute('aria-hidden', 'true');
      clone.tabIndex = -1;
      dock.appendChild(clone);
    });

    items = Array.from(dock.children).filter(el => el.tagName === 'A');
    imgs = items.map(item => item.querySelector('img'));
    scales = new Float32Array(items.length).fill(1);
  }

  function removeLoopSet() {
    dock.querySelectorAll('[data-dock-clone]').forEach(clone => clone.remove());
    items = originals;
    imgs = items.map(item => item.querySelector('img'));
    scales = new Float32Array(items.length).fill(1);
    dock.scrollLeft = 0;
    travelPosition = 0;
  }

  // A quarter of the strip's width keeps the bulge about one neighbour wide
  // on a phone and widens proportionally on tablets.
  function recomputeSigma() {
    sigma = Math.max(80, dock.clientWidth * 0.26);
  }

  function emphasisFor(index, center, dockCenter) {
    if (index === focusIndex) return 1;
    const distance = dockCenter - center;
    return Math.exp(-(distance * distance) / (2 * sigma * sigma));
  }

  function step(time) {
    if (!mql.matches || !visible) {
      frame = 0;
      return;
    }

    const elapsed = lastFrameTime ? Math.min(time - lastFrameTime, 50) : 0;
    lastFrameTime = time;

    // Batch every read before the writes so the frame costs one layout.
    const dockRect = dock.getBoundingClientRect();
    const dockCenter = dockRect.left + dockRect.width / 2;
    const rects = items.map(item => item.getBoundingClientRect());
    const imgRects = imgs.map(img => img && img.getBoundingClientRect());

    items.forEach((item, i) => {
      const img = imgs[i];
      const imgRect = imgRects[i];
      if (!img || !imgRect || imgRect.width === 0) return;
      // Marks fully outside the strip stay untouched; their stored scale
      // still matches the transform left on them by the last pass.
      if (
        rects[i].right < dockRect.left - dockRect.width ||
        rects[i].left > dockRect.right + dockRect.width
      ) {
        return;
      }

      const prev = scales[i];
      // The natural width comes from the mark's own rect, not the anchor's
      // box. Dividing out the current uniform scale recovers its base size.
      const base = imgRect.width / prev;
      const center = rects[i].left + rects[i].width / 2;
      const t = emphasisFor(i, center, dockCenter);
      const target = 1 + MAX_ADD * t;
      const next = prev + (target - prev) * EASE;
      scales[i] = next;

      // Already resting at this position's target — the styles on the node
      // are current, so the writes can be skipped for this frame.
      if (Math.abs(next - prev) < 1e-4 && Math.abs(target - next) < 1e-4) {
        return;
      }

      // One eased value drives every property so opacity and lift stay in
      // lockstep with the scale.
      const eased = (next - 1) / MAX_ADD;
      item.style.width = `${base * next}px`;
      item.style.transform = `translateY(${(-eased * LIFT).toFixed(2)}px) scale(${next.toFixed(4)})`;
      img.style.opacity = (DIM_OPACITY + (1 - DIM_OPACITY) * eased).toFixed(3);
      img.style.filter = `brightness(${(1 + BRIGHT * eased).toFixed(3)})`;
    });

    if (!touchActive && !settling && focusIndex === -1) {
      // Keep a sub-pixel accumulator because some browsers round scrollLeft
      // assignments; adding each half-pixel frame directly can otherwise
      // leave a slow marquee stuck at zero.
      travelPosition += TRAVEL_SPEED * elapsed / 1000;
      dock.scrollLeft = travelPosition;

      const firstClone = dock.querySelector('[data-dock-clone]');
      const loopWidth = firstClone
        ? firstClone.offsetLeft - originals[0].offsetLeft
        : 0;
      if (loopWidth > 0 && dock.scrollLeft >= loopWidth) {
        travelPosition -= loopWidth;
        dock.scrollLeft = travelPosition;
      }
    }

    frame = requestAnimationFrame(step);
  }

  function wake() {
    if (!frame && mql.matches && visible) {
      recomputeSigma();
      lastFrameTime = 0;
      frame = requestAnimationFrame(step);
    }
  }

  function resumeTravel() {
    clearTimeout(settleTimer);
    settling = false;
    travelPosition = dock.scrollLeft;
    wake();
  }

  function scheduleResume() {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(resumeTravel, SETTLE_MS);
  }

  function endTouch() {
    if (!touchActive) return;
    touchActive = false;
    settling = true;
    travelPosition = dock.scrollLeft;
    scheduleResume();
  }

  dock.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse') return;
    touchActive = true;
    clearTimeout(settleTimer);
    travelPosition = dock.scrollLeft;
    wake();
  });
  dock.addEventListener('pointerup', endTouch);
  dock.addEventListener('pointercancel', endTouch);

  // Momentum keeps firing scroll events after release; travel resumes once
  // they go quiet, or straight away on scrollend where supported.
  dock.addEventListener(
    'scroll',
    () => {
      if (settling && !touchActive) scheduleResume();
    },
    { passive: true }
  );
  dock.addEventListener('scrollend', () => {
    if (!touchActive) resumeTravel();
  });

  dock.addEventListener('focusin', event => {
    const index = items.indexOf(event.target);
    if (index === -1) return;
    focusIndex = index;
    travelPosition = dock.scrollLeft;
    event.target.scrollIntoView({ block: 'nearest', inline: 'center' });
    wake();
  });

  dock.addEventListener('focusout', event => {
    if (!dock.contains(event.relatedTarget)) {
      focusIndex = -1;
      travelPosition = dock.scrollLeft;
      wake();
    }
  });

  function disable() {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    clearTimeout(settleTimer);
    touchActive = false;
    settling = false;
    focusIndex = -1;
    lastFrameTime = 0;
    scales.fill(1);
    items.forEach((item, i) => {
      item.style.width = '';
      item.style.transform = '';
      const img = imgs[i];
      if (img) {
        img.style.opacity = '';
        img.style.filter = '';
      }
    });
    removeLoopSet();
  }

  function syncMode() {
    if (mql.matches) {
      if (active) return;
      active = true;
      addLoopSet();
      recomputeSigma();
      wake();
    } else if (active) {
      // Only clean up when this mode owned the strip; the desktop dock
      // manages the same node and its clones on fine-pointer devices.
      active = false;
      disable();
    }
  }

  if (mql.addEventListener) mql.addEventListener('change', syncMode);
  else mql.addListener(syncMode);
  window.addEventListener(
    'resize',
    () => {
      if (active) recomputeSigma();
    },
    { passive: true }
  );
  syncMode();
}

initSponsorMobileDock();

/* ── Speakers marquee drift ──
   Clones each speaker row once so a transform-only CSS animation can loop
   seamlessly. The clone reuses the same image URLs, so nothing extra is
   downloaded. The drift "holds" (pauses) while the visitor hovers, focuses
   or scrolls the row, and initViewportMotion() pauses it entirely whenever
   the section leaves the viewport or the tab is hidden. */
function initSpeakersMarquee() {
  const tracks = document.querySelectorAll('.speakers-track[data-track]');
  if (prefersReducedMotion || tracks.length === 0) return;

  const RESUME_DELAY = 1400;
  const resumeTimers = new WeakMap();

  tracks.forEach(track => {
    const col = track.closest('.speakers-col');
    if (!col || col.dataset.marqueeReady) return;
    col.dataset.marqueeReady = 'true';

    const originals = Array.from(track.children);
    if (originals.length === 0) return;

    const fragment = document.createDocumentFragment();
    originals.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.classList.add('speaker-card--clone');
      fragment.appendChild(clone);
    });
    track.appendChild(fragment);
    track.classList.add('is-marquee');

    const isNearViewport = () => {
      const rect = col.getBoundingClientRect();
      return rect.bottom >= -120 && rect.top <= window.innerHeight + 120;
    };

    const hold = () => {
      if (col.hasAttribute('data-marquee-hold')) return;
      col.setAttribute('data-marquee-hold', '');
      track.getAnimations().forEach(a => a.pause());
    };

    const release = () => {
      window.clearTimeout(resumeTimers.get(col));
      resumeTimers.delete(col);
      if (!col.hasAttribute('data-marquee-hold')) return;
      col.removeAttribute('data-marquee-hold');
      if (isNearViewport() && document.visibilityState === 'visible') {
        track.getAnimations().forEach(a => a.play());
      }
    };

    const holdWhileScrolling = () => {
      hold();
      window.clearTimeout(resumeTimers.get(col));
      resumeTimers.set(col, window.setTimeout(release, RESUME_DELAY));
    };

    col.addEventListener('pointerenter', hold);
    col.addEventListener('pointerdown', hold);
    col.addEventListener('pointerleave', release);
    col.addEventListener('pointercancel', release);
    col.addEventListener('focusin', hold);
    col.addEventListener('focusout', (event) => {
      if (!col.contains(event.relatedTarget)) release();
    });
    col.addEventListener('scroll', holdWhileScrolling, { passive: true });
  });
}

initSpeakersMarquee();

initViewportMotion();

/* ── Deferred blog embed ── */
function initDeferredBlogEmbed() {
  const container = document.getElementById('soro-blog');
  const src = container?.dataset.embedSrc;
  if (!container || !src) return;

  let loaded = false;
  function loadEmbed() {
    if (loaded) return;
    loaded = true;
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
  }

  if (!('IntersectionObserver' in window)) {
    loadEmbed();
    return;
  }

  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    loadEmbed();
  }, { rootMargin: '1200px 0px' });

  observer.observe(container);
}

initDeferredBlogEmbed();

/* ── Agenda day tabs with sliding pill + fade swap + stats update ── */
const dayTabs = document.querySelector('.agenda-day-tabs');
const dayButtons = document.querySelectorAll('.agenda-day-btn');
const dayContents = document.querySelectorAll('.agenda-day-content');
const agendaTitle = document.getElementById('agenda-day-title');
const agendaStats = document.getElementById('agenda-stats');

function computeDayStats(dayId) {
  const day = document.getElementById(dayId);
  if (!day) return null;

  const allCards = day.querySelectorAll('.agenda-card');
  if (allCards.length === 0) {
    // Placeholder day (Day 2 currently)
    return null;
  }

  // Exclude non-program items (lunch, registration, open slots) from session count
  const cards = day.querySelectorAll(
    '.agenda-card:not([data-track="lunch"]):not([data-track="break"])'
  );

  let totalMinutes = 0;
  const speakers = new Set();

  allCards.forEach(card => {
    const dur = parseInt(card.dataset.duration, 10);
    // Salón B runs alongside Salón A — counting both would double the day length
    if (!Number.isNaN(dur) && !card.hasAttribute('data-parallel')) totalMinutes += dur;
    // Only count human speakers: must have a role and not be a placeholder (TBA/TBC)
    card.querySelectorAll('.agenda-card-speaker').forEach(speakerEl => {
      const nameEl = speakerEl.querySelector('.agenda-speaker-name');
      const roleEl = speakerEl.querySelector('.agenda-speaker-role');
      const name = nameEl?.textContent.trim();
      if (nameEl && roleEl && !/^to be (announced|confirmed)$/i.test(name)) {
        speakers.add(name);
      }
    });
  });

  const hours = Math.round(totalMinutes / 60);

  return {
    sessions: cards.length,
    hours,
    speakers: speakers.size,
  };
}

function renderDayStats(stats) {
  if (!agendaStats) return;

  if (!stats) {
    agendaStats.innerHTML = `
      <span class="agenda-stat"><strong>Full</strong>&nbsp;program announcing</span>
      <span class="agenda-stat"><strong>Aug</strong>&nbsp;2026</span>
    `;
    return;
  }

  const speakerWord = stats.speakers === 1 ? 'speaker' : 'speakers';
  const sessionWord = stats.sessions === 1 ? 'session' : 'sessions';
  agendaStats.innerHTML = `
    <span class="agenda-stat"><strong>${stats.sessions}</strong>&nbsp;${sessionWord}</span>
    <span class="agenda-stat"><strong>${stats.hours || '<1'}</strong>&nbsp;${stats.hours === 1 ? 'hour' : 'hours'}</span>
    <span class="agenda-stat"><strong>${stats.speakers}</strong>&nbsp;${speakerWord}</span>
  `;
}

function switchDay(targetDay, label, accent) {
  dayButtons.forEach(b => {
    const active = b.dataset.day === targetDay;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', String(active));
  });

  if (dayTabs) dayTabs.setAttribute('data-active', targetDay);

  if (agendaTitle) {
    agendaTitle.innerHTML = `${label} <span class="agenda-title-accent">${accent || 'Agenda'}</span>`;
  }

  // Fade-swap visible content
  const current = document.querySelector('.agenda-day-content:not(.hidden)');
  const next = document.getElementById(targetDay);
  if (!next || current === next) {
    renderDayStats(computeDayStats(targetDay));
    return;
  }

  const swap = () => {
    dayContents.forEach(c => c.classList.add('hidden'));
    next.classList.remove('hidden');
    // Reveal cards that were hidden (display:none) when the scroll observer
    // first ran — otherwise they'd stay at opacity:0 on a freshly shown day.
    next.querySelectorAll('.reveal:not(.is-visible)').forEach(el => el.classList.add('is-visible'));
    next.classList.add('is-fading');
    renderDayStats(computeDayStats(targetDay));
    // Force layout so the browser commits opacity:0 before transitioning back
    void next.offsetWidth;
    next.classList.remove('is-fading');
  };

  if (current && !prefersReducedMotion) {
    current.classList.add('is-fading');
    setTimeout(swap, 180);
  } else {
    swap();
  }
}

dayButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    switchDay(btn.dataset.day, btn.dataset.label, btn.dataset.accent);
  });
});

// Initialize stats on load
renderDayStats(computeDayStats('day1'));

/* ── Scroll-reveal observer ── */
const revealEls = document.querySelectorAll('.reveal, .reveal-grid > *');

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach(el => el.classList.add('is-visible'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );
  revealEls.forEach(el => io.observe(el));
}

/* ── Navbar scroll state + scroll-to-top visibility ── */
const navbar = document.querySelector('.navbar');
const scrollTopBtn = document.querySelector('.scroll-top');

let scrollTicking = false;
function onScroll() {
  const y = window.scrollY;
  if (navbar) navbar.classList.toggle('is-scrolled', y > 40);
  if (scrollTopBtn) scrollTopBtn.classList.toggle('is-visible', y > 600);
  scrollTicking = false;
}

window.addEventListener(
  'scroll',
  () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(onScroll);
      scrollTicking = true;
    }
  },
  { passive: true }
);

onScroll();

if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  });
}

/* ── Sponsor contact popup ──
   Plain mailto: links "do nothing" for visitors without a configured mail
   client, so any [data-sponsor-contact] trigger opens a small dialog that
   shows the email with a copy button plus a mailto fallback. The href stays
   a real mailto so the link still works with JS disabled. */
const SPONSOR_EMAIL = 'info@chaicpr.com';

function initSponsorContact() {
  const triggers = document.querySelectorAll('[data-sponsor-contact]');
  if (triggers.length === 0) return;

  let lastTrigger = null;

  const overlay = document.createElement('div');
  overlay.className = 'sponsor-modal';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="sponsor-modal-box" role="dialog" aria-modal="true"
         aria-labelledby="sponsor-modal-title" tabindex="-1">
      <button type="button" class="sponsor-modal-close" aria-label="Close">&times;</button>
      <h3 class="sponsor-modal-title" id="sponsor-modal-title">Become a Sponsor</h3>
      <p class="sponsor-modal-text">
        For sponsorship inquiries and any questions, please contact us by
        email. Copy the address below or open your email app.
      </p>
      <div class="sponsor-modal-email">
        <span class="sponsor-modal-address">${SPONSOR_EMAIL}</span>
        <button type="button" class="sponsor-modal-copy">Copy</button>
      </div>
      <a class="sponsor-modal-mailto" href="mailto:${SPONSOR_EMAIL}">Open email app</a>
    </div>
  `;
  document.body.appendChild(overlay);

  const box = overlay.querySelector('.sponsor-modal-box');
  const closeBtn = overlay.querySelector('.sponsor-modal-close');
  const copyBtn = overlay.querySelector('.sponsor-modal-copy');

  function open(trigger) {
    lastTrigger = trigger || null;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sponsor-modal-open');
    box.focus();
  }

  function close() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('sponsor-modal-open');
    copyBtn.textContent = 'Copy';
    copyBtn.classList.remove('is-copied');
    if (lastTrigger) lastTrigger.focus();
  }

  function copyEmail() {
    const done = () => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('is-copied');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(SPONSOR_EMAIL).then(done).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  }

  function fallbackCopy() {
    const ta = document.createElement('textarea');
    ta.value = SPONSOR_EMAIL;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('is-copied');
    } catch (e) {
      copyBtn.textContent = 'Copy failed';
    }
    document.body.removeChild(ta);
  }

  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      open(trigger);
    });
  });

  closeBtn.addEventListener('click', close);
  copyBtn.addEventListener('click', copyEmail);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });
}

initSponsorContact();
