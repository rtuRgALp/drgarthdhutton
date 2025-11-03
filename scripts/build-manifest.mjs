import { promises as fs } from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import imageSize from "image-size";

const IMAGES_DIR = "images";
const OUT_DIR = "data";
const OUT_FILE = path.join(OUT_DIR, "images.json");

// Allowed extensions
const exts = ["jpg", "jpeg", "png", "webp", "gif", "bmp"];

// Build a human title from filename
function titleFromFilename(file) {
  const base = path.basename(file, path.extname(file));
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Relative URL helper that works on GitHub Pages project sites
function toSrc(relPath) {
  // Use "./images/..." so it works under subpaths
  return `./${relPath.replace(/\\/g, "/")}`;
}

async function main() {
  // Find image files, ignore thumbnails if any, and hidden files
  const patterns = exts.map(e => `${IMAGES_DIR}/**/*.${e}`);
  const files = await fg(patterns, {
    dot: false,
    onlyFiles: true,
    ignore: [
      "**/thumbs/**",
      "**/thumbnails/**",
      "**/.*/**",
      "**/*.DS_Store"
    ],
    followSymbolicLinks: false
  });

  const entries = [];
  for (const file of files) {
    const buf = await fs.readFile(file);
    const { width, height, type } = imageSize(buf);
    if (!width || !height) continue;

    const stat = await fs.stat(file);
    const rel = path.relative(".", file);
    entries.push({
      src: toSrc(rel),          // e.g. "./images/album/photo.jpg"
      w: width,
      h: height,
      alt: titleFromFilename(file),
      title: titleFromFilename(file),
      tags: [],                 // optional, edit later if needed
      date: new Date(stat.mtime).toISOString().slice(0, 10),
      format: type
    });
  }

  // Stable sort by path to keep diffs small
  entries.sort((a, b) => a.src.localeCompare(b.src));

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(entries, null, 2) + "\n", "utf8");

  console.log(`Wrote ${entries.length} items to ${OUT_FILE}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

