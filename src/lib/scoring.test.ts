import { describe, it, expect } from 'vitest'
import { type AnswerMap, type AnswerValue, DIMENSIONS } from '../types/quiz'
import { QUIZ_QUESTIONS } from './quiz-data'
import {
  scoreAnswer,
  computeDimensionScore,
  computeDimensionScores,
  computeResult,
  normalizeTo100,
  isComplete,
} from './scoring'
import { CITY_PROFILES } from './city-profiles'

function answersAll(value: number): AnswerMap {
  const map: AnswerMap = {}
  for (const q of QUIZ_QUESTIONS) {
    map[q.id] = value as AnswerValue
  }
  return map
}

describe('题库结构', () => {
  it('恰好有 24 道题', () => {
    expect(QUIZ_QUESTIONS).toHaveLength(24)
  })

  it('每个维度恰好有 4 道题', () => {
    for (const d of DIMENSIONS) {
      expect(QUIZ_QUESTIONS.filter((q) => q.dimension === d)).toHaveLength(4)
    }
  })

  it('恰好有 8 座城市原型', () => {
    expect(CITY_PROFILES).toHaveLength(8)
  })
})

describe('正反向计分', () => {
  it('正向题答案为 1 时计分为 1', () => {
    expect(scoreAnswer(1, false)).toBe(1)
  })
  it('正向题答案为 5 时计分为 5', () => {
    expect(scoreAnswer(5, false)).toBe(5)
  })
  it('反向题答案为 1 时计分为 5', () => {
    expect(scoreAnswer(1, true)).toBe(5)
  })
  it('反向题答案为 5 时计分为 1', () => {
    expect(scoreAnswer(5, true)).toBe(1)
  })
})

describe('维度分数计算', () => {
  it('均值转换：平均分 4 对应 75 分', () => {
    expect(normalizeTo100(4)).toBe(75)
  })
  it('均值转换：平均分 1 对应 0 分', () => {
    expect(normalizeTo100(1)).toBe(0)
  })
  it('均值转换：平均分 5 对应 100 分', () => {
    expect(normalizeTo100(5)).toBe(100)
  })

  it('自主维度混合答案的平均值正确', () => {
    // A1(正向)=4, A2(正向)=5, A3(正向)=3, A4(反向)=4 -> 4,5,3,2 均值 3.5 -> 62.5
    const answers: AnswerMap = { A1: 4, A2: 5, A3: 3, A4: 4 }
    expect(computeDimensionScore(answers, 'autonomy')).toBe(62.5)
  })

  it('六个维度分数均在 0–100 且无 NaN', () => {
    const scores = computeDimensionScores(answersAll(3))
    for (const d of DIMENSIONS) {
      const v = scores[d]
      expect(Number.isFinite(v)).toBe(true)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(100)
    }
  })

  it('全 3 分答案时六个维度均为 50', () => {
    const scores = computeDimensionScores(answersAll(3))
    for (const d of DIMENSIONS) {
      expect(scores[d]).toBe(50)
    }
  })
})

describe('城市匹配与排序', () => {
  it('返回恰好 8 座城市，按匹配度降序排列', () => {
    const result = computeResult(answersAll(3))
    expect(result.cityMatches).toHaveLength(8)
    for (let i = 1; i < result.cityMatches.length; i++) {
      expect(result.cityMatches[i]!.matchScore).toBeLessThanOrEqual(
        result.cityMatches[i - 1]!.matchScore,
      )
    }
  })

  it('全 3 分答案：第一匹配为南京，第二匹配为成都（并列时按固定顺序稳定排序）', () => {
    const result = computeResult(answersAll(3))
    expect(result.primaryCityId).toBe('nanjing')
    expect(result.secondaryCityId).toBe('chengdu')
  })

  it('相同答案重复计算得到完全一致的结果', () => {
    const a = computeResult(answersAll(3))
    const b = computeResult(answersAll(3))
    expect(a).toEqual(b)
  })

  it('匹配度在 0–100 范围内', () => {
    const result = computeResult(answersAll(3))
    for (const m of result.cityMatches) {
      expect(m.matchScore).toBeGreaterThanOrEqual(0)
      expect(m.matchScore).toBeLessThanOrEqual(100)
    }
  })
})

describe('合法性校验', () => {
  it('缺少题目时拒绝生成正式结果', () => {
    const answers = answersAll(3)
    delete answers.A1
    expect(() => computeResult(answers)).toThrow()
    expect(isComplete(answers)).toBe(false)
  })

  it('非法答案不被接受', () => {
    const answers = answersAll(3)
    answers.A2 = 6 as unknown as AnswerValue
    expect(() => computeResult(answers)).toThrow()
  })

  it('未作答（空答案）拒绝生成结果', () => {
    expect(() => computeResult({})).toThrow()
  })

  it('答案值非整数拒绝生成结果', () => {
    const answers = answersAll(3)
    answers.B1 = 3.5 as unknown as AnswerValue
    expect(() => computeResult(answers)).toThrow()
  })
})
