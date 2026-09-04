const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputImagePath = 'C:/Users/moham/.gemini/antigravity/brain/6e5daaf0-dbc4-4156-915e-eca8d8b36162/.user_uploaded/media_1788507223593.png';
const publicBrandDir = path.join(__dirname, '../public/brand');
const appDir = path.join(__dirname, '../app');

if (!fs.existsSync(publicBrandDir)) {
  fs.mkdirSync(publicBrandDir, { recursive: true });
}

async function run() {
  console.log('Generating production-ready MADAR branding assets...');
  const bgR = 7, bgG = 24, bgB = 48;

  // 1. ISOLATED M SYMBOL (TRANSPARENT & CLEAN)
  const symbolCrop = { left: 350, top: 80, width: 325, height: 255 };
  const croppedSymbol = await sharp(inputImagePath)
    .extract(symbolCrop)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const mData = Buffer.from(croppedSymbol.data);
  for (let i = 0; i < mData.length; i += 4) {
    const r = mData[i];
    const g = mData[i + 1];
    const b = mData[i + 2];

    let alpha = 0;
    if (b <= 105 && g <= 50) {
      alpha = 0;
    } else if (b < 185) {
      const t = Math.max((b - 105) / 80, (g - 50) / 70);
      alpha = Math.min(1, Math.max(0, t));
    } else {
      alpha = 1;
    }

    if (alpha <= 0) {
      mData[i] = 0;
      mData[i + 1] = 0;
      mData[i + 2] = 0;
      mData[i + 3] = 0;
    } else {
      const a = Math.max(0.08, alpha);
      mData[i] = Math.min(255, Math.max(0, Math.round((r - (1 - a) * bgR) / a)));
      mData[i + 1] = Math.min(255, Math.max(0, Math.round((g - (1 - a) * bgG) / a)));
      mData[i + 2] = Math.min(255, Math.max(0, Math.round((b - (1 - a) * bgB) / a)));
      mData[i + 3] = Math.round(alpha * 255);
    }
  }

  const symbolPngPath = path.join(publicBrandDir, 'madar-symbol.png');
  await sharp(mData, {
    raw: { width: croppedSymbol.info.width, height: croppedSymbol.info.height, channels: 4 }
  })
    .trim()
    .png({ quality: 100 })
    .toFile(symbolPngPath);
  console.log('Saved isolated M symbol:', symbolPngPath);

  // 2. CLEAN CIRCULAR FAVICON / APP ICON
  const circleSize = 512;
  const symbolBuffer = await sharp(symbolPngPath)
    .resize(320, 320, { fit: 'inside' })
    .toBuffer();

  const circleSvg = Buffer.from(`
    <svg width="${circleSize}" height="${circleSize}" viewBox="0 0 ${circleSize} ${circleSize}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stop-color="#0d254c"/>
          <stop offset="65%" stop-color="#071830"/>
          <stop offset="100%" stop-color="#030c18"/>
        </radialGradient>
        <radialGradient id="glowInner" cx="50%" cy="50%" r="50%">
          <stop offset="80%" stop-color="#00D2FF" stop-opacity="0"/>
          <stop offset="98%" stop-color="#00D2FF" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#00D2FF" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="50%" stop-color="#0284c7"/>
          <stop offset="100%" stop-color="#00D2FF"/>
        </linearGradient>
      </defs>
      <circle cx="${circleSize/2}" cy="${circleSize/2}" r="${circleSize/2 - 4}" fill="url(#bgGrad)"/>
      <circle cx="${circleSize/2}" cy="${circleSize/2}" r="${circleSize/2 - 4}" fill="url(#glowInner)"/>
      <circle cx="${circleSize/2}" cy="${circleSize/2}" r="${circleSize/2 - 6}" fill="none" stroke="url(#ringGrad)" stroke-width="5" stroke-opacity="0.75"/>
    </svg>
  `);

  const circularFaviconPath = path.join(publicBrandDir, 'madar-circular-icon.png');
  await sharp(circleSvg)
    .composite([{ input: symbolBuffer, gravity: 'center' }])
    .png({ quality: 100 })
    .toFile(circularFaviconPath);
  console.log('Saved circular favicon:', circularFaviconPath);

  // App icons
  const appIconPath = path.join(appDir, 'icon.png');
  await sharp(circularFaviconPath).resize(192, 192).png().toFile(appIconPath);
  console.log('Saved app icon:', appIconPath);

  const appFaviconPath = path.join(appDir, 'favicon.ico');
  await sharp(circularFaviconPath).resize(64, 64).toFile(appFaviconPath);
  console.log('Saved app favicon:', appFaviconPath);

  // 3. FULL VERSION (Symbol + "MADAR" + "AI CONTENT PLANNING") - DARK BACKGROUND
  const fullCrop = { left: 280, top: 60, width: 464, height: 430 };
  const fullLogoPath = path.join(publicBrandDir, 'madar-logo-full.png');
  await sharp(inputImagePath)
    .extract(fullCrop)
    .png({ quality: 100 })
    .toFile(fullLogoPath);
  console.log('Saved full logo (dark background):', fullLogoPath);

  // 4. FULL VERSION (TRANSPARENT BACKGROUND)
  const croppedFull = await sharp(inputImagePath)
    .extract(fullCrop)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const fData = Buffer.from(croppedFull.data);
  for (let i = 0; i < fData.length; i += 4) {
    const r = fData[i];
    const g = fData[i + 1];
    const b = fData[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const maxVal = Math.max(r, g, b);

    let alpha = 0;
    if (b <= 100 && g <= 50 && r <= 35) {
      alpha = 0;
    } else if (b < 180 && maxVal < 180 && lum < 80) {
      const t = Math.max((b - 100) / 80, (g - 50) / 70, (lum - 35) / 50);
      alpha = Math.min(1, Math.max(0, t));
    } else {
      alpha = 1;
    }

    if (alpha <= 0) {
      fData[i] = 0; fData[i+1] = 0; fData[i+2] = 0; fData[i+3] = 0;
    } else {
      const a = Math.max(0.1, alpha);
      fData[i] = Math.min(255, Math.max(0, Math.round((r - (1 - a) * bgR) / a)));
      fData[i+1] = Math.min(255, Math.max(0, Math.round((g - (1 - a) * bgG) / a)));
      fData[i+2] = Math.min(255, Math.max(0, Math.round((b - (1 - a) * bgB) / a)));
      fData[i+3] = Math.round(alpha * 255);
    }
  }

  const fullLogoTransPath = path.join(publicBrandDir, 'madar-logo-full-clean.png');
  await sharp(fData, {
    raw: { width: croppedFull.info.width, height: croppedFull.info.height, channels: 4 }
  })
    .trim()
    .png({ quality: 100 })
    .toFile(fullLogoTransPath);
  console.log('Saved full logo (transparent):', fullLogoTransPath);

  console.log('Generation completed!');
}

run().catch(console.error);
