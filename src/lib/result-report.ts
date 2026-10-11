import { DIMENSION_LABELS, type DimensionKey } from '../types/quiz'
import { getCityProfile, type CityProfile } from './city-profiles'
import type { DimensionReport, ResultReport, ScoringResult } from '../types/result'

const DIMENSIONS_ORDER: DimensionKey[] = [
  'autonomy',
  'growth',
  'novelty',
  'security',
  'belonging',
  'nature',
]

function levelOf(score: number): 'low' | 'mid' | 'high' {
  if (score <= 33.3) return 'low'
  if (score <= 66.7) return 'mid'
  return 'high'
}

const DIMENSION_TEXTS: Record<DimensionKey, Record<'low' | 'mid' | 'high', string>> = {
  autonomy: {
    low: '你并不执着于事事自己做主，反而更愿意在有规则、有人安排的环境里获得确定感。对你来说，清晰的方向往往比广阔的选择空间更让人安心。',
    mid: '你在自主与依赖之间保持灵活：既愿意自己做决定，也能接受在需要时有人搭把手。你不抗拒规则，但也希望能保留一部分属于自己的选择。',
    high: '自主是你很在意的底色。你希望由自己来决定每一天怎么过，而不是被外界的节奏或期待推着走。能掌控自己的方向，对你来说是生活里很重要的一部分。',
  },
  growth: {
    low: '相比不断向上，你更看重眼前的安稳与舒适。只要生活过得去，你不太会被「必须成长」的压力推着走。',
    mid: '你会在成长与安稳之间权衡：有合适的机会你愿意抓住，但不会为了成长牺牲一切。你更倾向于一种「有条件地前进」。',
    high: '成长对你来说不只是加分项，而是选择一座城市、一段生活的重要理由。你需要看到未来几年还有向上的空间，否则很容易感到原地踏步。',
  },
  novelty: {
    low: '新鲜感对你而言并非必需品。熟悉的环境、固定的日常反而能让你放松，重复并不会让你感到无聊。',
    mid: '你享受适度的新鲜感，但也需要熟悉的事物作为锚点。偶尔的探索会让你开心，但你不希望生活一直处在变化中。',
    high: '你对新鲜与变化有很强的需求。重复的日常容易让你觉得乏味，你需要不断有新的地方、新的活动，才能保持对生活的兴趣。',
  },
  security: {
    low: '稳定和可预测并不是你优先考虑的东西。为了更丰富、更有变化的体验，你愿意接受一定程度的不确定和不安稳。',
    mid: '你希望生活有一定可预测性，但也不是非要事事确定。你会在「稳」和「变化」之间，找一个自己能接受的平衡点。',
    high: '安稳与秩序对你很重要。可预测的成本、通勤和节奏会让你更有安全感，你不太愿意长期生活在捉摸不定里。',
  },
  belonging: {
    low: '你并不依赖与周围人建立紧密联系来获得满足。只要个人生活便利，独处或相对疏离的状态也能让你长期适应。',
    mid: '你重视关系，但不会强求。遇到投缘的人你会珍惜，没有时也能自处，归属感对你来说是锦上添花。',
    high: '归属感对你意义重大。你希望能在一个地方找到同类、建立起熟悉而稳定的人际网络，真正感觉自己属于这里，而不只是路过。',
  },
  nature: {
    low: '你愿意为机会和资源牺牲一些休息与自然空间。忙碌本身不会让你太难受，你更在意的是效率和收获。',
    mid: '你需要在忙碌与松弛之间找到平衡。自然和休息能让你恢复，但你也愿意在需要时，投入更多时间精力去争取想要的东西。',
    high: '自然与松弛是你生活里不可或缺的调节。你需要留白、需要能接触到自然、需要不赶时间的从容，否则很容易感到被透支。',
  },
}

function buildDimensions(scores: ScoringResult['dimensionScores']): DimensionReport[] {
  return DIMENSIONS_ORDER.map((key) => {
    const score = scores[key]
    const level = levelOf(score)
    return {
      key,
      label: DIMENSION_LABELS[key],
      score,
      level,
      text: DIMENSION_TEXTS[key][level],
    }
  })
}

/** 找出主/次两座城市原型差距最大的维度，用于生成第二城市差异说明。 */
function biggestDiffDimension(primary: CityProfile, secondary: CityProfile): {
  dim: DimensionKey
  label: string
  primaryScore: number
  secondaryScore: number
} {
  let dim: DimensionKey = 'autonomy'
  let maxDiff = -1
  for (const d of DIMENSIONS_ORDER) {
    const diff = Math.abs(primary.vector[d] - secondary.vector[d])
    if (diff > maxDiff) {
      maxDiff = diff
      dim = d
    }
  }
  return {
    dim,
    label: DIMENSION_LABELS[dim],
    primaryScore: primary.vector[dim],
    secondaryScore: secondary.vector[dim],
  }
}

function buildSecondaryDiff(primary: CityProfile, secondary: CityProfile): string {
  const diff = biggestDiffDimension(primary, secondary)
  const higherCity = diff.primaryScore >= diff.secondaryScore ? primary : secondary
  const lowerCity = diff.primaryScore >= diff.secondaryScore ? secondary : primary
  return `你的第二匹配城市是「${secondary.nameZh}」——${secondary.oneLiner}两座城市最大的差异体现在「${diff.label}」维度上：「${higherCity.nameZh}」的原型更偏重这一面，而「${lowerCity.nameZh}」则相对更轻。它们代表了你性格里可以相互补充的两个侧面，你在不同的人生阶段，可能都会对它们产生共鸣。`
}

/** 生成完整结果报告。输入必须是已完成计分的结果。 */
export function generateReport(result: ScoringResult): ResultReport {
  const primary = getCityProfile(result.primaryCityId)
  const secondary = getCityProfile(result.secondaryCityId)
  if (!primary || !secondary) {
    throw new Error('城市原型缺失，无法生成报告')
  }

  const primaryMatch = result.cityMatches.find((m) => m.cityId === primary.cityId)
  const matchScore = primaryMatch?.matchScore ?? 0

  return {
    primaryCityId: primary.cityId,
    secondaryCityId: secondary.cityId,
    headline: primary.oneLiner,
    matchScore,
    matchReason: primary.matchReason,
    strengths: primary.strengths,
    blindSpots: primary.blindSpots,
    advice: primary.advice,
    secondaryDiff: buildSecondaryDiff(primary, secondary),
    dimensions: buildDimensions(result.dimensionScores),
    cityRanking: result.cityMatches,
  }
}
