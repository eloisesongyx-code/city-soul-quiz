export const DIMENSIONS = [
  'autonomy',
  'growth',
  'novelty',
  'security',
  'belonging',
  'nature',
] as const

export type DimensionKey = (typeof DIMENSIONS)[number]

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  autonomy: '自主与自由',
  growth: '成长与机会',
  novelty: '新鲜与刺激',
  security: '安稳与秩序',
  belonging: '关系与归属',
  nature: '自然与松弛',
}

export type AnswerValue = 1 | 2 | 3 | 4 | 5

export interface QuizQuestion {
  id: string
  number: number
  text: string
  dimension: DimensionKey
  reverseScored: boolean
  context?: string
}

export interface AnswerMap {
  [questionId: string]: AnswerValue
}

export const ANSWER_OPTIONS: { value: AnswerValue; label: string }[] = [
  { value: 1, label: '非常不像我' },
  { value: 2, label: '不太像我' },
  { value: 3, label: '视情况而定' },
  { value: 4, label: '比较像我' },
  { value: 5, label: '非常像我' },
]

export const TOTAL_QUESTIONS = 24
