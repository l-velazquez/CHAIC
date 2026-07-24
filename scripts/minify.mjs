import fs from "node:fs/promises";
import { transform } from "lightningcss";
import { minify } from "terser";

const cssPath = "_site/assets/css/site.css";
const jsPath = "_site/assets/js/site.js";

const cssSource = await fs.readFile(cssPath);
const cssResult = transform({
  filename: cssPath,
  code: cssSource,
  minify: true,
  targets: {
    chrome: 100 << 16,
    firefox: 100 << 16,
    safari: 15 << 16
  }
});
await fs.writeFile(cssPath, cssResult.code);

const jsSource = await fs.readFile(jsPath, "utf8");
const jsResult = await minify(jsSource, {
  compress: true,
  mangle: true,
  format: { comments: false }
});
if (!jsResult.code) throw new Error("Terser did not produce JavaScript output.");
await fs.writeFile(jsPath, jsResult.code);

console.log(
  `Minified first-party CSS to ${cssResult.code.length} bytes and JavaScript to ${Buffer.byteLength(jsResult.code)} bytes.`
);
