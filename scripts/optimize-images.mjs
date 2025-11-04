import { promises as fs } from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import sharp from "sharp";

// Directory configurations
const DIRS_TO_OPTIMIZE = [
  {
    source: "images/photo_gallery",
    output: "images/photo_gallery_web",
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 85,
    preserveFormat: false  // Convert to JPG
  },
  {
    source: "images/tribute_slideshow",
    output: "images/tribute_slideshow_web",
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 85,
    preserveFormat: false  // Convert to JPG
  },
  {
    source: "files/memorial_magazine",
    output: "files/memorial_magazine",  // Optimize in place (thumbnails only)
    maxWidth: 600,  // Thumbnails don't need to be huge
    maxHeight: 800,
    quality: 85,
    preserveFormat: false  // Convert to JPG
  },
  {
    source: "static",
    output: "static",  // Optimize favicons in place
    maxWidth: 512,  // Largest favicon size
    maxHeight: 512,
    quality: 90,  // High quality for crisp icons
    preserveFormat: true  // Keep PNG format for transparency/browser support
  }
];

// Supported input extensions
const exts = [
  "jpg", "jpeg", "png", "webp", "gif", "bmp", "heic", "heif",
  "JPG", "JPEG", "PNG", "WEBP", "GIF", "BMP", "HEIC", "HEIF"
];

/**
 * Check if an optimized version already exists and is newer than the source
 */
async function isOptimized(sourceFile, optimizedFile) {
  try {
    const [sourceStat, optimizedStat] = await Promise.all([
      fs.stat(sourceFile),
      fs.stat(optimizedFile)
    ]);
    // Return true if optimized file is newer than source
    return optimizedStat.mtime >= sourceStat.mtime;
  } catch (e) {
    // If optimized file doesn't exist, it's not optimized
    return false;
  }
}

/**
 * Generate the optimized file path
 */
function getOptimizedPath(sourceFile, sourceDir, outputDir, preserveFormat = false) {
  const rel = path.relative(sourceDir, sourceFile);
  const parsed = path.parse(rel);
  // Preserve format if requested (for favicons/icons), otherwise convert to JPG
  const outputName = preserveFormat ? parsed.base : parsed.name + ".jpg";
  return path.join(outputDir, parsed.dir, outputName);
}

/**
 * Optimize a single image
 */
async function optimizeImage(sourceFile, optimizedFile, maxWidth, maxHeight, quality, preserveFormat = false) {
  try {
    // Ensure output directory exists
    await fs.mkdir(path.dirname(optimizedFile), { recursive: true });

    // Determine output format
    const isPng = preserveFormat && optimizedFile.toLowerCase().endsWith('.png');
    
    // Process the image
    let pipeline = sharp(sourceFile)
      .rotate() // Auto-rotate based on EXIF orientation
      .resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true
      });
    
    // Apply format-specific compression
    if (isPng) {
      pipeline = pipeline.png({
        quality: quality,
        compressionLevel: 9,
        adaptiveFiltering: true
      });
    } else {
      pipeline = pipeline.jpeg({
        quality: quality,
        progressive: true,
        mozjpeg: true
      });
    }
    
    await pipeline.toFile(optimizedFile);

    return true;
  } catch (e) {
    console.error(`Failed to optimize ${sourceFile}:`, e.message);
    return false;
  }
}

/**
 * Clean up orphaned optimized files (originals were deleted)
 */
async function cleanupOrphans(sourceDir, outputDir) {
  // Find all optimized files
  const optimizedPattern = `${outputDir}/**/*.jpg`;
  const optimizedFiles = await fg(optimizedPattern, {
    dot: false,
    onlyFiles: true
  });

  let deleted = 0;
  
  for (const optimizedFile of optimizedFiles) {
    // Reconstruct what the original filename should be
    const rel = path.relative(outputDir, optimizedFile);
    const parsed = path.parse(rel);
    
    // Check if ANY source file with this base name exists (any extension)
    const basePath = path.join(sourceDir, parsed.dir, parsed.name);
    const possibleSources = exts.map(ext => `${basePath}.${ext}`);
    
    let sourceExists = false;
    for (const possibleSource of possibleSources) {
      try {
        await fs.access(possibleSource);
        sourceExists = true;
        break;
      } catch (e) {
        // File doesn't exist, continue checking
      }
    }
    
    // If no source file exists, delete the optimized version
    if (!sourceExists) {
      try {
        await fs.unlink(optimizedFile);
        console.log(`   🗑️  Removed orphan: ${path.relative(".", optimizedFile)}`);
        deleted++;
      } catch (e) {
        console.error(`   ❌ Failed to delete ${optimizedFile}:`, e.message);
      }
    }
  }
  
  return deleted;
}

