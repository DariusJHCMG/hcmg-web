const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

fs.mkdirSync(path.join(__dirname, "../public/icons"), { recursive: true });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
  <rect width="1000" height="1000" fill="#142850"/>
  <text x="500" y="580"
    font-family="Arial Black, Arial, sans-serif"
    font-weight="900"
    font-size="320"
    fill="#FFFFFF"
    text-anchor="middle"
    letter-spacing="8">HCMG</text>
  <rect x="790" y="545" width="60" height="60" fill="#F37021"/>
</svg>`;

const svgMaskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
  <rect width="1000" height="1000" fill="#142850"/>
  <text x="500" y="560"
    font-family="Arial Black, Arial, sans-serif"
    font-weight="900"
    font-size="260"
    fill="#FFFFFF"
    text-anchor="middle"
    letter-spacing="8">HCMG</text>
  <rect x="756" y="530" width="50" height="50" fill="#F37021"/>
</svg>`;

const buf = Buffer.from(svg);
const bufMask = Buffer.from(svgMaskable);

Promise.all([
  sharp(buf).resize(192, 192).png().toFile("public/icons/icon-192.png"),
  sharp(buf).resize(512, 512).png().toFile("public/icons/icon-512.png"),
  sharp(bufMask).resize(512, 512).png().toFile("public/icons/icon-maskable-512.png"),
]).then(() => {
  console.log("✓ Icons generated: icon-192.png, icon-512.png, icon-maskable-512.png");
}).catch((err) => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});
