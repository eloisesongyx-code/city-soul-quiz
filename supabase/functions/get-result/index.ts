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
  const { data, error: err } = await svc.rpc('get_result', {
    p_session_id: body.sessionId,
    p_session_token: body.sessionToken,
  })

  if (err) return error('结果不存在或已失效', 404, 'RESULT_NOT_FOUND')

  return json({
    result: {
      resultId: data.result_id,
      shareToken: data.share_token,
      primaryCityId: data.primary_city_id,
      secondaryCityId: data.secondary_city_id,
      dimensionScores: data.dimension_scores,
      cityMatches: data.city_scores,
      report: data.report,
    },
  })
})
