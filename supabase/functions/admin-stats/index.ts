import { error, json, ok, requireAdmin, serviceClient } from '../_shared/helpers.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return ok()
  if (req.method !== 'POST' && req.method !== 'GET') return error('方法不允许', 405, 'METHOD_NOT_ALLOWED')

  const admin = await requireAdmin(req)
  if (!admin.ok) return admin.response

  const svc = serviceClient()
  const { data, error: err } = await svc.rpc('admin_stats')
  if (err) return error('统计失败，请重试', 500, 'SERVER_ERROR')
  return json({ stats: data })
})
