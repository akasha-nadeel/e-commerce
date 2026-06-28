import sharp from "sharp";
import { mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DOWNLOADS = "C:/Users/User/Downloads";
const OUT = "public/products";
mkdirSync(OUT, { recursive: true });

// Second gallery angle (slot index 1) for six clothing products.
// `exact` pins names where a substring would be ambiguous.
const MAP = [
  { slug: "varsity-box-fit-jersey", kw: "zwart" },
  { slug: "essential-oversized-tee", kw: "urban classics" },
  { slug: "heavyweight-crew-tee", kw: "black noise" },
  { slug: "mesh-training-tee", kw: "boxy crew" },
  { slug: "prime-graphic-tee", exact: "download (1).jfif" },
  { slug: "varsity-full-sleeve-jersey", exact: "download.jfif" },
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
  const dest = join(OUT, `${m.slug}-2.jpg`);
  await sharp(join(DOWNLOADS, match))
    .rotate()
    .resize({ width: 1000, height: 1333, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(dest);
  console.log(`✓ ${m.slug}-2.jpg  ←  ${match}`);
}

if (failed) {
  console.error(`\n${failed} unmatched.`);
  process.exit(1);
}
console.log("\nSecond-angle placeholder images imported.");
