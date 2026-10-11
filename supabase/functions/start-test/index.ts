import { corsHeaders, error, json, ok, rateLimit, randomToken, serviceClient } from '../_shared/helpers.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return ok()
  if (req.method !== 'POST') return error('方法不允许', 405, 'METHOD_NOT_ALLOWED')

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(`start:${ip}`, 20, 60_000)) {
    return error('请求过于频繁，请稍后再试', 429, 'RATE_LIMITED')
  }

  let body: { code?: string; idempotencyKey?: string }
  try {
    body = await req.json()
  } catch {
    return error('请求体无效', 400, 'BAD_REQUEST')
  }

  const code = typeof body.code === 'string' ? body.code.trim() : ''
  const idempotencyKey = typeof body.idempotencyKey === 'string' ? body.idempotencyKey.trim() : ''

  if (code.length < 4 || code.length > 64) return error('请输入有效的访问密码', 400, 'INVALID_CODE')
  if (idempotencyKey.length < 8 || idempotencyKey.length > 128) {
    return error('缺少幂等标识', 400, 'BAD_REQUEST')
  }

  const sessionToken = randomToken()
  const svc = serviceClient()
  const { data, error: err } = await svc.rpc('claim_access_code', {
    p_code: code,
    p_idempotency_key: idempotencyKey,
    p_session_token: sessionToken,
  })

  if (err) {
    const msg = err.message ?? ''
    if (msg.includes('QUOTA_EXHAUSTED')) return error('该密码的可用次数已用完', 403, 'QUOTA_EXHAUSTED')
    if (msg.includes('INVALID_CODE')) return error('密码无效或已停用', 401, 'INVALID_CODE')
    return error('无法开始测评，请稍后再试', 500, 'SERVER_ERROR')
  }

  return json({ session: data })
})
