import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
  })
}

export function ok(): Response {
  return new Response('ok', { headers: corsHeaders })
}

export function error(message: string, status = 400, code = 'ERROR'): Response {
  return json({ error: { code, message } }, status)
}

function env(name: string): string {
  const v = Deno.env.get(name)
  if (!v) throw new Error(`缺少环境变量 ${name}`)
  return v
}

export function serviceClient(): SupabaseClient {
  return createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function userClient(req: Request): SupabaseClient {
  const authHeader = req.headers.get('Authorization') ?? ''
  return createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: { headers: { Authorization: authHeader } },
  })
}

export type AdminResult =
  | { ok: true; userId: string }
  | { ok: false; response: Response }

// 验证调用方是已登录的 Supabase 用户且被列入 admins 表。
export async function requireAdmin(req: Request): Promise<AdminResult> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false, response: error('未登录', 401, 'UNAUTHORIZED') }
  }
  const client = userClient(req)
  const { data, error: err } = await client.auth.getUser()
  if (err || !data.user) {
    return { ok: false, response: error('登录已失效', 401, 'UNAUTHORIZED') }
  }
  const svc = serviceClient()
  const { data: admins, error: aerr } = await svc
    .from('admins')
    .select('user_id')
    .eq('user_id', data.user.id)
    .limit(1)
  if (aerr || !admins || admins.length === 0) {
    return { ok: false, response: error('无管理员权限', 403, 'FORBIDDEN') }
  }
  return { ok: true, userId: data.user.id }
}

// 基础内存速率限制（每实例，尽力而为；生产可替换为网关级限流）
const buckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const b = buckets.get(key)
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (b.count >= limit) return false
  b.count++
  return true
}

// 定期清理，避免内存无界增长
setInterval(() => {
  const now = Date.now()
  for (const [k, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(k)
  }
}, 60_000)

const SAFE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // 去除易混淆字符 O/0 I/1 L

export function generateAccessCode(length = 8): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < length; i++) {
    out += SAFE_ALPHABET[bytes[i]! % SAFE_ALPHABET.length]
  }
  return out
}

export function randomToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function randomBatchId(): string {
  return `B${Date.now().toString(36).toUpperCase()}${randomToken().slice(0, 6)}`
}
