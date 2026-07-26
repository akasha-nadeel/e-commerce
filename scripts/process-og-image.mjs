import sharp from "sharp";
import { mkdirSync } from "node:fs";

/**
 * Build the site-wide social share card: the gold eagle on the brand black.
 *
 * Output goes to `src/app/opengraph-image.png`, which is a Next.js file
 * convention — a static file there replaces the generated `opengraph-image.tsx`
 * and Next emits `og:image` / `twitter:image` with the right URL and size for
 * free. Static beats generated here: it is deterministic, costs nothing at
 * build time, and lets us control the crop precisely (see below).
 *
 * THE CROP IS THE WHOLE DESIGN PROBLEM.
 * The card is 1200x630 (1.91:1), which is what Facebook, LinkedIn and Twitter
 * want. But WhatsApp — the channel this brand actually gets shared on — renders
 * the inline preview as a near-SQUARE thumbnail, centre-cropped. A logo spanning
 * the full 1200px width therefore loses its wingtips exactly where it matters
 * most. So the eagle is sized to sit inside the central 630x630 "safe square",
 * leaving deliberate black margins either side in the wide crop.
 *
 * Run: node scripts/process-og-image.mjs
 */

// Gold eagle on black, supplied by the client.
const SRC =
  "C:/Users/User/Downloads/ChatGPT Image Jul 26, 2026, 05_20_16 PM.png";

const OUT = "src/app/opengraph-image.png";

// Open Graph canvas. 1200x630 is the ratio every platform crops *from*.
const W = 1200;
const H = 630;

// PURE black, deliberately — not the brand ink #0c0c0d.
//
// The supplied art is gold-on-#000 with no alpha, so its own background is
// baked in. Filling the canvas with #0c0c0d left a visibly darker rectangle
// where the art sat. Matching #000 exactly makes the seam vanish. The 5%
// luminance difference from brand ink is imperceptible on a standalone share
// card, and nobody ever sees the two side by side.
//
// (`public/logo-eagle-gold-v2.png` is the same eagle *with* alpha and would
// composite onto any colour seamlessly — but it is the muted #c79a4b gold,
// where the client picked the brighter tone in this source. Their choice wins.)
const INK = { r: 0, g: 0, b: 0 };

// Brand gold, matching `globals.css` --color-gold.
const GOLD = "#eec449";

// The eagle AND the tagline must both fit the centre square, so the square crop
// never clips either. The eagle is narrowed from 0.78 to 0.68 of the square to
// buy vertical room for the type beneath it.
const SAFE = Math.round(H * 0.68);

// Tagline. Small, uppercase and widely tracked — the brand's label treatment
// (cf. the wide `tracking-[0.18em]` uppercase labels across the site), not its
// tight display treatment. The eagle is the hero here; the type supports it,
// so it must not compete.
const TAGLINE = "OWN THE DAY";
const TAG_SIZE = 34;
const TAG_TRACKING = 11;
// Arial, deliberately. The site leads with SF Pro and falls back to Inter, but
// neither is installed for librsvg to use — asking for "Inter" here silently
// falls back to a default serif-ish face (proven by identical inked-pixel counts
// for Inter and Helvetica). Arial is the nearest neutral grotesque that is
// actually present, and is indistinguishable at this size.
const TAG_FONT = "Arial, 'Segoe UI', sans-serif";
// Space between the eagle's baseline and the cap-height of the type.
const GAP = 46;

mkdirSync("src/app", { recursive: true });

// 1) Lift the eagle off its black background so it can be recomposed.
//    `trim` removes the flat black border; the threshold is generous because
//    the source is a photo-style PNG, not clean line art on transparency.
const trimmed = await sharp(SRC).trim({ threshold: 24 }).toBuffer();
const t = await sharp(trimmed).metadata();
console.log(`Trimmed source: ${t.width}x${t.height} (aspect ${(t.width / t.height).toFixed(3)})`);

// 2) Scale it to the safe square, fitting the longest edge.
const eagle = await sharp(trimmed)
  .resize({
    width: SAFE,
    height: SAFE,
    fit: "inside",
    withoutEnlargement: false,
  })
  .png()
  .toBuffer();
const e = await sharp(eagle).metadata();
console.log(`Eagle placed at: ${e.width}x${e.height}`);

// 3) Render the tagline on its own transparent layer.
const tagH = TAG_SIZE * 1.4;
const tagSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Math.round(tagH)}">
  <text x="50%" y="${Math.round(TAG_SIZE)}" text-anchor="middle"
        font-family="${TAG_FONT}" font-size="${TAG_SIZE}" font-weight="700"
        letter-spacing="${TAG_TRACKING}" fill="${GOLD}"
        >${TAGLINE}</text>
</svg>`;
const tag = await sharp(Buffer.from(tagSvg)).png().toBuffer();

// Guard: if the font ever goes missing the text renders blank, and a silently
// wordless card would ship unnoticed. Fail loudly instead.
const tagPixels = await sharp(tag)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })
  .then(({ data }) => {
    let lit = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 10) lit++;
    return lit;
  });
if (tagPixels < 1500) {
  throw new Error(
    `Tagline rendered blank (${tagPixels} inked pixels) — the font "${TAG_FONT}" is unavailable to librsvg.`,
  );
}
console.log(`Tagline rendered: ${tagPixels} inked pixels`);

// 4) Centre the eagle+type group as one block, so the pair reads as balanced
//    rather than the eagle being centred with type hanging off the bottom.
const groupH = e.height + GAP + Math.round(tagH);
const top = Math.round((H - groupH) / 2);

await sharp({
  create: { width: W, height: H, channels: 3, background: INK },
})
  .composite([
    // The source's own black merges into the background, so the bird reads as
    // floating on the brand field rather than sitting in a box.
    { input: eagle, left: Math.round((W - e.width) / 2), top },
    { input: tag, left: 0, top: top + e.height + GAP },
  ])
  .png({ quality: 100, compressionLevel: 9 })
  .toFile(OUT);

console.log(
  `Group height ${groupH}px, centred at y=${top} — inside the ${H}px safe square.`,
);

const o = await sharp(OUT).metadata();
const { size } = await sharp(OUT).toBuffer({ resolveWithObject: true }).then((r) => r.info);
console.log(`\nWrote ${OUT} — ${o.width}x${o.height}, ${(size / 1024).toFixed(0)} KB`);
console.log(
  `Safe square: eagle occupies ${e.width}px of the ${H}px centre crop ` +
    `(${((e.width / H) * 100).toFixed(0)}%) — survives WhatsApp's square thumbnail.`,
);
