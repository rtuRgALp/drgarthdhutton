import { promises as fs } from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import sharp from "sharp";

const IMAGES_DIR = "images";
const OUT_DIR = "data";
const OUT_FILE = path.join(OUT_DIR, "images.json");

// Include upper and lower case. Add HEIC/HEIF as best-effort.
const exts = [
  "jpg","jpeg","png","webp","gif","bmp","heic","heif",
  "JPG","JPEG","PNG","WEBP","GIF","BMP","HEIC","HEIF"
];

function titleFromFilename(file) {
  const base = path.basename(file, path.extname(file));
  return base.replace(/[-_]+/g, " ").replace(/\s+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
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
  } catch (e) {
    // If this is a Git LFS pointer file, sharp will fail; log a hint.
    try {
      const head = await fs.readFile(file, { encoding: "utf8" });
      if (head.startsWith("version https://git-lfs.github.com/spec")) {
        console.error(`Unreadable image (LFS pointer not fetched): ${file}`);
      } else {
        console.error(`Unreadable image (unsupported/corrupt): ${file}`);
      }
    } catch { /* ignore */ }
    return null;
  }
}

async function main() {
  const pattern = `${IMAGES_DIR}/**/*.{${exts.join(",")}}`;
  const files = await fg(pattern, {
    dot: false,
    onlyFiles: true,
    caseSensitiveMatch: false,
    followSymbolicLinks: false,
    ignore: [
      "**/thumbs/**",
      "**/thumbnails/**",
      "**/.*/**",
      "**/*.DS_Store"
    ]
  });

  if (files.length === 0) {
    console.warn(`No images matched under ${IMAGES_DIR}. Check paths and extensions.`);
  }

  const entries = [];
  for (const file of files) {
    const meta = await getMetadata(file);
    if (!meta) continue;
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

  // Sort for stable diffs
  entries.sort((a, b) => a.src.localeCompare(b.src));

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(entries, null, 2) + "\n", "utf8");

  // Visibility for auditing coverage
  console.log(`Scanned files: ${files.length}`);
  console.log(`Indexed images: ${entries.length}`);
  const missing = files.length - entries.length;
  if (missing > 0) {
    console.warn(`Skipped ${missing} files due to unreadable metadata. See logs above for details.`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

