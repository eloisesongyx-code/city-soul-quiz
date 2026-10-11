import { error, generateAccessCode, json, ok, randomBatchId, requireAdmin, serviceClient } from '../_shared/helpers.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return ok()
  if (req.method !== 'POST') return error('方法不允许', 405, 'METHOD_NOT_ALLOWED')

  const admin = await requireAdmin(req)
  if (!admin.ok) return admin.response

  let body: { count?: number; totalUses?: number; note?: string }
  try {
    body = await req.json()
  } catch {
    return error('请求体无效', 400, 'BAD_REQUEST')
  }

  const count = typeof body.count === 'number' && Number.isInteger(body.count) ? body.count : 0
  const totalUses = typeof body.totalUses === 'number' && Number.isInteger(body.totalUses) ? body.totalUses : 3
  const note = typeof body.note === 'string' ? body.note.slice(0, 200) : null

  if (count < 1 || count > 500) return error('生成数量需在 1–500 之间', 400, 'INVALID_COUNT')
  if (totalUses < 1 || totalUses > 1000) return error('每个密码的使用次数需在 1–1000 之间', 400, 'INVALID_TOTAL_USES')

  const codes: string[] = []
  for (let i = 0; i < count; i++) codes.push(generateAccessCode())

  const batchId = randomBatchId()
  const svc = serviceClient()
  const { data, error: err } = await svc.rpc('admin_create_codes', {
    p_codes: codes,
    p_total_uses: totalUses,
    p_note: note,
    p_batch_id: batchId,
  })

  if (err) return error('生成失败，请重试', 500, 'SERVER_ERROR')

  // 明文密码仅在此响应中返回一次
  return json({
    codes,
    batchId,
    totalUses,
    created: data.created,
    rows: data.rows,
  })
})
