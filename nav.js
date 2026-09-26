// Shared navigation for every page. Keep this script at the nav's position in
// the HTML so script.js can attach the mobile-menu handlers afterward.
(function () {
  'use strict';

  const script = document.currentScript;
  const siteRoot = new URL('.', script.src);
  const pagePath = window.location.pathname;
  const isHome = pagePath === siteRoot.pathname ||
    pagePath === new URL('index.html', siteRoot).pathname;
  const homeLink = (hash) => isHome ? `#${hash}` : new URL(`#${hash}`, siteRoot).href;
  const pageLink = (path) => new URL(path, siteRoot).href;

  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.setAttribute('aria-label', 'Main navigation');
  nav.innerHTML = `
    <div class="nav-inner">
      <a class="nav-logo" href="${homeLink('home')}">
        <img src="${pageLink('images/logos/CHAIC-Logo.webp')}" alt="CHAIC" />
      </a>
      <ul class="nav-menu">
        <li><a href="${homeLink('home')}" data-page="home">Home</a></li>
        <li><a href="${homeLink('about')}">About</a></li>
        <li><a href="${pageLink('speakers.html')}" data-page="speakers">Speakers</a></li>
        <li><a href="${homeLink('agenda')}">Agenda</a></li>
        <li><a href="${pageLink('workshops.html')}" data-page="workshops">Workshops</a></li>
        <li><a href="${homeLink('sponsors')}">Sponsors</a></li>
        <li><a href="${pageLink('blog/')}" data-page="blog">Blog</a></li>
        <li><a href="${pageLink('tickets.html')}" data-page="tickets">Ticket</a></li>
        <li class="nav-contact-item">
          <a href="${homeLink('contact-form')}" class="btn-contact">
            Contact Us
            <span class="btn-circle-nav">&#8594;</span>
          </a>
        </li>
      </ul>
      <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  `;

  const currentPage = isHome ? 'home' :
    pagePath === new URL('speakers.html', siteRoot).pathname ? 'speakers' :
    pagePath === new URL('workshops.html', siteRoot).pathname ? 'workshops' :
    pagePath === new URL('tickets.html', siteRoot).pathname ? 'tickets' :
    pagePath === new URL('blog/', siteRoot).pathname ||
    pagePath === new URL('blog/index.html', siteRoot).pathname ? 'blog' : null;
  if (currentPage) {
    const currentLink = nav.querySelector(`[data-page="${currentPage}"]`);
    currentLink.classList.add('is-active');
    currentLink.setAttribute('aria-current', 'page');
  }

  script.replaceWith(nav);
})();
