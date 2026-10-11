import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const FUNCTIONS_BASE = SUPABASE_URL
  ? `${SUPABASE_URL.replace(/\/+$/, '')}/functions/v1`
  : ''

export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

let client: SupabaseClient | null = null

// 仅用于管理员身份认证（登录 / 会话 / 退出）。
// Edge Function 调用走 lib/api.ts 的 fetch，便于精确控制错误处理。
export function getSupabase(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('未配置 Supabase：请设置 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY')
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  }
  return client
}
