import type { DimensionKey } from './quiz'

export type DimensionScores = Record<DimensionKey, number>

export interface CityMatch {
  cityId: string
  matchScore: number
  distance: number
}

export interface ScoringResult {
  dimensionScores: DimensionScores
  cityMatches: CityMatch[]
  primaryCityId: string
  secondaryCityId: string
}

export interface DimensionReport {
  key: DimensionKey
  label: string
  score: number
  level: 'low' | 'mid' | 'high'
  text: string
}

export interface ResultReport {
  primaryCityId: string
  secondaryCityId: string
  headline: string
  matchScore: number
  matchReason: string
  strengths: string
  blindSpots: string
  advice: string
  secondaryDiff: string
  dimensions: DimensionReport[]
  cityRanking: CityMatch[]
}
