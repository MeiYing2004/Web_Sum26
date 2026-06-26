/**
 * Mở Windows Firewall cho port dev (3000, 4000). Cần quyền Admin để thành công.
 * Usage: node scripts/open-lan-firewall.cjs
 */
const { execSync } = require('child_process');

const isWin = process.platform === 'win32';
const ports = process.argv.slice(2).map(Number).filter((p) => p > 0 && p < 65536);
const targetPorts = ports.length ? ports : [3000, 4000];

if (!isWin) {
  console.log('Script firewall chỉ áp dụng trên Windows.');
  process.exit(0);
}

let anyFailed = false;

for (const port of targetPorts) {
  const ruleName = `Cappy Bus TCP ${port}`;
  try {
    const existing = execSync(`netsh advfirewall firewall show rule name="${ruleName}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    if (existing.toLowerCase().includes(ruleName.toLowerCase())) {
      console.log(`✓ Firewall đã có rule cho port ${port}`);
      continue;
    }
  } catch {
    /* rule chưa tồn tại */
  }

  try {
    execSync(
      `netsh advfirewall firewall add rule name="${ruleName}" dir=in action=allow protocol=TCP localport=${port}`,
      { stdio: 'pipe' }
    );
    console.log(`✓ Đã mở Windows Firewall cho TCP port ${port}`);
  } catch {
    anyFailed = true;
    console.warn(`⚠ Không mở được port ${port} — chạy PowerShell (Admin):`);
    console.warn(
      `  netsh advfirewall firewall add rule name="${ruleName}" dir=in action=allow protocol=TCP localport=${port}`
    );
  }
}

process.exit(anyFailed ? 1 : 0);
