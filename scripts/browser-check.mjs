import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.CHAIC_TEST_URL || "http://127.0.0.1:4173";
const screenshotDirectory =
  process.env.CHAIC_SCREENSHOT_DIR || path.join("/tmp", "chaic-browser-check");
const browser = await chromium.launch({ headless: true });
const errors = [];
const results = [];

await fs.mkdir(screenshotDirectory, { recursive: true });

async function newPage(options = {}) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  await page.route(
    /googletagmanager|google-analytics|doubleclick|embed\.lu\.ma/,
    (route) => route.abort()
  );
  page.on("pageerror", (error) =>
    errors.push(`Browser error: ${error.message}`)
  );
  return { context, page };
}

async function inspect(pathname, viewport, screenshotName) {
  const { context, page } = await newPage({ viewport });
  await page.goto(`${baseUrl}${pathname}`, { waitUntil: "networkidle" });
  const metrics = await page.evaluate(() => {
    const documentElement = document.documentElement;
    const heroCta = document.querySelector(".hero [data-checkout]");
    const video = document.querySelector("[data-desktop-video]");
    const resources = performance.getEntriesByType("resource");
    return {
      overflow: documentElement.scrollWidth - documentElement.clientWidth,
      domElements: document.querySelectorAll("*").length,
      heroCtaVisible: heroCta
        ? Boolean(
            heroCta.offsetWidth ||
              heroCta.offsetHeight ||
              heroCta.getClientRects().length
          )
        : null,
      videoSources: video ? video.querySelectorAll("source").length : null,
      videoRequested: resources.some((entry) =>
        entry.name.includes("ai-brain-hero.mp4")
      ),
      firstPartyBytes: resources
        .filter((entry) => entry.name.startsWith(location.origin))
        .reduce(
          (total, entry) =>
            total + (entry.transferSize || entry.encodedBodySize || 0),
          0
        )
    };
  });
  if (metrics.overflow > 1) {
    errors.push(
      `${pathname} ${viewport.width}px overflows by ${metrics.overflow}px`
    );
  }
  if (pathname === "/" && !metrics.heroCtaVisible) {
    errors.push(`Homepage CTA is not visible at ${viewport.width}px`);
  }
  if (
    pathname === "/" &&
    viewport.width <= 768 &&
    (metrics.videoSources !== 0 || metrics.videoRequested)
  ) {
    errors.push(`Mobile homepage loaded the hero video at ${viewport.width}px`);
  }
  if (pathname === "/" && metrics.domElements > 1500) {
    errors.push(`Homepage DOM has ${metrics.domElements} elements`);
  }
  if (pathname === "/" && metrics.firstPartyBytes > 1.5 * 1024 * 1024) {
    errors.push("Homepage initial first-party transfer exceeded 1.5 MB");
  }
  if (screenshotName) {
    await page.screenshot({
      path: path.join(screenshotDirectory, screenshotName),
      fullPage: true
    });
  }
  results.push({ pathname, viewport, ...metrics });
  await context.close();
}

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 320, height: 568 }
]) {
  await inspect(
    "/",
    viewport,
    viewport.width === 1440
      ? "home-desktop.png"
      : viewport.width === 390
        ? "home-mobile.png"
        : null
  );
}

await inspect(
  "/tickets.html",
  { width: 390, height: 844 },
  "tickets-mobile.png"
);
await inspect("/speakers.html", { width: 320, height: 568 });
await inspect("/es/", { width: 390, height: 844 }, "home-es-mobile.png");
await inspect("/blog/", { width: 390, height: 844 });
await inspect(
  "/blog/medical-ai-governance-guide/",
  { width: 390, height: 844 }
);

