import type { DimensionScores, CityMatch, ResultReport } from '../types/result'
import { FUNCTIONS_BASE, isConfigured } from './supabase'

export class ApiError extends Error {
  code: string
  status: number
  constructor(code: string, message: string, status: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

async function callFn<T>(name: string, body: unknown, token?: string): Promise<T> {
  if (!isConfigured) {
    throw new ApiError('NOT_CONFIGURED', '服务未配置，请联系管理员', 500)
  }
  let res: Response
  try {
    res = await fetch(`${FUNCTIONS_BASE}/${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError('NETWORK', '网络连接失败，请检查网络后重试', 0)
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const message = data?.error?.message ?? '请求失败，请稍后再试'
    const code = data?.error?.code ?? 'ERROR'
    throw new ApiError(code, message, res.status)
  }
  return data as T
}

export interface SessionInfo {
  session_id: string
  session_token: string
  status: 'in_progress' | 'completed'
  reused?: boolean
}

export interface StartTestResult {
  session: SessionInfo
}

export function startTest(code: string, idempotencyKey: string): Promise<StartTestResult> {
  return callFn<StartTestResult>('start-test', { code, idempotencyKey })
}

export interface SessionDetail {
  id: string
  status: string
  answers: Record<string, number>
  result_id: string | null
  started_at: string
}

export interface GetSessionResult {
  session: SessionDetail
}

export function getSession(sessionId: string, sessionToken: string): Promise<GetSessionResult> {
  return callFn<GetSessionResult>('get-session', { sessionId, sessionToken })
}

export function saveAnswer(
  sessionId: string,
  sessionToken: string,
  questionId: string,
  answer: number,
): Promise<{ saved: { saved: boolean; question_id: string } }> {
  return callFn('save-answer', { sessionId, sessionToken, questionId, answer })
}

export interface ResultView {
  resultId: string
  shareToken: string
  primaryCityId: string
  secondaryCityId: string
  dimensionScores: DimensionScores
  cityMatches: CityMatch[]
  report: ResultReport
}

export function completeTest(sessionId: string, sessionToken: string): Promise<{ result: ResultView }> {
  return callFn('complete-test', { sessionId, sessionToken })
}

export function getResult(sessionId: string, sessionToken: string): Promise<{ result: ResultView }> {
  return callFn('get-result', { sessionId, sessionToken })
}

export interface ShareResultView {
  primaryCityId: string
  secondaryCityId: string
  dimensionScores: DimensionScores
  cityMatches: CityMatch[]
  report: ResultReport
  createdAt: string
}

export function getShareResult(shareToken: string): Promise<{ result: ShareResultView }> {
  return callFn('get-share-result', { shareToken })
}

// ---------------------------------------------------------------
// 管理员接口（需传登录用户的 access token）
// ---------------------------------------------------------------

export interface CodeRow {
  id: string
  code_prefix: string
  total_uses: number
  used_count: number
  remaining_uses: number
  is_active: boolean
  note: string | null
  batch_id: string | null
  created_at: string
}

export function adminGenerateCodes(
  token: string,
  count: number,
  totalUses: number,
  note: string,
): Promise<{ codes: string[]; batchId: string; totalUses: number; created: number; rows: unknown[] }> {
  return callFn('admin-generate-codes', { count, totalUses, note }, token)
}

export function adminListCodes(
  token: string,
  filters: { status?: string; batchId?: string; search?: string },
): Promise<{ codes: CodeRow[] }> {
  return callFn('admin-list-codes', filters, token)
}

export function adminDisableCode(token: string, codeId: string): Promise<{ disabled: unknown }> {
  return callFn('admin-disable-code', { codeId }, token)
}

export interface AdminStats {
  total_codes: number
  total_used: number
  total_remaining: number
  disabled_codes: number
  completed_tests: number
}

export function adminStats(token: string): Promise<{ stats: AdminStats }> {
  return callFn('admin-stats', {}, token)
}
