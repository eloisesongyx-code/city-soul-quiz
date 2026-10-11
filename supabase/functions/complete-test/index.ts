import { error, json, ok, randomToken, serviceClient } from '../_shared/helpers.ts'
import { computeResult, generateReport, isComplete, type AnswerMap } from '../_shared/core.ts'

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

  // 1. 读取会话已保存答案
  const { data: session, error: gerr } = await svc.rpc('get_session', {
    p_session_id: body.sessionId,
    p_session_token: body.sessionToken,
  })
  if (gerr) return error('会话无效或已失效', 404, 'SESSION_NOT_FOUND')

  const status = session?.status
  if (status === 'completed') {
    // 已完成的会话：返回已有结果
    return fetchExisting(svc, body.sessionId, body.sessionToken)
  }

  // 2. 校验 24 道题全部完成且答案合法
  const answers = (session?.answers ?? {}) as AnswerMap
  if (!isComplete(answers)) {
    return error('请完成全部 24 道题后再查看结果', 400, 'INCOMPLETE')
  }

  // 3. 服务端重新计算分数与结果（不信任客户端传入的任何分数/城市）
  const result = computeResult(answers)
  const report = generateReport(result)
  const shareToken = randomToken()

  // 4. 持久化结果并标记会话完成（幂等）
  const { data: saved, error: serr } = await svc.rpc('save_result', {
    p_session_id: body.sessionId,
    p_session_token: body.sessionToken,
    p_primary_city_id: result.primaryCityId,
    p_secondary_city_id: result.secondaryCityId,
    p_dimension_scores_json: result.dimensionScores,
    p_city_scores_json: result.cityMatches,
    p_report_json: report,
    p_share_token: shareToken,
  })

  if (serr) {
    const msg = serr.message ?? ''
    if (msg.includes('SESSION_COMPLETED')) {
      return fetchExisting(svc, body.sessionId, body.sessionToken)
    }
    if (msg.includes('SESSION_NOT_FOUND')) return error('会话无效或已失效', 404, 'SESSION_NOT_FOUND')
    return error('生成结果失败，请重试', 500, 'SERVER_ERROR')
  }

  return json({
    result: {
      resultId: saved.result_id,
      shareToken: saved.share_token,
      primaryCityId: result.primaryCityId,
      secondaryCityId: result.secondaryCityId,
      dimensionScores: result.dimensionScores,
      cityMatches: result.cityMatches,
      report,
    },
  })
})

async function fetchExisting(
  svc: ReturnType<typeof serviceClient>,
  sessionId: string,
  sessionToken: string,
): Promise<Response> {
  const { data, error: err } = await svc.rpc('get_result', {
    p_session_id: sessionId,
    p_session_token: sessionToken,
  })
  if (err) return error('结果不存在', 404, 'RESULT_NOT_FOUND')
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
}
