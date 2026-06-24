/**
 * Cài lại toàn bộ dependency sau khi clone / sau clean:deps.
 * Usage: npm run setup
 */
const { execSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

function run(cmd, label) {
  console.log(`\n[setup] ${label}...`);
  execSync(cmd, { stdio: 'inherit', cwd: root, shell: true });
}

console.log('[setup] Cài đặt lại dependencies cho Cappy Bus\n');

try {
  run('npm install', 'npm install (root + workspaces)');
  run('npm run build -w @bus/shared', 'build @bus/shared (dist)');
  console.log('\n[setup] Hoàn tất! Có thể chạy:');
  console.log('  npm run dev           — Khởi động tất cả (infra + gateway + ai + web)');
  console.log('  npm run docker:up     — Docker full stack');
  console.log('  npm run dev:web       — Chỉ frontend local');
  console.log('  npm run dev:gateway   — Chỉ API Gateway local');
  console.log('  npm run dev:ai        — Chỉ Capy AI local');
} catch (err) {
  console.error('\n[setup] Lỗi khi cài đặt. Kiểm tra Node >= 20 và kết nối mạng.');
  process.exit(1);
}
