import { promises as fs } from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import sharp from "sharp";

// 🔒 Limit indexing to gallery/pictures only
const IMAGES_DIR = "gallery/pictures";
const OPTIMIZED_DIR = "gallery/pictures_web";
const OUT_DIR = "data";
const OUT_FILE = path.join(OUT_DIR, "images.json");
const ORDER_FILE = "gallery/photo-order.txt"; // Optional: custom ordering

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
  return `/${relPath.replace(/\\/g, "/")}`;
}

/**
 * Convert source path to optimized web path
 */
function toOptimizedSrc(sourceRelPath) {
  const parsed = path.parse(sourceRelPath);
  // Change directory from gallery/pictures to gallery/pictures_web
  const optimizedDir = path.join(OPTIMIZED_DIR, parsed.dir.replace(IMAGES_DIR, ""));
  // Change extension to .jpg (our optimization output format)
  const optimizedName = parsed.name + ".jpg";
  const optimizedPath = path.join(optimizedDir, optimizedName);
  return `/${optimizedPath.replace(/\\/g, "/")}`;
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

/**
 * Load custom photo order from file (optional)
 * Returns a Map of filename -> order index
 */
async function loadCustomOrder() {
  try {
    const content = await fs.readFile(ORDER_FILE, "utf8");
    const lines = content.split("\n")
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#")); // Allow comments
    
    const orderMap = new Map();
    lines.forEach((filename, index) => {
      orderMap.set(filename, index);
    });
    
    console.log(`📋 Loaded custom order for ${orderMap.size} photos from ${ORDER_FILE}`);
    return orderMap;
  } catch (e) {
    // File doesn't exist or can't be read - that's fine
    return null;
  }
}

async function main() {
  // Load custom order if available
  const customOrder = await loadCustomOrder();
  
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
    const optimizedPath = optimizedSrc.slice(1); // Remove leading '/'
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

  // Sort entries based on custom order or fallback to date/filename
  entries.sort((a, b) => {
    if (customOrder) {
      // Extract just the filename for lookup
      const filenameA = path.basename(a.src);
      const filenameB = path.basename(b.src);
      const orderA = customOrder.get(filenameA);
      const orderB = customOrder.get(filenameB);
      
      // If both have custom order, use it
      if (orderA !== undefined && orderB !== undefined) {
        return orderA - orderB;
      }
      // If only A has order, it comes first
      if (orderA !== undefined) return -1;
      // If only B has order, it comes first
      if (orderB !== undefined) return 1;
      // Neither has order, fall through to default sort
    }
    
    // Default: Sort by date (newest first), then by filename
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return a.src.localeCompare(b.src);
  });

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

