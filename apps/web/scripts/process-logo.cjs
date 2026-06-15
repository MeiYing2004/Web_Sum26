const sharp = require('sharp');
const path = require('path');

const root = path.join(__dirname, '..');
const input = path.join(root, 'public/images/cappy-bus-logo-src.png');
const output = path.join(root, 'public/images/cappy-bus-logo.png');

function luminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function saturation(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function idx(w, x, y) {
  return (y * w + x) * 4;
}

function isNearTransparent(pixels, w, h, x, y) {
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ]) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= w || ny >= h) return true;
    if (pixels[idx(w, nx, ny) + 3] === 0) return true;
  }
  return false;
}

async function removeBlackBackground() {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  const w = info.width;
  const h = info.height;

  // Pass 1: flood-fill pure black / near-black background from image edges
  const visited = new Uint8Array(w * h);
  const queue = [];

  for (let x = 0; x < w; x++) {
    queue.push([x, 0], [x, h - 1]);
  }
  for (let y = 0; y < h; y++) {
    queue.push([0, y], [w - 1, y]);
  }

  while (queue.length) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const pi = y * w + x;
    if (visited[pi]) continue;
    visited[pi] = 1;

    const i = idx(w, x, y);
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    if (a === 0) continue;
    if (r > 58 || g > 58 || b > 58) continue;

    pixels[i + 3] = 0;
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  // Pass 2: peel dark low-saturation halo / black border ring adjacent to transparency
  for (let pass = 0; pass < 6; pass++) {
    const snapshot = Buffer.from(pixels);
    let changed = false;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = idx(w, x, y);
        if (snapshot[i + 3] === 0) continue;

        const r = snapshot[i];
        const g = snapshot[i + 1];
        const b = snapshot[i + 2];
        const lum = luminance(r, g, b);
        const sat = saturation(r, g, b);

        if (!isNearTransparent(snapshot, w, h, x, y)) continue;

        const isDarkHalo = lum < 92 && sat < 0.22;
        const isNearBlack = r < 72 && g < 72 && b < 72;

        if (isDarkHalo && isNearBlack) {
          pixels[i + 3] = 0;
          changed = true;
        }
      }
    }

    if (!changed) break;
  }

  // Pass 3: soften leftover 1px black fringe without harming colored artwork
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = idx(w, x, y);
      if (pixels[i + 3] === 0) continue;

      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      if (isNearTransparent(pixels, w, h, x, y) && r < 40 && g < 40 && b < 40) {
        pixels[i + 3] = 0;
      }
    }
  }

  const trimmed = await sharp(pixels, { raw: { width: w, height: h, channels: 4 } })
    .trim({ threshold: 0 })
    .png()
    .toBuffer();

  const trimmedMeta = await sharp(trimmed).metadata();
  console.log('Trimmed:', trimmedMeta.width, 'x', trimmedMeta.height);

  await sharp(trimmed)
    .resize(1024, 1024, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 6, adaptiveFiltering: true })
    .toFile(output);

  const meta = await sharp(output).metadata();
  const stats = await sharp(output).stats();
  const hasAlpha = stats.isOpaque === false;
  console.log('Wrote', output);
  console.log('Size:', meta.width, 'x', meta.height, '| transparent:', hasAlpha);
}

removeBlackBackground().catch((err) => {
  console.error(err);
  process.exit(1);
});
