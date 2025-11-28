/**
 * 格式化 IP 地址
 * - 将 ::1 转换为 127.0.0.1
 * - 将 ::ffff:xxx.xxx.xxx.xxx 格式转换为 xxx.xxx.xxx.xxx
 */
export function formatIpAddress(ip: string | null | undefined): string {
  if (!ip) return 'unknown';
  
  // IPv6 本地回环地址 ::1 转换为 IPv4 127.0.0.1
  if (ip === '::1') {
    return '127.0.0.1';
  }
  
  // IPv4 映射的 IPv6 地址 ::ffff:xxx.xxx.xxx.xxx 转换为 xxx.xxx.xxx.xxx
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  
  return ip;
}
