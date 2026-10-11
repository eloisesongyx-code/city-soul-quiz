// 生成公开分享 URL。GitHub Pages 使用 hash routing，token 位于 hash 内。
export function buildShareUrl(token: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
  return `${origin}${base}#/share/${token}`
}
