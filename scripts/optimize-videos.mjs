import { promises as fs } from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import fg from "fast-glob";

const execAsync = promisify(exec);

// Directory configurations
const DIRS_TO_OPTIMIZE = [
  {
    source: "gallery/videos",
    output: "gallery/videos_web",
    // Video optimization settings
    codec: "libx264",           // H.264 codec for broad compatibility
    preset: "medium",           // Encoding speed (ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow)
    crf: 23,                    // Quality (0-51, lower is better quality, 23 is default, 18-28 is good range)
    maxWidth: 1920,             // Max width (1080p)
    audioCodec: "aac",          // Audio codec
    audioBitrate: "128k"        // Audio bitrate
  }
];

// Supported video extensions
const videoExts = [
  "mov", "mp4", "avi", "mkv", "webm", "flv", "wmv", "m4v",
  "MOV", "MP4", "AVI", "MKV", "WEBM", "FLV", "WMV", "M4V"
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
    
    // If optimized file is newer than source, skip
    return optimizedStat.mtime > sourceStat.mtime;
  } catch {
    return false; // If optimized file doesn't exist or error, needs optimization
  }
}

/**
 * Get video duration and dimensions
 */
async function getVideoInfo(videoFile) {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration -of csv=p=0 "${videoFile}"`
    );
    const [width, height, duration] = stdout.trim().split(',').map(v => parseFloat(v));
    return { width, height, duration };
  } catch (e) {
    console.error(`Failed to get info for ${videoFile}:`, e.message);
    return null;
  }
}

/**
 * Optimize a video file using ffmpeg
 */
async function optimizeVideo(sourceFile, optimizedFile, config) {
  try {
    // Ensure output directory exists
    await fs.mkdir(path.dirname(optimizedFile), { recursive: true });

    const info = await getVideoInfo(sourceFile);
    if (!info) return false;

    // Calculate scale filter if needed
    let scaleFilter = '';
    if (info.width > config.maxWidth) {
      scaleFilter = `-vf "scale=${config.maxWidth}:-2"`;
    }

    // Build ffmpeg command
    const command = [
      'ffmpeg',
      '-i', `"${sourceFile}"`,
      '-c:v', config.codec,
      '-preset', config.preset,
      '-crf', config.crf,
      scaleFilter,
      '-c:a', config.audioCodec,
      '-b:a', config.audioBitrate,
      '-movflags', '+faststart',  // Enable streaming
      '-y',  // Overwrite output file if exists
      `"${optimizedFile}"`
    ].filter(Boolean).join(' ');

    console.log(`   Optimizing: ${path.basename(sourceFile)}...`);
    await execAsync(command);

    // Get file sizes for comparison
    const [sourceStat, optimizedStat] = await Promise.all([
      fs.stat(sourceFile),
      fs.stat(optimizedFile)
    ]);

    const reduction = ((1 - optimizedStat.size / sourceStat.size) * 100).toFixed(1);
    console.log(`   ✓ Saved ${reduction}% (${formatBytes(sourceStat.size)} → ${formatBytes(optimizedStat.size)})`);

    return true;
  } catch (e) {
    console.error(`   ✗ Failed to optimize ${sourceFile}:`, e.message);
    return false;
  }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

/**
 * Get optimized file path
 */
function getOptimizedPath(sourceRelPath, sourceDir, outputDir) {
  const parsed = path.parse(sourceRelPath);
  const optimizedDir = path.join(outputDir, parsed.dir.replace(sourceDir, ""));
  // Convert to .mp4 for web compatibility
  const optimizedName = parsed.name + ".mp4";
  return path.join(optimizedDir, optimizedName);
}

/**
 * Process a directory of videos
 */
async function processDirectory(config) {
  console.log(`\n📁 Processing: ${config.source}`);
  console.log(`   Output: ${config.output}`);

  // Build glob pattern
  const patterns = videoExts.map(ext => `${config.source}/**/*.${ext}`);
  const files = await fg(patterns, { onlyFiles: true });

  if (files.length === 0) {
    console.log(`   ⚠️  No videos found`);
    return { processed: 0, skipped: 0, failed: 0 };
  }

  console.log(`   🎬 Found ${files.length} videos`);

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const optimizedFile = getOptimizedPath(file, config.source, config.output);

    // Check if already optimized
    if (await isOptimized(file, optimizedFile)) {
      skipped++;
      continue;
    }

    // Optimize the video
    const success = await optimizeVideo(file, optimizedFile, config);
    if (success) {
      processed++;
    } else {
      failed++;
    }
  }

  console.log(`\n   Summary: ${processed} optimized, ${skipped} skipped, ${failed} failed`);
  return { processed, skipped, failed };
}

/**
 * Main execution
 */
async function main() {
  console.log('🎬 Video Optimization Tool');
  console.log('==========================\n');

  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const config of DIRS_TO_OPTIMIZE) {
    const stats = await processDirectory(config);
    totalProcessed += stats.processed;
    totalSkipped += stats.skipped;
    totalFailed += stats.failed;
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Total: ${totalProcessed} optimized, ${totalSkipped} skipped, ${totalFailed} failed`);
}

main().catch(console.error);
