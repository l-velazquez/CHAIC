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
    const durEl = card.querySelector('.agenda-duration');
    if (durEl) {
      const match = durEl.textContent.match(/(\d+)/);
      if (match) totalMinutes += parseInt(match[1], 10);
    }
    // Only count human speakers: must have a role and not be "To Be Announced"
    card.querySelectorAll('.agenda-card-speaker').forEach(speakerEl => {
      const nameEl = speakerEl.querySelector('.agenda-speaker-name');
      const roleEl = speakerEl.querySelector('.agenda-speaker-role');
      if (nameEl && roleEl && nameEl.textContent.trim() !== 'To Be Announced') {
        speakers.add(nameEl.textContent.trim());
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

function switchDay(targetDay, label) {
  dayButtons.forEach(b => {
    const active = b.dataset.day === targetDay;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', String(active));
  });

  if (dayTabs) dayTabs.setAttribute('data-active', targetDay);

  if (agendaTitle) {
    agendaTitle.innerHTML = `${label} <span class="agenda-title-accent">Agenda</span>`;
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
    switchDay(btn.dataset.day, btn.dataset.label);
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

/* ── Contact form async submit ── */
const contactFormEl = document.getElementById('contact-form-el');
const contactFormStatus = document.getElementById('contact-form-status');

if (contactFormEl) {
  contactFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = contactFormEl.querySelector('.contact-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const res = await fetch(contactFormEl.action, {
        method: 'POST',
        body: new FormData(contactFormEl),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        contactFormStatus.textContent = "Message sent! We'll be in touch soon.";
        contactFormStatus.className = 'contact-form-status contact-form-status--success';
        contactFormEl.reset();
      } else {
        throw new Error();
      }
    } catch {
      contactFormStatus.textContent = 'Something went wrong. Please email info@chaic.org directly.';
      contactFormStatus.className = 'contact-form-status contact-form-status--error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Book Free Consultation <span class="btn-circle" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
    }
  });
}
