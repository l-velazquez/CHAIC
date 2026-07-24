(() => {
  "use strict";

  const dataLayer = (window.dataLayer = window.dataLayer || []);
  const push = (event, details = {}) => dataLayer.push({ event, ...details });

  const menuButton = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  if (menuButton && menu) {
    const closeMenu = () => {
      menu.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    };
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
    });
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        closeMenu();
        menuButton.focus();
      }
    });
  }

  const legacyPost = new URLSearchParams(window.location.search).get("post");
  if (
    legacyPost &&
    /^\/(?:index\.html)?$/.test(window.location.pathname) &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(legacyPost)
  ) {
    window.location.replace(`/blog/${legacyPost}/`);
    return;
  }

  document.querySelectorAll("[data-countdown]").forEach((container) => {
    const deadline = new Date(container.dataset.deadline).getTime();
    const fields = {
      days: container.querySelector("[data-days]"),
      hours: container.querySelector("[data-hours]"),
      minutes: container.querySelector("[data-minutes]")
    };
    const update = () => {
      const remaining = Math.max(0, deadline - Date.now());
      const values = {
        days: Math.floor(remaining / 86400000),
        hours: Math.floor((remaining % 86400000) / 3600000),
        minutes: Math.floor((remaining % 3600000) / 60000)
      };
      Object.entries(fields).forEach(([key, node]) => {
        if (node) node.textContent = String(values[key]).padStart(2, "0");
      });
    };
    update();
    window.setInterval(update, 60000);
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = window.matchMedia("(min-width: 769px)");
  const saveData = Boolean(
    navigator.connection && navigator.connection.saveData
  );
  if (desktop.matches && !reducedMotion.matches && !saveData) {
    document.querySelectorAll("[data-desktop-video]").forEach((video) => {
      const source = document.createElement("source");
      source.src = video.dataset.videoSrc;
      source.type = "video/mp4";
      video.append(source);
      video.load();
      video
        .play()
        .then(() => video.classList.add("is-playing"))
        .catch(() => {});
    });
  }

  document.querySelectorAll("[data-agenda]").forEach((agenda) => {
    const tabs = [...agenda.querySelectorAll("[data-agenda-tab]")];
    const panels = [...agenda.querySelectorAll("[data-agenda-panel]")];
    const activate = (tab, focus = false) => {
      tabs.forEach((candidate) => {
        const active = candidate === tab;
        candidate.setAttribute("aria-selected", String(active));
        candidate.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.agendaPanel !== tab.dataset.agendaTab;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (event) => {
        let targetIndex = index;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          targetIndex = (index + 1) % tabs.length;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          targetIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          targetIndex = 0;
        } else if (event.key === "End") {
          targetIndex = tabs.length - 1;
        } else {
          return;
        }
        event.preventDefault();
        activate(tabs[targetIndex], true);
      });
    });
    const initiallySelected =
      tabs.find((tab) => tab.getAttribute("aria-selected") === "true") ||
      tabs[0];
    if (initiallySelected) activate(initiallySelected);
  });

  document.querySelectorAll("[data-language-switch]").forEach((link) => {
    link.addEventListener("click", () => {
      try {
        localStorage.setItem(
          "chaic-language",
          link.dataset.destinationLanguage
        );
      } catch (_) {}
      push("language_switch", {
        source: link.dataset.sourceLanguage,
        destination: link.dataset.destinationLanguage
      });
    });
  });

  document.querySelectorAll("[data-sponsor-contact]").forEach((link) => {
    link.addEventListener("click", () => {
      push("sponsor_contact", {
        page: window.location.pathname,
        language: document.body.dataset.locale || "en"
      });
    });
  });

  document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]').forEach(
    (link) => {
      link.addEventListener("click", () => {
        push("whatsapp_contact", {
          page: window.location.pathname,
          language: document.body.dataset.locale || "en"
        });
      });
    }
  );

  document.querySelectorAll("[data-cta-event]").forEach((link) => {
    link.addEventListener("click", () => {
      push("cta_click", {
        location: link.dataset.ctaLocation || "unknown",
        language: document.body.dataset.locale || "en",
        label: link.dataset.label || link.textContent.trim(),
        destination: link.href
      });
    });
  });

  let lumaLoading = false;
  const lumaEventId = "evt-fLWU47cvAQBa6a1";
  const checkoutLinks = [...document.querySelectorAll("[data-checkout]")];
  checkoutLinks.forEach((link) => {
    link.classList.add("luma-checkout--button");
    link.dataset.lumaAction = "checkout";
    link.dataset.lumaEventId = lumaEventId;
    link.addEventListener("click", () => {
      const details = {
        pass_id: link.dataset.passId || "general",
        cta_location: link.dataset.ctaLocation || "unknown",
        language: document.body.dataset.locale || "en"
      };
      push("cta_click", {
        location: details.cta_location,
        language: details.language,
        label: link.dataset.label || link.textContent.trim(),
        destination: link.href
      });
      push("begin_checkout", details);
      if (link.dataset.articleSlug) {
        push("blog_event_cta", {
          article_slug: link.dataset.articleSlug,
          cta_destination: link.href
        });
      }
      loadLuma();
    });
    link.addEventListener("pointerenter", loadLuma, { once: true });
    link.addEventListener("focus", loadLuma, { once: true });
  });

  function loadLuma() {
    if (lumaLoading || document.getElementById("luma-checkout")) return;
    lumaLoading = true;
    const script = document.createElement("script");
    script.id = "luma-checkout";
    script.src = "https://embed.lu.ma/checkout-button.js";
    script.async = true;
    script.addEventListener("error", () => {
      lumaLoading = false;
      script.remove();
    });
    document.head.append(script);
  }

  const ticketSection = document.querySelector("[data-ticket-section]");
  if (ticketSection && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadLuma();
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(ticketSection);
  }
})();
