// CHAIC 2026 — early-bird promotion bootstrap
//
// This file loads in <head> so the active state is known before the page
// renders. The regular-price experience remains the safe HTML default.
(function () {
  'use strict';

  const END_AT = '2026-08-01T00:00:00-04:00';
  const endAtMs = Date.parse(END_AT);

  function isActive(nowMs) {
    return (typeof nowMs === 'number' ? nowMs : Date.now()) < endAtMs;
  }

  window.CHAICPromotion = Object.freeze({
    endAt: END_AT,
    endAtMs,
    isActive,
  });

  if (isActive()) {
    document.documentElement.classList.add('early-bird-active');
  }
})();
