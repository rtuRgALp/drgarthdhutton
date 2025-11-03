import { promises as fs } from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import sharp from "sharp";

const IMAGES_DIR = "images";
const OUT_DIR = "data";
const OUT_FILE = path.join(OUT_DIR, "images.json");

const exts = ["jpg", "jpeg", "png", "webp", "gif", "bmp"];

function titleFromFilename(file) {
  const base = path.basename(file, path.extname(file));
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

function toSrc(relPath) {
  return `./${relPath.replace(/\\/g, "/")}`;
}

async function getMetadata(file) {
  try {
    const meta = await sharp(file).metadata();
    if (!meta.width || !meta.height) return null;
    return {
      width: meta.width,
      height: meta.height,
      format: meta.format || path.extname(file).slice(1)
    };
  } catch {
    return null;
  }
}

async function main() {
  const patterns = exts.map(e => `${IMAGES_DIR}/**/*.${e}`);
  const files = await fg(patterns, { onlyFiles: true, ignore: ["**/thumbs/**", "**/.*/**"] });
  const entries = [];

  for (const file of files) {
    const meta = await getMetadata(file);
    if (!meta) {
      console.error(`Skipping unreadable image: ${file}`);
      continue;
    }
    const stat = await fs.stat(file);
    const rel = path.relative(".", file);
    entries.push({
      src: toSrc(rel),
      w: meta.width,
      h: meta.height,
      alt: titleFromFilename(file),
      title: titleFromFilename(file),
      tags: [],
      date: new Date(stat.mtime).toISOString().slice(0, 10),
      format: meta.format
    });
  }

  entries.sort((a, b) => a.src.localeCompare(b.src));

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(entries, null, 2) + "\n", "utf8");
  console.log(`Wrote ${entries.length} items to ${OUT_FILE}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