/**
 * Process a single directory
 */
async function processDirectory(config) {
  const { source, output, maxWidth, maxHeight, quality, preserveFormat = false } = config;
  
  console.log(`\n📁 Processing: ${source}`);
  console.log(`   Output: ${output}`);
  
  // Clean up orphaned files first
  const orphansDeleted = await cleanupOrphans(source, output);
  if (orphansDeleted > 0) {
    console.log(`   🧹 Cleaned up ${orphansDeleted} orphaned file(s)`);
  }
  
  // Find all source images
  const pattern = `${source}/**/*.{${exts.join(",")}}`;
  const sourceFiles = await fg(pattern, {
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

  if (sourceFiles.length === 0) {
    console.log(`   ⚠️  No images found`);
    return { total: 0, optimized: 0, skipped: 0, failed: 0 };
  }

  console.log(`   📷 Found ${sourceFiles.length} images`);
  
  // Check which images need optimization
  const toOptimize = [];
  for (const sourceFile of sourceFiles) {
    const optimizedFile = getOptimizedPath(sourceFile, source, output, preserveFormat);
    const alreadyOptimized = await isOptimized(sourceFile, optimizedFile);
    
    if (!alreadyOptimized) {
      toOptimize.push({ sourceFile, optimizedFile });
    }
  }

  if (toOptimize.length === 0) {
    console.log(`   ✅ All images already optimized!`);
    return { total: sourceFiles.length, optimized: 0, skipped: sourceFiles.length, failed: 0 };
  }

  console.log(`   ⚡ Optimizing ${toOptimize.length} images...`);
  
  let successful = 0;
  let failed = 0;
  let originalSize = 0;
  let optimizedSize = 0;

  // Process images
  for (let i = 0; i < toOptimize.length; i++) {
    const { sourceFile, optimizedFile } = toOptimize[i];
    const relPath = path.relative(".", sourceFile);
    
    process.stdout.write(`     [${i + 1}/${toOptimize.length}] ${relPath}...`);
    
    const success = await optimizeImage(sourceFile, optimizedFile, maxWidth, maxHeight, quality, preserveFormat);
    
    if (success) {
      successful++;
      console.log(" ✓");
      
      // Track size savings
      try {
        const [sourceStat, optimizedStat] = await Promise.all([
          fs.stat(sourceFile),
          fs.stat(optimizedFile)
        ]);
        originalSize += sourceStat.size;
        optimizedSize += optimizedStat.size;
      } catch (e) {
        // Ignore stat errors
      }
    } else {
      failed++;
      console.log(" ✗");
    }
  }

  // Calculate savings
  let savings = null;
  if (successful > 0 && originalSize > 0) {
    const savedBytes = originalSize - optimizedSize;
    const savedMB = (savedBytes / 1024 / 1024).toFixed(2);
    const percentSaved = ((savedBytes / originalSize) * 100).toFixed(1);
    savings = { savedMB, percentSaved };
  }

  return {
    total: sourceFiles.length,
    optimized: successful,
    skipped: sourceFiles.length - toOptimize.length,
    failed,
    savings
  };
}

/**
 * Main optimization function
 */
async function main() {
  console.log("🔍 Image Optimization Tool");
  console.log("==========================");
  
  let totalStats = {
    total: 0,
    optimized: 0,
    skipped: 0,
    failed: 0,
    totalSavedMB: 0
  };

  for (const config of DIRS_TO_OPTIMIZE) {
    const stats = await processDirectory(config);
    totalStats.total += stats.total;
    totalStats.optimized += stats.optimized;
    totalStats.skipped += stats.skipped;
    totalStats.failed += stats.failed;
    
    if (stats.savings) {
      totalStats.totalSavedMB += parseFloat(stats.savings.savedMB);
      console.log(`   💾 Saved: ${stats.savings.savedMB} MB (${stats.savings.percentSaved}%)`);
    }
  }

  console.log("\n📊 Overall Summary:");
  console.log("==================");
  console.log(`   📷 Total images: ${totalStats.total}`);
  console.log(`   ✅ Optimized: ${totalStats.optimized}`);
  console.log(`   ⏭️  Skipped: ${totalStats.skipped}`);
  console.log(`   ❌ Failed: ${totalStats.failed}`);
  
  if (totalStats.totalSavedMB > 0) {
    console.log(`   💾 Total saved: ${totalStats.totalSavedMB.toFixed(2)} MB`);
  }
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
