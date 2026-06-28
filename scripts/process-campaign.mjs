import sharp from "sharp";

// Studio campaign shot — model seated on a white plinth on the RIGHT, wearing the
// graphic tee, with open white negative space on the LEFT for the banner copy.
const SRC = "C:/Users/User/Downloads/ChatGPT Image Jun 28, 2026, 12_13_23 PM.png";

const meta = await sharp(SRC).metadata();
console.log("Source:", meta.width, "x", meta.height);

// Versioned filename so the image optimizer / browsers don't serve a stale crop.
await sharp(SRC)
  .resize({ width: 2400, withoutEnlargement: true })
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile("public/campaign-v2.jpg");

console.log("Wrote public/campaign-v2.jpg");
