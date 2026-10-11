import { DIMENSIONS, type AnswerMap, type AnswerValue, type DimensionKey } from '../types/quiz'
import { QUIZ_QUESTIONS } from './quiz-data'
import { CITY_PROFILES, CITY_ORDER } from './city-profiles'
import type { DimensionScores, ScoringResult, CityMatch } from '../types/result'

// 反向计分：1→5, 2→4, 3→3, 4→2, 5→1
export function scoreAnswer(answer: AnswerValue, reverse: boolean): number {
  return reverse ? 6 - answer : answer
}

// 从 1–5 均值转换为 0–100
export function normalizeTo100(mean: number): number {
  return Math.round(((mean - 1) / 4) * 1000) / 10
}

// 从 0–100 分数转换回 1–5（用于城市匹配的距离计算）
export function toCityScale(score: number): number {
  return 1 + score / 25
}

/** 计算单个维度的 0–100 分数。维度四题不全时抛错。 */
export function computeDimensionScore(answers: AnswerMap, dimension: DimensionKey): number {
  const questions = QUIZ_QUESTIONS.filter((q) => q.dimension === dimension)
  const values: number[] = []
  for (const q of questions) {
    const raw = answers[q.id]
    if (raw === undefined) {
      throw new Error(`维度 ${dimension} 缺少题目 ${q.id} 的答案`)
    }
    if (!Number.isInteger(raw) || raw < 1 || raw > 5) {
      throw new Error(`题目 ${q.id} 的答案非法：${raw}`)
    }
    values.push(scoreAnswer(raw as AnswerValue, q.reverseScored))
  }
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  return normalizeTo100(mean)
}

/** 计算六个维度 0–100 分数。答案不完整或非法时抛错。 */
export function computeDimensionScores(answers: AnswerMap): DimensionScores {
  const out = {} as DimensionScores
  for (const d of DIMENSIONS) {
    out[d] = computeDimensionScore(answers, d)
  }
  return out
}

/** 校验：是否所有 24 道题都已作答且答案合法。 */
export function isComplete(answers: AnswerMap): boolean {
  if (Object.keys(answers).length < QUIZ_QUESTIONS.length) return false
  for (const q of QUIZ_QUESTIONS) {
    const v = answers[q.id]
    if (v === undefined || !Number.isInteger(v) || v < 1 || v > 5) return false
  }
  return true
}

const MAX_DISTANCE = Math.sqrt(96) // 六维每维最大差 4 时的最大欧氏距离

/** 计算八座城市的原型匹配度，按匹配度降序、并列时按固定顺序稳定排序。 */
export function computeCityMatches(scores: DimensionScores): CityMatch[] {
  const user: Record<DimensionKey, number> = {
    autonomy: toCityScale(scores.autonomy),
    growth: toCityScale(scores.growth),
    novelty: toCityScale(scores.novelty),
    security: toCityScale(scores.security),
    belonging: toCityScale(scores.belonging),
    nature: toCityScale(scores.nature),
  }

  const matches: CityMatch[] = CITY_PROFILES.map((city) => {
    let sum = 0
    for (const d of DIMENSIONS) {
      const diff = user[d] - city.vector[d]
      sum += diff * diff
    }
    const distance = Math.sqrt(sum)
    const matchScore = Math.round(Math.max(0, 100 * (1 - distance / MAX_DISTANCE)) * 10) / 10
    return { cityId: city.cityId, matchScore, distance }
  })

  // 稳定排序：先按匹配度降序，并列时按城市固定顺序
  matches.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore
    return CITY_ORDER.indexOf(a.cityId) - CITY_ORDER.indexOf(b.cityId)
  })
  return matches
}

/** 完整计算：返回六维分数 + 城市匹配 + 第一/第二匹配城市。 */
export function computeResult(answers: AnswerMap): ScoringResult {
  if (!isComplete(answers)) {
    throw new Error('答案不完整：需完成全部 24 道题')
  }
  const dimensionScores = computeDimensionScores(answers)
  const cityMatches = computeCityMatches(dimensionScores)
  const primaryCityId = cityMatches[0]!.cityId
  const secondaryCityId = cityMatches[1]!.cityId
  return { dimensionScores, cityMatches, primaryCityId, secondaryCityId }
}
