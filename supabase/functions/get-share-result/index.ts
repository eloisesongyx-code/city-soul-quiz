import { error, json, ok, serviceClient } from '../_shared/helpers.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return ok()

  let token = ''
  if (req.method === 'GET') {
    token = new URL(req.url).searchParams.get('token') ?? ''
  } else if (req.method === 'POST') {
    try {
      const body = await req.json()
      token = typeof body.shareToken === 'string' ? body.shareToken : ''
    } catch {
      return error('请求体无效', 400, 'BAD_REQUEST')
    }
  } else {
    return error('方法不允许', 405, 'METHOD_NOT_ALLOWED')
  }

  if (token.length < 16) return error('分享链接无效', 404, 'SHARE_NOT_FOUND')

  const svc = serviceClient()
  const { data, error: err } = await svc.rpc('get_share_result', { p_share_token: token })
  if (err) return error('分享链接无效或已失效', 404, 'SHARE_NOT_FOUND')

  // 只返回允许公开的字段（不含访问密码、答案、内部 ID）
  return json({
    result: {
      primaryCityId: data.primary_city_id,
      secondaryCityId: data.secondary_city_id,
      dimensionScores: data.dimension_scores,
      cityMatches: data.city_scores,
      report: data.report,
      createdAt: data.created_at,
    },
  })
})
