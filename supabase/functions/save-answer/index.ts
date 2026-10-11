import { error, json, ok, serviceClient } from '../_shared/helpers.ts'
import { QUIZ_QUESTIONS } from '../_shared/core.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return ok()
  if (req.method !== 'POST') return error('方法不允许', 405, 'METHOD_NOT_ALLOWED')

  let body: { sessionId?: string; sessionToken?: string; questionId?: string; answer?: number }
  try {
    body = await req.json()
  } catch {
    return error('请求体无效', 400, 'BAD_REQUEST')
  }

  if (typeof body.sessionId !== 'string' || typeof body.sessionToken !== 'string') {
    return error('缺少会话标识', 400, 'BAD_REQUEST')
  }
  if (typeof body.questionId !== 'string') return error('缺少题目标识', 400, 'BAD_REQUEST')
  if (typeof body.answer !== 'number' || !Number.isInteger(body.answer) || body.answer < 1 || body.answer > 5) {
    return error('答案无效', 400, 'INVALID_ANSWER')
  }

  // 服务端校验：题目 ID 必须存在
  const exists = QUIZ_QUESTIONS.some((q) => q.id === body.questionId)
  if (!exists) return error('题目不存在', 400, 'INVALID_QUESTION')

  const svc = serviceClient()
  const { data, error: err } = await svc.rpc('save_answer', {
    p_session_id: body.sessionId,
    p_session_token: body.sessionToken,
    p_question_id: body.questionId,
    p_answer: body.answer,
  })

  if (err) {
    const msg = err.message ?? ''
    if (msg.includes('SESSION_COMPLETED')) return error('该测评已完成，无法修改答案', 409, 'SESSION_COMPLETED')
    if (msg.includes('SESSION_NOT_FOUND')) return error('会话无效或已失效', 404, 'SESSION_NOT_FOUND')
    return error('保存失败，请重试', 500, 'SERVER_ERROR')
  }

  return json({ saved: data })
})
