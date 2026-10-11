import { describe, it, expect } from 'vitest'
import { type AnswerMap as FeAnswerMap, type AnswerValue } from '../types/quiz'
import { QUIZ_QUESTIONS as FE_QUESTIONS } from './quiz-data'
import { computeResult as feComputeResult, isComplete as feIsComplete } from './scoring'
import { generateReport as feGenerateReport } from './result-report'
import {
  computeResult as svComputeResult,
  generateReport as svGenerateReport,
  type AnswerMap as SvAnswerMap,
} from '../../supabase/functions/_shared/core'

function feAnswers(value: number): FeAnswerMap {
  const map: FeAnswerMap = {}
  for (const q of FE_QUESTIONS) map[q.id] = value as AnswerValue
  return map
}

function svAnswers(value: number): SvAnswerMap {
  const map: SvAnswerMap = {}
  for (const q of FE_QUESTIONS) map[q.id] = value
  return map
}

// 服务端镜像必须与前端共享模块产生完全一致的结果，防止两者漂移
describe('前端/服务端计分镜像一致性（漂移校验）', () => {
  it('全 1 答案结果一致', () => {
    expect(svComputeResult(svAnswers(1))).toEqual(feComputeResult(feAnswers(1)))
  })
  it('全 3 答案结果一致', () => {
    expect(svComputeResult(svAnswers(3))).toEqual(feComputeResult(feAnswers(3)))
  })
  it('全 5 答案结果一致', () => {
    expect(svComputeResult(svAnswers(5))).toEqual(feComputeResult(feAnswers(5)))
  })
  it('混合答案结果一致', () => {
    const fe: FeAnswerMap = { A1: 1, A2: 5, A3: 2, A4: 4, B1: 3, B2: 5, B3: 1, B4: 2, C1: 5, C2: 4, C3: 3, C4: 1, D1: 2, D2: 3, D3: 4, D4: 5, E1: 1, E2: 2, E3: 5, E4: 3, F1: 4, F2: 5, F3: 2, F4: 1 }
    const sv: SvAnswerMap = { ...fe }
    expect(svComputeResult(sv)).toEqual(feComputeResult(fe))
  })
  it('报告生成结果一致', () => {
    const feResult = feComputeResult(feAnswers(3))
    const svResult = svComputeResult(svAnswers(3))
    expect(svGenerateReport(svResult)).toEqual(feGenerateReport(feResult))
  })
  it('服务端 isComplete 与前端一致', () => {
    const sv = svAnswers(3)
    expect(feIsComplete(feAnswers(3))).toBe(true)
    const incomplete = { ...sv }
    delete incomplete.A1
    // 前端 isComplete 需要完整答案
    const feIncomplete = feAnswers(3)
    delete feIncomplete.A1
    expect(feIsComplete(feIncomplete)).toBe(false)
  })
})
