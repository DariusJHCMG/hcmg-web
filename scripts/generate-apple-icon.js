const sharp = require("sharp");

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

sharp(Buffer.from(svg))
  .resize(180, 180)
  .png()
  .toFile("public/icons/apple-touch-icon.png")
  .then(() => console.log("✓ apple-touch-icon.png generated"))
  .catch((e) => { console.error(e); process.exit(1); });
