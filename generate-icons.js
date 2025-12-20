const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');

// Tạo thư mục assets nếu chưa có
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// SVG cho icon (chữ Tướng)
const createIconSVG = (size) => Buffer.from(`
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B4513;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFD700;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad1)" rx="${size * 0.15}"/>
  <text x="50%" y="57%" font-size="${Math.floor(size * 0.55)}" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle" font-family="serif" font-weight="bold" stroke="#8B4513" stroke-width="${size * 0.01}">將</text>
</svg>
`);

// SVG cho splash screen
const createSplashSVG = () => Buffer.from(`
<svg width="1284" height="2778" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#8B4513;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFD700;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1284" height="2778" fill="url(#grad2)"/>
  <text x="50%" y="40%" font-size="200" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle" font-family="serif" font-weight="bold" stroke="#8B4513" stroke-width="3">將</text>
  <text x="50%" y="52%" font-size="90" fill="#FFFFFF" text-anchor="middle" font-family="sans-serif" font-weight="bold">Cờ Tướng</text>
  <text x="50%" y="58%" font-size="60" fill="#FFF8DC" text-anchor="middle" font-family="sans-serif">ToolChess</text>
</svg>
`);

async function generateIcons() {
  try {
    console.log('🎨 Đang tạo icons...\n');

    // Icon (1024x1024)
    await sharp(createIconSVG(1024))
      .png()
      .toFile(path.join(assetsDir, 'icon.png'));
    console.log('✅ Đã tạo icon.png (1024x1024)');

    // Adaptive icon (1024x1024)
    await sharp(createIconSVG(1024))
      .png()
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));
    console.log('✅ Đã tạo adaptive-icon.png (1024x1024)');

    // Splash screen
    await sharp(createSplashSVG())
      .png()
      .toFile(path.join(assetsDir, 'splash.png'));
    console.log('✅ Đã tạo splash.png');

    // Favicon (48x48)
    await sharp(createIconSVG(48))
      .png()
      .toFile(path.join(assetsDir, 'favicon.png'));
    console.log('✅ Đã tạo favicon.png (48x48)');

    console.log('\n🎉 Hoàn thành! Tất cả icons đã được tạo trong thư mục assets/');
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

generateIcons();

