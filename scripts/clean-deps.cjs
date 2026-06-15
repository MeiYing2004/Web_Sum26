/**
 * Xóa node_modules, dist, .next, ... trước khi đóng gói / đẩy git / giảm dung lượng.
 * Usage: npm run clean:deps
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const DIR_NAMES = new Set([
  'node_modules',
  'dist',
  '.next',
  'coverage',
  '.turbo',
  '.cache',
]);

const FILE_NAMES = new Set(['*.tsbuildinfo']);

function shouldRemoveDir(name) {
  return DIR_NAMES.has(name);
}

function removeRecursive(target) {
  if (!fs.existsSync(target)) return false;
  fs.rmSync(target, { recursive: true, force: true });
  return true;
}

function walkAndClean(dir, removed) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (shouldRemoveDir(entry.name)) {
        if (removeRecursive(full)) {
          removed.push(path.relative(root, full));
        }
        continue;
      }
      walkAndClean(full, removed);
    } else if (entry.isFile() && entry.name.endsWith('.tsbuildinfo')) {
      if (removeRecursive(full)) {
        removed.push(path.relative(root, full));
      }
    }
  }
}

console.log('[clean:deps] Đang xóa node_modules, dist, .next, ...\n');

const removed = [];
walkAndClean(root, removed);

if (removed.length === 0) {
  console.log('Không có thư mục nào cần xóa (đã sạch).');
} else {
  for (const rel of removed.sort()) {
    console.log(`  ✓ ${rel}`);
  }
  console.log(`\n[clean:deps] Đã xóa ${removed.length} mục.`);
}

console.log('\nGợi ý: git không track node_modules (.gitignore). Chạy `npm run setup` để cài lại.');
