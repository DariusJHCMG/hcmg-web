import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";

const svg = readFileSync("public/hcmg-social.png"); // currently SVG content
const png = await sharp(svg, { density: 144 })
  .resize(1200, 630, { fit: "contain", background: { r: 26, g: 43, b: 66, alpha: 1 } })
  .png({ compressionLevel: 9 })
  .toBuffer();

writeFileSync("public/hcmg-social.png", png);
console.log("Written public/hcmg-social.png —", png.length, "bytes");
