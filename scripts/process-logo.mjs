import sharp from "sharp";
import { mkdirSync } from "node:fs";

// New brand mark — a wide-wingspan flying eagle (black line-art on transparency).
const SRC =
  "C:/Users/User/Downloads/orators' battle (Book Creator Cover (Square)) (10).png";

mkdirSync("public", { recursive: true });

// 1) Trim the transparent canvas padding so the eagle fills its own box.
const trimmed = await sharp(SRC).ensureAlpha().trim({ threshold: 10 }).toBuffer();

// 2) Normalise to a crisp master height. Keep the aspect ratio for the <Logo>.
const sized = await sharp(trimmed)
  .resize({ height: 360, withoutEnlargement: false })
  .png()
  .toBuffer();

const { width: W, height: H } = await sharp(sized).metadata();
console.log("Eagle master:", W, "x", H, "aspect", (W / H).toFixed(4));

// The source is BLACK line-art, so tint() can't lighten it. Instead use the
// alpha channel as a mask and flood it with a solid brand colour — this recolors
// every visible stroke while preserving the antialiased edges.
const alphaRaw = await sharp(sized).ensureAlpha().extractChannel(3).raw().toBuffer();

async function recolor(r, g, b, out) {
  await sharp({
    create: { width: W, height: H, channels: 3, background: { r, g, b } },
  })
    .joinChannel(alphaRaw, { raw: { width: W, height: H, channels: 1 } })
    .png()
    .toFile(out);
}

// Versioned filenames defeat any stale browser / Next image-optimizer cache.
// White master — for dark backgrounds (variant="onDark").
await recolor(255, 255, 255, "public/logo-eagle-light-v2.png");
// Ink master — for light backgrounds (variant="onLight").
await recolor(12, 12, 13, "public/logo-eagle-dark-v2.png");
// Black master — favicon / icon use.
await recolor(0, 0, 0, "public/logo-eagle-black-v2.png");

console.log(
  "Wrote logo-eagle-light-v2.png (white), logo-eagle-dark-v2.png (ink), logo-eagle-black-v2.png (black).",
);
