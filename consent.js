// CHAIC 2026 — consent management (Google Consent Mode v2)
//
// This file loads synchronously in <head> BEFORE the Google Tag Manager
// snippet, so the consent defaults are already in the dataLayer before any
// tag has a chance to fire. Order matters: move this below the GTM snippet
// and non-essential tags will fire unconsented on first paint.
//
// Two independent gates, on purpose:
//
//   1. Tag gating (authoritative) — region-scoped consent defaults. Google
//      resolves the visitor's region from their IP, which a static site on
//      GitHub Pages cannot do for itself. EEA/UK/CH visitors start denied;
//      everyone else starts granted.
//
//   2. Banner display (best effort) — an IANA time-zone heuristic, since we
//      have no server-side geo lookup to key the UI off. Both failure modes
//      are safe: a missed EEA visitor keeps the denied default and is simply
//      never measured, and a false positive only sees an extra banner.
//
// Deny-by-default only blocks tags that declare the matching consent type in
// GTM. See docs/privacy-and-consent.md for the required container setup.

(function () {
  'use strict';

  const STORAGE_KEY = 'chaic-consent-v1';

  // EEA (EU 27 + Iceland, Liechtenstein, Norway), the UK, and Switzerland.
  const CONSENT_REQUIRED_REGIONS = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
    'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
    'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH',
  ];

  // Time zones belonging to the regions above that do not sit under the
  // 'Europe/' prefix — Atlantic islands and Cyprus.
  const CONSENT_REQUIRED_ZONES = [
    'Atlantic/Azores', 'Atlantic/Canary', 'Atlantic/Faroe',
    'Atlantic/Madeira', 'Atlantic/Reykjavik',
    'Asia/Nicosia', 'Asia/Famagusta',
  ];

  const ESSENTIAL_SIGNALS = {
    functionality_storage: 'granted',
    security_storage: 'granted',
  };

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    window.dataLayer.push(arguments);
  }

  window.gtag = gtag;

  /* ── Consent state ── */

  // Maps our two user-facing categories onto Consent Mode v2 signals.
  function signalsFor(choice) {
    const analytics = choice.analytics ? 'granted' : 'denied';
    const marketing = choice.marketing ? 'granted' : 'denied';

    return {
      analytics_storage: analytics,
      ad_storage: marketing,
      ad_user_data: marketing,
      ad_personalization: marketing,
      personalization_storage: marketing,
    };
  }

  function defaultsFor(choice, region) {
    const payload = Object.assign({}, signalsFor(choice), ESSENTIAL_SIGNALS, {
      // Hold tags briefly so a stored or fast decision is applied before
      // anything fires, rather than firing twice.
      wait_for_update: 500,
    });

    if (region) payload.region = region;
    return payload;
  }

  function readStoredChoice() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;

      return {
        analytics: parsed.analytics === true,
        marketing: parsed.marketing === true,
      };
    } catch (error) {
      // Unreadable or disabled storage — treat as "no decision yet".
      return null;
    }
  }

  function storeChoice(choice) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        analytics: choice.analytics,
        marketing: choice.marketing,
        recordedAt: new Date().toISOString(),
      }));
    } catch (error) {
      // Private browsing or blocked storage: the choice still applies to
      // this page view, it just will not survive navigation.
    }
  }

  function applyChoice(choice) {
    gtag('consent', 'update', signalsFor(choice));

    // Gives GTM a trigger to hang consent-dependent tags off, and makes the
    // decision visible in Preview mode.
    window.dataLayer.push({
      event: 'chaic_consent_update',
      chaic_consent_analytics: choice.analytics ? 'granted' : 'denied',
      chaic_consent_marketing: choice.marketing ? 'granted' : 'denied',
    });
  }

  // Regions that require prior consent go first: a region-scoped default
  // takes precedence over the unscoped one that follows.
  gtag('consent', 'default', defaultsFor(
    { analytics: false, marketing: false },
    CONSENT_REQUIRED_REGIONS
  ));
  gtag('consent', 'default', defaultsFor({ analytics: true, marketing: true }));

  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);

  const storedChoice = readStoredChoice();
  if (storedChoice) applyChoice(storedChoice);

  /* ── Banner ── */

  function needsBanner() {
    let zone;

    try {
      zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      zone = null;
    }

    // No usable time zone means we cannot rule the visitor out — ask.
    if (!zone) return true;

    return zone.indexOf('Europe/') === 0
      || CONSENT_REQUIRED_ZONES.indexOf(zone) !== -1;
  }

  const BANNER_MARKUP = [
    '<div class="consent-banner-inner">',
    '  <div class="consent-banner-copy">',
    '    <h2 class="consent-banner-title">Your privacy choices</h2>',
    '    <p class="consent-banner-text">',
    '      Essential cookies keep this site working. We would also like to use',
    '      analytics and marketing cookies from Google and Meta to see which',
    '      sessions draw interest and to measure our advertising. Those load',
    '      only if you say yes.',
    '      <a href="privacy.html">Read the privacy notice</a>.',
    '    </p>',
    '  </div>',
    '  <div class="consent-options" data-consent-options hidden>',
    '    <label class="consent-option">',
    '      <input type="checkbox" data-consent-toggle="analytics">',
    '      <span class="consent-option-copy">',
    '        <strong>Analytics</strong>',
    '        Google Analytics 4 — page views, referrers, and rough location, so',
    '        we know which parts of the programme people come for.',
    '      </span>',
    '    </label>',
    '    <label class="consent-option">',
    '      <input type="checkbox" data-consent-toggle="marketing">',
    '      <span class="consent-option-copy">',
    '        <strong>Marketing</strong>',
    '        Meta Pixel — tells us whether our ads are reaching clinicians and',
    '        researchers, and lets Meta show CHAIC ads to similar audiences.',
    '      </span>',
    '    </label>',
    '    <button type="button" class="consent-btn consent-btn--save" data-consent-action="save">',
    '      Save my choices',
    '    </button>',
    '  </div>',
    '  <div class="consent-banner-actions">',
    '    <button type="button" class="consent-btn consent-btn--ghost" data-consent-action="customize" aria-expanded="false" aria-controls="consent-options">',
    '      Customize',
    '    </button>',
    '    <button type="button" class="consent-btn consent-btn--ghost" data-consent-action="reject">',
    '      Reject non-essential',
    '    </button>',
    '    <button type="button" class="consent-btn consent-btn--primary" data-consent-action="accept">',
    '      Accept all',
    '    </button>',
    '  </div>',
    '</div>',
  ].join('\n');

  let banner = null;

  function closeBanner() {
    if (!banner) return;
    banner.remove();
    banner = null;
  }

  function commit(choice) {
    storeChoice(choice);
    applyChoice(choice);
    closeBanner();
  }

  function buildBanner(initial) {
    const el = document.createElement('section');
    el.className = 'consent-banner';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Privacy and cookie choices');
    el.setAttribute('tabindex', '-1');
    el.dataset.consentBanner = '';
    el.innerHTML = BANNER_MARKUP;

    const options = el.querySelector('[data-consent-options]');
    options.id = 'consent-options';

    const toggles = {
      analytics: el.querySelector('[data-consent-toggle="analytics"]'),
      marketing: el.querySelector('[data-consent-toggle="marketing"]'),
    };
    toggles.analytics.checked = initial.analytics;
    toggles.marketing.checked = initial.marketing;

    const customizeBtn = el.querySelector('[data-consent-action="customize"]');

    el.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-consent-action]');
      if (!trigger) return;

      switch (trigger.dataset.consentAction) {
        case 'accept':
          commit({ analytics: true, marketing: true });
          break;
        case 'reject':
          commit({ analytics: false, marketing: false });
          break;
        case 'save':
          commit({
            analytics: toggles.analytics.checked,
            marketing: toggles.marketing.checked,
          });
          break;
        case 'customize': {
          const opening = options.hidden;
          options.hidden = !opening;
          customizeBtn.setAttribute('aria-expanded', String(opening));
          if (opening) toggles.analytics.focus();
          break;
        }
      }
    });

    return el;
  }

  function openBanner() {
    if (!banner) {
      banner = buildBanner(readStoredChoice() || { analytics: false, marketing: false });
      document.body.appendChild(banner);
    }
    return banner;
  }

  function init() {
    if (readStoredChoice() || !needsBanner()) return;

    // First render only: show the banner without pulling focus out from
    // under someone who is already reading. Reopening from the privacy
    // notice does move focus, since that is a deliberate action.
    openBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // "Review cookie choices" controls, wherever they appear — currently the
  // privacy notice. Delegated so it does not depend on load order.
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-open-consent]');
    if (!trigger) return;

    event.preventDefault();
    openBanner().focus();
  });

  window.CHAICConsent = Object.freeze({
    storageKey: STORAGE_KEY,
    getChoice: readStoredChoice,
    isConsentRegion: needsBanner,
    open: function () {
      openBanner().focus();
    },
  });
})();
