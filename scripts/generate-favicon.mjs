import { promises as fs } from "node:fs";
import sharp from "sharp";

const SOURCE = "images/prayer_card/card_thumb.jpg";
const OUTPUT_DIR = "static";
const FAVICON_ICO = `${OUTPUT_DIR}/favicon.ico`;
const FAVICON_PNG = `${OUTPUT_DIR}/favicon.png`;

async function generateFavicon() {
  try {
    // Create static directory if it doesn't exist
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    console.log("🎨 Generating favicon from prayer card...");

    // Generate 32x32 PNG favicon (browsers prefer PNG over ICO now)
    await sharp(SOURCE)
      .resize(32, 32, {
        fit: "cover",
        position: "center"
      })
      .png()
      .toFile(FAVICON_PNG);

    console.log("✅ Created favicon.png (32x32)");

    // Generate 16x16 ICO for legacy support
    await sharp(SOURCE)
      .resize(16, 16, {
        fit: "cover",
        position: "center"
      })
      .toFormat("png") // ICO format not directly supported, using PNG
      .toFile(FAVICON_ICO);

    console.log("✅ Created favicon.ico (16x16)");

    // Generate additional sizes for modern browsers
    const sizes = [
      { size: 16, name: "favicon-16x16.png" },
      { size: 32, name: "favicon-32x32.png" },
      { size: 180, name: "apple-touch-icon.png" }, // iOS
      { size: 192, name: "android-chrome-192x192.png" }, // Android
      { size: 512, name: "android-chrome-512x512.png" } // Android
    ];

    for (const { size, name } of sizes) {
      await sharp(SOURCE)
        .resize(size, size, {
          fit: "cover",
          position: "center"
        })
        .png()
        .toFile(`${OUTPUT_DIR}/${name}`);
      
      console.log(`✅ Created ${name} (${size}x${size})`);
    }

    console.log("\n🎉 All favicons generated successfully!");
    console.log(`📁 Output directory: ${OUTPUT_DIR}/`);

  } catch (error) {
    console.error("❌ Error generating favicon:", error.message);
    process.exit(1);
  }
}

generateFavicon();
