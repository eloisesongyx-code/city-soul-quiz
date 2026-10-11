import { error, json, ok, serviceClient } from '../_shared/helpers.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return ok()
  if (req.method !== 'POST') return error('方法不允许', 405, 'METHOD_NOT_ALLOWED')

  let body: { sessionId?: string; sessionToken?: string }
  try {
    body = await req.json()
  } catch {
    return error('请求体无效', 400, 'BAD_REQUEST')
  }

  if (typeof body.sessionId !== 'string' || typeof body.sessionToken !== 'string') {
    return error('缺少会话标识', 400, 'BAD_REQUEST')
  }

  const svc = serviceClient()
  const { data, error: err } = await svc.rpc('get_session', {
    p_session_id: body.sessionId,
    p_session_token: body.sessionToken,
  })

  if (err) return error('会话无效或已失效', 404, 'SESSION_NOT_FOUND')
  return json({ session: data })
})
