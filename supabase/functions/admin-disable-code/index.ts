import { error, json, ok, requireAdmin, serviceClient } from '../_shared/helpers.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return ok()
  if (req.method !== 'POST') return error('方法不允许', 405, 'METHOD_NOT_ALLOWED')

  const admin = await requireAdmin(req)
  if (!admin.ok) return admin.response

  let body: { codeId?: string }
  try {
    body = await req.json()
  } catch {
    return error('请求体无效', 400, 'BAD_REQUEST')
  }

  if (typeof body.codeId !== 'string' || body.codeId.length === 0) {
    return error('缺少密码标识', 400, 'BAD_REQUEST')
  }

  const svc = serviceClient()
  const { data, error: err } = await svc.rpc('admin_disable_code', { p_code_id: body.codeId })
  if (err) {
    const msg = err.message ?? ''
    if (msg.includes('CODE_NOT_FOUND')) return error('密码不存在', 404, 'CODE_NOT_FOUND')
    return error('停用失败，请重试', 500, 'SERVER_ERROR')
  }

  return json({ disabled: data })
})