{
  const { context, page } = await newPage({
    viewport: { width: 390, height: 844 }
  });
  await page.goto(`${baseUrl}/agenda.html`, { waitUntil: "networkidle" });
  await page.locator('[data-agenda-tab="1"]').focus();
  await page.keyboard.press("ArrowRight");
  const state = await page.evaluate(() => ({
    selected: document
      .querySelector('[data-agenda-tab="2"]')
      ?.getAttribute("aria-selected"),
    dayTwoHidden: document
      .querySelector('[data-agenda-panel="2"]')
      ?.hasAttribute("hidden")
  }));
  if (state.selected !== "true" || state.dayTwoHidden) {
    errors.push("Agenda tabs failed keyboard activation");
  }
  await page.locator("[data-menu-toggle]").click();
  await page.keyboard.press("Escape");
  const menuState = await page
    .locator("[data-menu-toggle]")
    .getAttribute("aria-expanded");
  const focused = await page.evaluate(
    () =>
      document.activeElement === document.querySelector("[data-menu-toggle]")
  );
  if (menuState !== "false" || !focused) {
    errors.push("Mobile menu did not close and return focus on Escape");
  }
  await context.close();
}

{
  const { context, page } = await newPage({
    viewport: { width: 1280, height: 800 }
  });
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await page.locator(".workshop-picture img").first().scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () => document.querySelector(".workshop-picture img")?.naturalWidth > 0
  );
  await page.locator(".language-link").click();
  await page.waitForURL(`${baseUrl}/es/`);
  const preference = await page.evaluate(() =>
    localStorage.getItem("chaic-language")
  );
  if (preference !== "es") {
    errors.push("Language switcher did not remember the voluntary choice");
  }
  await context.close();
}

{
  const { context, page } = await newPage({
    viewport: { width: 390, height: 844 }
  });
  await page.goto(`${baseUrl}/tickets.html`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    window.addEventListener("click", (event) => event.preventDefault(), true);
  });
  await page.locator(".ticket-card [data-checkout]").first().click();
  const eventCounts = await page.evaluate(() => ({
    checkout: window.dataLayer.filter((item) => item.event === "begin_checkout")
      .length,
    cta: window.dataLayer.filter((item) => item.event === "cta_click").length,
    passId: window.dataLayer.find((item) => item.event === "begin_checkout")
      ?.pass_id,
    ctaLocation: window.dataLayer.find(
      (item) => item.event === "begin_checkout"
    )?.cta_location
  }));
  if (
    eventCounts.checkout !== 1 ||
    eventCounts.cta !== 1 ||
    eventCounts.passId !== "student" ||
    eventCounts.ctaLocation !== "tickets_page"
  ) {
    errors.push("Checkout analytics did not emit exactly one attributed event");
  }
  if (await page.locator(".mobile-register").count()) {
    errors.push("Tickets page unexpectedly includes the mobile registration bar");
  }
  await context.close();
}

{
  const { context, page } = await newPage({
    viewport: { width: 390, height: 844 },
    javaScriptEnabled: false
  });
  await page.goto(`${baseUrl}/agenda.html`, { waitUntil: "load" });
  const noJs = await page.evaluate(() => ({
    dayOne: document.body.textContent.includes("Beyond the Hype"),
    dayTwo: document.body.textContent.includes("MedGemma"),
    dayTwoVisible:
      getComputedStyle(document.querySelector('[data-agenda-panel="2"]'))
        .display !== "none",
    navigationVisible:
      getComputedStyle(document.querySelector(".primary-nav")).display !== "none",
    registrationHref: document
      .querySelector("[data-checkout]")
      ?.getAttribute("href")
  }));
  if (
    !noJs.dayOne ||
    !noJs.dayTwo ||
    !noJs.dayTwoVisible ||
    !noJs.navigationVisible ||
    !noJs.registrationHref?.startsWith("https://lu.ma/")
  ) {
    errors.push("JavaScript-disabled agenda or Luma fallback is incomplete");
  }
  await context.close();
}

{
  const { context, page } = await newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce"
  });
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const reduced = await page.evaluate(() => ({
    sources: document.querySelectorAll("[data-desktop-video] source").length,
    requested: performance
      .getEntriesByType("resource")
      .some((entry) => entry.name.includes("ai-brain-hero.mp4"))
  }));
  if (reduced.sources || reduced.requested) {
    errors.push("Reduced-motion mode loaded the hero video");
  }
  await context.close();
}

await browser.close();

console.log(JSON.stringify({ results, screenshotDirectory }, null, 2));
if (errors.length) {
  console.error(`Browser checks failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(
  "Responsive, interaction, no-JavaScript, and reduced-motion checks passed."
);
