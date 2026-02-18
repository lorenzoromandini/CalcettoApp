/* eslint-disable @typescript-eslint/no-require-imports */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ICONS_DIR = path.join(__dirname, "..", "public", "icons");

// Ensure icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Colors
const BG_COLOR = "#22c55e"; // Green for football field
const TEXT_COLOR = "#ffffff"; // White text

async function createIcon(size, filename, padding = 0) {
  const canvasSize = size;
  const contentSize = size - padding * 2;
  
  // Create SVG with "CM" text centered
  const svg = `
    <svg width="${canvasSize}" height="${canvasSize}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${canvasSize}" height="${canvasSize}" fill="${BG_COLOR}" rx="${size * 0.15}" ry="${size * 0.15}"/>
      <text 
        x="50%" 
        y="50%" 
        dominant-baseline="middle" 
        text-anchor="middle" 
        fill="${TEXT_COLOR}" 
        font-family="Arial, sans-serif" 
        font-weight="bold" 
        font-size="${contentSize * 0.5}"
      >CM</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(ICONS_DIR, filename));

  console.log(`Created: ${filename} (${size}x${size})`);
}

async function createFavicon() {
  // Create 32x32 favicon
  const size = 32;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${BG_COLOR}" rx="4" ry="4"/>
      <text 
        x="50%" 
        y="50%" 
        dominant-baseline="middle" 
        text-anchor="middle" 
        fill="${TEXT_COLOR}" 
        font-family="Arial, sans-serif" 
        font-weight="bold" 
        font-size="16"
      >CM</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(ICONS_DIR, "favicon.ico"));

  console.log(`Created: favicon.ico (32x32)`);
}

async function main() {
  try {
    // Create 192x192 icon
    await createIcon(192, "icon-192x192.png");

    // Create 512x512 icon
    await createIcon(512, "icon-512x512.png");

    // Create 180x180 Apple touch icon with padding
    await createIcon(180, "apple-touch-icon.png", 10);

    // Create favicon
    await createFavicon();

    console.log("\nAll icons created successfully!");
  } catch (error) {
    console.error("Error creating icons:", error);
    process.exit(1);
  }
}

main();
