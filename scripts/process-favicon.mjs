import sharp from "sharp";
import { writeFileSync } from "node:fs";

// Gold eagle on a solid black square — the brand favicon source.
const SRC = "scripts/favicon-src.png";
const OUT_DIR = "src/app";

// 1) Trim the wide black margins so the eagle actually fills the tiny icon, then
//    re-square it on black (the wingspan is much wider than it is tall). Keeping
//    a little breathing room stops the wingtips kissing the edge.
const trimmed = await sharp(SRC)
  .trim({ background: "#000000", threshold: 15 })
  .toBuffer();

const { width: tw, height: th } = await sharp(trimmed).metadata();
const side = Math.round(Math.max(tw, th) * 1.12); // 6% padding each side
console.log("Trimmed eagle:", tw, "x", th, "→ square", side);

// Master: eagle centred on a black square canvas.
const master = await sharp({
  create: {
    width: side,
    height: side,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 1 },
  },
})
  .composite([{ input: trimmed, gravity: "center" }])
  .png()
  .toBuffer();

const png = (size) =>
  sharp(master).resize(size, size, { fit: "cover" }).png().toBuffer();

// 2) Modern PNG icons (Next emits the <link> tags from these file names).
writeFileSync(`${OUT_DIR}/icon.png`, await png(512));
writeFileSync(`${OUT_DIR}/apple-icon.png`, await png(180));

// 3) favicon.ico — a multi-resolution ICO wrapping PNG frames (16/32/48), which
//    every modern browser and Windows understands. Sharp can't emit .ico, so we
//    assemble the container by hand.
const ICO_SIZES = [16, 32, 48];
const frames = await Promise.all(
  ICO_SIZES.map(async (s) => ({ size: s, data: await png(s) })),
);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: 1 = icon
header.writeUInt16LE(frames.length, 4); // frame count

const entries = [];
let offset = 6 + frames.length * 16; // dir header + one entry per frame
for (const { size, data } of frames) {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width  (0 = 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height (0 = 256)
  entry.writeUInt8(0, 2); // palette colours
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(data.length, 8); // bytes in this frame
  entry.writeUInt32LE(offset, 12); // offset to frame data
  entries.push(entry);
  offset += data.length;
}

writeFileSync(
  `${OUT_DIR}/favicon.ico`,
  Buffer.concat([header, ...entries, ...frames.map((f) => f.data)]),
);

console.log(
  `Wrote ${OUT_DIR}/favicon.ico (${ICO_SIZES.join("/")}), icon.png (512), apple-icon.png (180).`,
);
