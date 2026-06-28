import sharp from "sharp";
import { mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DOWNLOADS = "C:/Users/User/Downloads";
const OUT = "public/products";
mkdirSync(OUT, { recursive: true });

// slug -> matcher. Most are unique keyword substrings (case-insensitive);
// `exact` pins a name where a substring would be ambiguous.
const MAP = [
  { slug: "varsity-box-fit-jersey", kw: "oversized premium super heavyweight" },
  { slug: "essential-oversized-tee", kw: "acid wash" },
  { slug: "heavyweight-crew-tee", kw: "nobero" },
  { slug: "mesh-training-tee", kw: "casual elegance" },
  { slug: "prime-graphic-tee", kw: "unisex cotton printed" },
  { slug: "varsity-full-sleeve-jersey", kw: "child of god" },
  { slug: "athlex-cross-back-tank", kw: "pastel tones" },
  { slug: "varsity-air-jersey", kw: "sporty pink" },
  { slug: "logo-cap", kw: "confident style" },
  { slug: "essence-tote-bag", kw: "soft lighting" },
  { slug: "classic-no-show-sock", kw: "navy tee" },
  { slug: "staple-ankle-sock", kw: "paraaaa" },
  { slug: "beanie", exact: "download.jfif" },
];

const files = readdirSync(DOWNLOADS).filter((f) => f.toLowerCase().endsWith(".jfif"));

let failed = 0;
for (const m of MAP) {
  const match = m.exact
    ? files.find((f) => f.toLowerCase() === m.exact.toLowerCase())
    : files.find((f) => f.toLowerCase().includes(m.kw));
  if (!match) {
    console.error(`✗ no file for ${m.slug} (${m.exact ?? m.kw})`);
    failed++;
    continue;
  }
  const dest = join(OUT, `${m.slug}.jpg`);
  await sharp(join(DOWNLOADS, match))
    .rotate() // honor EXIF orientation
    .resize({ width: 1000, height: 1333, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(dest);
  console.log(`✓ ${m.slug}.jpg  ←  ${match}`);
}

if (failed) {
  console.error(`\n${failed} unmatched.`);
  process.exit(1);
}
console.log("\nAll placeholder images imported.");
