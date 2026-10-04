// Records the size (and whether it has transparency) of every product image, so the site can lay images out
// without layout shift even when the product list comes from the spreadsheet. Runs automatically before
// `npm run dev` and `npm run build`. To add a photo: put the file in public/products/ and reference its file name in the sheet.
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "public", "products");
const out = join(root, "src", "lib", "image-manifest.json");

function png(b) {
  if (b.length < 26 || b.toString("latin1", 1, 4) !== "PNG") return null;
  const ct = b[25];
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20), alpha: ct === 4 || ct === 6 };
}
function jpeg(b) {
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7), alpha: false };
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}
function webp(b) {
  if (b.length < 30 || b.toString("latin1", 0, 4) !== "RIFF" || b.toString("latin1", 8, 12) !== "WEBP") return null;
  const kind = b.toString("latin1", 12, 16);
  if (kind === "VP8X") return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3), alpha: (b[20] & 0x10) !== 0 };
  if (kind === "VP8 ") return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff, alpha: false };
  if (kind === "VP8L") { const v = b.readUInt32LE(21); return { width: (v & 0x3fff) + 1, height: ((v >> 14) & 0x3fff) + 1, alpha: ((v >> 28) & 1) === 1 }; }
  return null;
}

const manifest = {};
try {
  for (const f of readdirSync(dir).sort()) {
    if (!/\.(png|jpe?g|webp)$/i.test(f)) continue;
    const buf = readFileSync(join(dir, f));
    const info = /\.png$/i.test(f) ? png(buf) : /\.jpe?g$/i.test(f) ? jpeg(buf) : webp(buf);
    if (info && info.width > 0 && info.height > 0) manifest[f] = info;
    else console.warn(`[image-manifest] could not read the size of ${f}`);
  }
} catch (e) {
  console.warn("[image-manifest] no product images found:", e.message);
}
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(manifest, null, 1) + "\n");
console.log(`[image-manifest] ${Object.keys(manifest).length} images recorded`);
