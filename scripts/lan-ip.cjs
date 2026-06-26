/**
 * Chọn IP LAN thực (WiFi/Ethernet), bỏ qua VirtualBox, VMware, Hyper-V, WSL...
 */
const os = require('os');

const VIRTUAL_IFACE_HINTS = [
  'virtualbox',
  'vmware',
  'hyper-v',
  'vethernet',
  'wsl',
  'loopback',
  'tap-',
  'npcap',
  'bluetooth',
  'docker',
  'vbox',
  'host-only',
  'pseudo',
];

function isVirtualInterface(name) {
  const n = String(name).toLowerCase();
  return VIRTUAL_IFACE_HINTS.some((hint) => n.includes(hint));
}

function isPrivateLanIpv4(ip) {
  if (!ip || ip.startsWith('127.')) return false;
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('10.')) return true;
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return false;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  return false;
}

function ifacePriority(name) {
  const n = String(name).toLowerCase();
  if (/wi-?fi|wlan|wireless/.test(n)) return 0;
  if (/ethernet|eth[^e]|lan/.test(n)) return 1;
  return 2;
}

/** @returns {{ address: string, name: string }[]} */
function getLanCandidates() {
  const nets = os.networkInterfaces();
  const candidates = [];

  for (const [name, ifaces] of Object.entries(nets)) {
    if (isVirtualInterface(name)) continue;
    for (const net of ifaces || []) {
      const family = net.family;
      const isV4 = family === 'IPv4' || family === 4;
      if (!isV4 || net.internal) continue;
      if (!isPrivateLanIpv4(net.address)) continue;
      candidates.push({ address: net.address, name });
    }
  }

  return candidates.sort((a, b) => ifacePriority(a.name) - ifacePriority(b.name));
}

/** IP LAN ưu tiên WiFi — dùng cho hướng dẫn truy cập từ điện thoại */
function getLanIp() {
  return getLanCandidates()[0]?.address || null;
}

module.exports = { getLanIp, getLanCandidates, isPrivateLanIpv4 };
