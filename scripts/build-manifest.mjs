import { promises as fs } from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import sharp from "sharp";

// 🔒 Limit indexing to photo_gallery only
const IMAGES_DIR = "images/photo_gallery";
const OPTIMIZED_DIR = "images/photo_gallery_web";
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

/**
 * Convert source path to optimized web path
 */
function toOptimizedSrc(sourceRelPath) {
  const parsed = path.parse(sourceRelPath);
  // Change directory from photo_gallery to photo_gallery_web
  const optimizedDir = path.join(OPTIMIZED_DIR, parsed.dir.replace(IMAGES_DIR, ""));
  // Change extension to .jpg (our optimization output format)
  const optimizedName = parsed.name + ".jpg";
  const optimizedPath = path.join(optimizedDir, optimizedName);
  return `./${optimizedPath.replace(/\\/g, "/")}`;
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
  // Only crawl photo_gallery subtree
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
    
    // Check if optimized version exists
    const optimizedSrc = toOptimizedSrc(rel);
    const optimizedPath = optimizedSrc.slice(2); // Remove './'
    let finalSrc = toSrc(rel); // Default to original
    
    try {
      await fs.access(optimizedPath);
      // Optimized version exists, use it
      finalSrc = optimizedSrc;
    } catch (e) {
      // Optimized version doesn't exist, will use original
      console.warn(`⚠️  No optimized version found for ${rel}, using original`);
    }
    
    entries.push({
      src: finalSrc,                   // Use optimized if available, otherwise original
      w: meta.width,
      h: meta.height,
      alt: titleFromFilename(file),
      title: titleFromFilename(file),
      tags: [],
      date: new Date(stat.mtime).toISOString().slice(0, 10),
      format: meta.format
    });
  }

  // Stable sort for deterministic diffs
  entries.sort((a, b) => a.src.localeCompare(b.src));

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(entries, null, 2) + "\n", "utf8");

  console.log(`Scanned files: ${files.length}`);
  console.log(`Indexed images: ${entries.length}`);
  const missing = files.length - entries.length;
  if (missing > 0) {
    console.warn(`Skipped ${missing} file(s) due to unreadable metadata. See logs above for details.`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

