import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "_site");
const origin = "https://www.chaicpr.com";
const errors = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function localFileForUrl(url) {
  const parsed = new URL(url, origin);
  let pathname = decodeURIComponent(parsed.pathname);
  if (pathname.endsWith("/")) pathname += "index.html";
  return path.join(output, pathname.replace(/^\/+/, ""));
}

function attr(tag, name) {
  const match = tag.match(
    new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)')`, "i")
  );
  return match ? match[1] ?? match[2] : null;
}

const htmlFiles = walk(output).filter((file) => file.endsWith(".html"));
const htmlByUrl = new Map();

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const relative = path.relative(output, file).split(path.sep).join("/");
  const pagePath =
    relative === "index.html"
      ? "/"
      : relative.endsWith("/index.html")
        ? `/${relative.slice(0, -"index.html".length)}`
        : `/${relative}`;
  htmlByUrl.set(new URL(pagePath, origin).href, { file, html });

  const label = path.relative(root, file);
  const noindex = /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html);
  const h1Count = (html.match(/<h1(?:\s|>)/gi) || []).length;
  if (h1Count !== 1) errors.push(`${label}: expected one H1, found ${h1Count}`);
  if (!/<html\s+lang="(?:en|es-PR)"/i.test(html)) {
    errors.push(`${label}: missing valid document language`);
  }
  if (!/<title>[^<]{8,}<\/title>/i.test(html)) {
    errors.push(`${label}: missing descriptive title`);
  }
  if (!/<meta\s+name="description"\s+content="[^"]{40,}"/i.test(html)) {
    errors.push(`${label}: missing descriptive meta description`);
  }
  if (!/<link\s+rel="canonical"\s+href="https:\/\/www\.chaicpr\.com\//i.test(html)) {
    errors.push(`${label}: missing absolute canonical`);
  }
  if (!/<meta\s+property="og:image"\s+content="https?:\/\//i.test(html)) {
    errors.push(`${label}: missing Open Graph image`);
  }
  if (!/<meta\s+name="twitter:card"\s+content="summary_large_image"/i.test(html)) {
    errors.push(`${label}: missing Twitter Card metadata`);
  }
  if (/href=(?:"#"|'#')/i.test(html)) {
    errors.push(`${label}: contains placeholder href="#"`);
  }
  if (/\?post=/i.test(html)) {
    errors.push(`${label}: internally links to a legacy article query URL`);
  }
  if (
    /googletagmanager\.com\/gtag\/js|google-analytics\.com|(?:^|[^\w])gtag\s*\(/i.test(
      html
    )
  ) {
    errors.push(`${label}: contains a direct GA loader instead of GTM-only analytics`);
  }

  const ids = [...html.matchAll(/\sid=(?:"([^"]+)"|'([^']+)')/gi)].map(
    (match) => match[1] ?? match[2]
  );
  const duplicateIds = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  if (duplicateIds.length) {
    errors.push(`${label}: duplicate IDs ${duplicateIds.join(", ")}`);
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    if (!attr(tag, "width") || !attr(tag, "height")) {
      errors.push(`${label}: image lacks intrinsic width/height: ${tag.slice(0, 90)}`);
    }
  }

  for (const match of html.matchAll(
    /<(?:a|link|script|img|source)\b[^>]*(?:href|src)=(?:"([^"]+)"|'([^']+)')[^>]*>/gi
  )) {
    const value = match[1] ?? match[2];
    if (
      !value ||
      value.startsWith("#") ||
      /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(value)
    ) {
      continue;
    }
    const normalized = value.replace(/&amp;/g, "&");
    const local = localFileForUrl(new URL(normalized, new URL(pagePath, origin)));
    if (!fs.existsSync(local)) {
      errors.push(`${label}: missing internal target ${normalized}`);
    }
  }

  for (const match of html.matchAll(
    /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi
  )) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      errors.push(`${label}: invalid JSON-LD (${error.message})`);
    }
  }

  if (relative.startsWith("blog/") && relative !== "blog/index.html" && !relative.includes("/page/")) {
    const content = html.match(
      /<div class="article-content">([\s\S]*?)<\/div>\s*<aside/
    )?.[1];
    if (!content) {
      errors.push(`${label}: missing static article body`);
    } else if (
      /<script|<iframe|<object|<embed|\son[a-z]+\s*=|javascript:|data:text\/html/i.test(
        content
      )
    ) {
      errors.push(`${label}: unsafe content survived Soro sanitization`);
    }
  }

  if (noindex && !/(?:privacy|privacidad|code-of-conduct|codigo-de-conducta)/.test(relative)) {
    errors.push(`${label}: unexpected noindex page`);
  }
}

for (const [url, page] of htmlByUrl) {
  const alternates = [
    ...page.html.matchAll(
      /<link\s+rel="alternate"\s+hreflang="(en|es-PR)"\s+href="([^"]+)"/gi
    )
  ];
  for (const [, , alternateUrl] of alternates) {
    const alternate = htmlByUrl.get(alternateUrl);
    if (!alternate) {
      errors.push(`${path.relative(root, page.file)}: missing hreflang target ${alternateUrl}`);
      continue;
    }
    if (!alternate.html.includes(`href="${url}"`)) {
      errors.push(`${path.relative(root, page.file)}: hreflang target is not reciprocal`);
    }
  }
}

const robots = fs.readFileSync(path.join(output, "robots.txt"), "utf8");
if (!robots.includes("Sitemap: https://www.chaicpr.com/sitemap.xml")) {
  errors.push("robots.txt does not declare the canonical sitemap");
}

const sitemap = fs.readFileSync(path.join(output, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (match) => match[1]
);
for (const url of sitemapUrls) {
  const file = localFileForUrl(url);
  if (!fs.existsSync(file)) {
    errors.push(`sitemap contains missing URL ${url}`);
  } else if (
    /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(
      fs.readFileSync(file, "utf8")
    )
  ) {
    errors.push(`sitemap contains noindex URL ${url}`);
  }
}

for (const name of ["Anthony Chang", "Arlen Meyers"]) {
  for (const file of [
    path.join(output, "speakers.html"),
    path.join(output, "es", "ponentes.html")
  ]) {
    if (fs.readFileSync(file, "utf8").includes(name)) {
      errors.push(`${path.relative(root, file)}: invited speaker ${name} rendered`);
    }
  }
}

for (const [relative, maximum] of [
  ["assets/css/site.css", 50 * 1024],
  ["assets/js/site.js", 50 * 1024]
]) {
  const bytes = fs.statSync(path.join(output, relative)).size;
  if (bytes > maximum) errors.push(`${relative} exceeds the 50 KB source budget`);
}

if (errors.length) {
  console.error(`Site validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Validated ${htmlFiles.length} HTML files, ${sitemapUrls.length} sitemap URLs, metadata, links, images, hreflang, JSON-LD, and sanitized article bodies.`
);
