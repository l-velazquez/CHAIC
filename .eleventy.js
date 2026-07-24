const fs = require("node:fs");
const path = require("node:path");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ images: "images" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy({ "src/.nojekyll": ".nojekyll" });

  eleventyConfig.addFilter("json", (value) =>
    JSON.stringify(value).replace(/</g, "\\u003c")
  );
  eleventyConfig.addFilter("money", (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value)
  );
  eleventyConfig.addFilter("dateDisplay", (value, locale = "en") =>
    new Intl.DateTimeFormat(locale === "es" ? "es-PR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/Puerto_Rico"
    }).format(new Date(value))
  );
  eleventyConfig.addFilter("dateShort", (value, locale = "en") =>
    new Intl.DateTimeFormat(locale === "es" ? "es-PR" : "en-US", {
      month: "short",
      day: "numeric",
      timeZone: "America/Puerto_Rico"
    }).format(new Date(value))
  );
  eleventyConfig.addFilter("duration", (session, locale = "en") => {
    const minutes = Math.round(
      (new Date(session.endDate) - new Date(session.startDate)) / 60000
    );
    if (minutes < 60) return `${minutes} ${locale === "es" ? "min" : "min"}`;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return `${hours} ${locale === "es" ? "h" : "hr"}${remainder ? ` ${remainder} min` : ""}`;
  });
  eleventyConfig.addFilter("timeDisplay", (value, locale = "en") =>
    new Intl.DateTimeFormat(locale === "es" ? "es-PR" : "en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Puerto_Rico"
    }).format(new Date(value))
  );
  eleventyConfig.addFilter("where", (items, key, value) =>
    (items || []).filter((item) => item[key] === value)
  );
  eleventyConfig.addFilter("confirmed", (items) =>
    (items || []).filter((item) => item.status === "confirmed")
  );
  eleventyConfig.addFilter("featured", (items) =>
    (items || []).filter((item) => item.featured)
  );
  eleventyConfig.addFilter("limit", (items, count) =>
    (items || []).slice(0, count)
  );
  eleventyConfig.addFilter("withoutSlug", (items, slug) =>
    (items || []).filter((item) => item.slug !== slug)
  );
  eleventyConfig.addFilter("lookup", (items, id) =>
    (items || []).find((item) => item.id === id)
  );
  eleventyConfig.addFilter("absolute", (url, origin = "https://www.chaicpr.com") =>
    new URL(url, origin).href
  );
  eleventyConfig.addFilter("readableDate", (value, locale = "en") =>
    new Intl.DateTimeFormat(locale === "es" ? "es-PR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC"
    }).format(new Date(value))
  );
  eleventyConfig.addFilter("pageRange", (count) =>
    Array.from({ length: count }, (_, index) => index + 1)
  );
  eleventyConfig.addFilter("pageCount", (items, size) =>
    Math.ceil((items || []).length / size)
  );

  eleventyConfig.addCollection("publicPages", (api) =>
    api.getAll().filter((item) => item.data.indexable !== false && item.url)
  );

  eleventyConfig.on("eleventy.after", ({ dir }) => {
    const output = dir.output;
    const nonAssetSnippet = path.join(output, "images", "favicon-code.html");
    if (fs.existsSync(nonAssetSnippet)) {
      fs.rmSync(nonAssetSnippet);
    }
    const indexPath = path.join(output, "index.html");
    if (!fs.existsSync(indexPath)) {
      throw new Error(`Expected ${indexPath} to exist after the build.`);
    }
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
