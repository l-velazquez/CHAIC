// Countdown to September 25, 2026
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

tick();
setInterval(tick, 1000);

// Hamburger menu
const navToggle = document.querySelector('.nav-toggle');
const navMenu   = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
});

navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  });
});

// Agenda day tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.agenda-content').forEach(c => c.classList.add('hidden'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.day).classList.remove('hidden');
  });
});
