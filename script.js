// CHAIC 2026 — interactive behaviors

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

/* ── Countdown to September 25, 2026 ── */
const TARGET = new Date('2026-09-25T00:00:00');

const elDays    = document.getElementById('cd-days');
const elHours   = document.getElementById('cd-hours');
const elMinutes = document.getElementById('cd-minutes');
const elSeconds = document.getElementById('cd-seconds');

function pad(n, len) {
  return String(n).padStart(len, '0');
}

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

/* ── Sponsor carousel: duplicate the base 4 cards 3 more times ──
   so the marquee loops seamlessly (track moves -25% per cycle). */
function duplicateSponsorTrack() {
  const track = document.getElementById('sponsors-track');
  if (!track) return;
  const originals = Array.from(track.children);
  if (originals.length === 0) return;

  for (let i = 0; i < 3; i++) {
    originals.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      const img = clone.querySelector('img');
      if (img) img.removeAttribute('loading');
      track.appendChild(clone);
    });
  }
}

duplicateSponsorTrack();

/* ── Speakers marquee: duplicate cards in each track once so the
   vertical (or horizontal on mobile) scroll loops seamlessly.
   The visible roster is the originals; clones are aria-hidden. */
function duplicateSpeakersTracks() {
  document.querySelectorAll('.speakers-track').forEach(track => {
    const originals = Array.from(track.children);
    if (originals.length === 0) return;
    originals.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      const img = clone.querySelector('img');
      if (img) img.removeAttribute('loading');
      track.appendChild(clone);
    });
  });
}

duplicateSpeakersTracks();

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

  // Exclude non-program items (lunch, breaks) from session count
  const cards = day.querySelectorAll('.agenda-card:not([data-track="lunch"])');

  let totalMinutes = 0;
  const speakers = new Set();

  allCards.forEach(card => {
    const dur = parseInt(card.dataset.duration, 10);
    if (!Number.isNaN(dur)) totalMinutes += dur;
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
const revealEls = document.querySelectorAll('.reveal');

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
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
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

