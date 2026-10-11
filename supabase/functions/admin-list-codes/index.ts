import { error, json, ok, requireAdmin, serviceClient } from '../_shared/helpers.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return ok()
  if (req.method !== 'POST') return error('方法不允许', 405, 'METHOD_NOT_ALLOWED')

  const admin = await requireAdmin(req)
  if (!admin.ok) return admin.response

  let body: { status?: string; batchId?: string; search?: string }
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const status = body.status === 'active' || body.status === 'disabled' ? body.status : null
  const batchId = typeof body.batchId === 'string' && body.batchId ? body.batchId : null
  const search = typeof body.search === 'string' ? body.search.slice(0, 100) : null

  const svc = serviceClient()
  const { data, error: err } = await svc.rpc('admin_list_codes', {
    p_status: status,
    p_batch_id: batchId,
    p_search: search,
  })

  if (err) return error('查询失败，请重试', 500, 'SERVER_ERROR')
  return json({ codes: data ?? [] })
})
