import sharp from "sharp";

// The eagle master is a white silhouette on transparency. `tint()` preserves
// luminance, so it can't darken a white shape — invert the RGB instead (white
// -> black) while leaving the alpha mask untouched.
//
// Written to versioned filenames so browsers/CDN/Next image-optimizer caches
// don't keep serving a previously-cached version at the same URL.

// White master (unchanged source) -> light variant for dark backgrounds.
await sharp("public/logo-eagle.png").png().toFile("public/logo-eagle-light.png");

// True black variant for white/light backgrounds.
await sharp("public/logo-eagle.png")
  .negate({ alpha: false })
  .png()
  .toFile("public/logo-eagle-dark.png");

// Keep the black master fresh for the favicon too.
await sharp("public/logo-eagle.png")
  .negate({ alpha: false })
  .png()
  .toFile("public/logo-eagle-black.png");

console.log("Wrote logo-eagle-light.png (white) and logo-eagle-dark.png (black).");
