/**
 * 从 MDX 内容中提取所有 R2 keys
 * 匹配 <R2Image r2Key="xxx" /> 和 <Download r2Key="xxx" />
 */
export function extractR2KeysFromMDX(content: string): string[] {
  const r2Keys: string[] = [];
  
  // 匹配 r2Key="xxx" 或 r2Key='xxx'
  const regex = /r2Key=["']([^"']+)["']/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    r2Keys.push(match[1]);
  }
  
  // 去重
  return Array.from(new Set(r2Keys));
}
