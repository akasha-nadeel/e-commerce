import sharp from "sharp";

// Studio shot — model seated on a skateboard on the RIGHT, open negative
// space on the LEFT (where the hero copy sits).
const SRC = "C:/Users/User/Downloads/ChatGPT Image Jun 28, 2026, 02_19_00 AM.png";

const meta = await sharp(SRC).metadata();
console.log("Source:", meta.width, "x", meta.height);

// Versioned filename so browsers / the image optimizer don't serve a stale crop.
await sharp(SRC)
  .resize({ width: 2400, withoutEnlargement: true })
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile("public/hero-v4.jpg");

console.log("Wrote public/hero-v4.jpg");
