const fs = require("node:fs");
const path = require("node:path");
const sanitizeHtml = require("sanitize-html");

const TOKEN = "40ed19b5-41cf-4466-80de-457d5cf25217";
const API_BASE = "https://app.trysoro.com";
const EMBED_URL = `${API_BASE}/api/embed/${TOKEN}`;
const TIMEOUT_MS = 20000;

async function getJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!response.ok) {
    throw new Error(`Soro returned ${response.status} for ${url}`);
  }
  return response.json();
}

async function getText(url) {
  const response = await fetch(url, {
    headers: { Accept: "text/javascript" },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!response.ok) {
    throw new Error(`Soro returned ${response.status} for ${url}`);
  }
  return response.text();
}

function safeContent(html) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "figure",
      "figcaption"
    ]),
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading", "decoding"],
      "*": ["id"]
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          ...(attribs.target === "_blank"
            ? { rel: "noopener noreferrer" }
            : {})
        }
      }),
      img: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          loading: "lazy",
          decoding: "async"
        }
      })
    },
    exclusiveFilter(frame) {
      const href = frame.attribs && frame.attribs.href;
      const src = frame.attribs && frame.attribs.src;
      return [href, src].some(
        (value) =>
          typeof value === "string" &&
          /^(?:javascript|data|vbscript):/i.test(value.trim())
      );
    }
  });
}

module.exports = async function () {
  const approvalPath = path.join(
    process.cwd(),
    "src",
    "_data",
    "articleApprovals.json"
  );
  const approvals = JSON.parse(fs.readFileSync(approvalPath, "utf8"));
  const approvedBySlug = new Map(
    approvals
      .filter((record) => record.approved)
      .map((record) => [record.slug, record])
  );

  const embedScript = await getText(EMBED_URL);
  const match = embedScript.match(
    /var SORO_ARTICLES = (\[[\s\S]*?\]);\s*var SORO_TOKEN/
  );
  if (!match) {
    throw new Error("Soro response did not contain a valid article manifest.");
  }

  let manifest;
  try {
    manifest = JSON.parse(match[1]);
  } catch (error) {
    throw new Error(`Soro article manifest was malformed: ${error.message}`);
  }
  if (!Array.isArray(manifest)) {
    throw new Error("Soro article manifest was not an array.");
  }

  const approved = manifest.filter((article) =>
    approvedBySlug.has(article.slug)
  );
  const missing = [...approvedBySlug.keys()].filter(
    (slug) => !approved.some((article) => article.slug === slug)
  );
  if (missing.length) {
    throw new Error(`Approved Soro articles are missing: ${missing.join(", ")}`);
  }

  const hydrated = await Promise.all(
    approved.map(async (article) => {
      const payload = await getJson(
        `${API_BASE}/api/embed/${TOKEN}/article/${article.id}`
      );
      if (!payload || typeof payload.content !== "string") {
        throw new Error(`Soro article ${article.slug} returned malformed content.`);
      }
      const approval = approvedBySlug.get(article.slug);
      return {
        ...article,
        content: safeContent(payload.content),
        approval,
        datePublished: article.isoDate,
        dateModified: `${approval.dateModified}T12:00:00-04:00`
      };
    })
  );

  return hydrated.sort(
    (a, b) => new Date(b.datePublished) - new Date(a.datePublished)
  );
};
