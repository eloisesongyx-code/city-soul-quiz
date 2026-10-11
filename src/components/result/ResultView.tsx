import { getCityProfile } from '../../lib/city-profiles'
import type { DimensionScores, CityMatch, ResultReport } from '../../types/result'

const LEVEL_LABELS: Record<string, string> = {
  low: '较低',
  mid: '中等',
  high: '较高',
}

export interface ResultViewProps {
  primaryCityId: string
  secondaryCityId: string
  dimensionScores: DimensionScores
  cityMatches: CityMatch[]
  report: ResultReport
}

export default function ResultView({
  primaryCityId,
  secondaryCityId,
  report,
  cityMatches,
}: ResultViewProps) {
  const primary = getCityProfile(primaryCityId)
  const secondary = getCityProfile(secondaryCityId)
  if (!primary || !secondary) return null

  return (
    <article>
      {/* 封面 */}
      <header className="pt-12 pb-10 border-b hairline">
        <p className="text-[11px] uppercase tracking-wide3 text-sub mb-4">
          Your City Archetype
        </p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl tracking-wide leading-none">
              {primary.nameZh}
            </h1>
            <p className="text-[12px] uppercase tracking-wide2 text-sub mt-2">
              {primary.nameEn}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-sub tracking-wide mb-1">原型匹配度</p>
            <p className="font-serif text-3xl" style={{ color: primary.accent }}>
              {Math.round(report.matchScore)}
              <span className="text-base text-sub">%</span>
            </p>
          </div>
        </div>

        <p className="mt-8 text-[13px] uppercase tracking-wide2" style={{ color: primary.accent }}>
          {primary.titleEn}
        </p>
        <h2 className="font-serif text-2xl tracking-wide mt-1.5">{primary.titleZh}</h2>
        <p className="mt-4 text-[15px] leading-7 text-ink/80 italic font-serif">
          {report.headline}
        </p>
      </header>

      {/* 匹配理由 */}
      <section className="py-9 border-b hairline">
        <h3 className="text-[11px] uppercase tracking-wide3 text-sub mb-4">为什么是这里</h3>
        <p className="text-[15px] leading-8 text-ink/85">{report.matchReason}</p>
      </section>

      {/* 六维度 */}
      <section className="py-9 border-b hairline">
        <h3 className="text-[11px] uppercase tracking-wide3 text-sub mb-6">六个维度</h3>
        <div className="space-y-6">
          {report.dimensions.map((d) => (
            <div key={d.key}>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[14px] tracking-wide">{d.label}</span>
                <span className="text-[12px] text-sub">
                  {d.score.toFixed(1)} · {LEVEL_LABELS[d.level]}
                </span>
              </div>
              <div className="h-2 w-full bg-line rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(0, Math.min(100, d.score))}%`, backgroundColor: primary.accent }}
                />
              </div>
              <p className="mt-2 text-[13px] leading-6 text-ink/70">{d.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 优势 / 盲区 / 建议 */}
      <section className="py-9 border-b hairline space-y-7">
        <div>
          <h3 className="text-[11px] uppercase tracking-wide3 text-sub mb-3">你的优势</h3>
          <p className="text-[15px] leading-8 text-ink/85">{report.strengths}</p>
        </div>
        <div>
          <h3 className="text-[11px] uppercase tracking-wide3 text-sub mb-3">你可能忽略的另一面</h3>
          <p className="text-[15px] leading-8 text-ink/85">{report.blindSpots}</p>
        </div>
        <div>
          <h3 className="text-[11px] uppercase tracking-wide3 text-sub mb-3">给你的生活建议</h3>
          <p className="text-[15px] leading-8 text-ink/85">{report.advice}</p>
        </div>
      </section>

      {/* 第二匹配城市 */}
      <section className="py-9 border-b hairline">
        <h3 className="text-[11px] uppercase tracking-wide3 text-sub mb-4">第二匹配城市</h3>
        <p className="font-serif text-xl tracking-wide mb-3">
          {secondary.nameZh} · {secondary.titleZh}
        </p>
        <p className="text-[14px] leading-7 text-ink/80">{report.secondaryDiff}</p>
      </section>

      {/* 八城排行 */}
      <section className="py-9 border-b hairline">
        <h3 className="text-[11px] uppercase tracking-wide3 text-sub mb-5">八座城市原型匹配度排行</h3>
        <div className="space-y-2.5">
          {cityMatches.map((m, i) => {
            const city = getCityProfile(m.cityId)
            if (!city) return null
            return (
              <div key={m.cityId} className="flex items-center gap-3">
                <span className="w-5 text-[12px] text-sub text-right">{i + 1}</span>
                <span className="w-12 text-[14px] shrink-0">{city.nameZh}</span>
                <div className="flex-1 h-2 bg-line rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-ink/70"
                    style={{ width: `${Math.max(0, Math.min(100, m.matchScore))}%` }}
                  />
                </div>
                <span className="w-12 text-[12px] text-sub text-right">{m.matchScore.toFixed(1)}%</span>
              </div>
            )
          })}
        </div>
        <p className="mt-4 text-[12px] text-sub leading-5">
          “原型匹配度”为生活方式原型相似度，非科学概率或人格准确率。
        </p>
      </section>

      {/* 方法与免责 */}
      <section className="py-9 text-[12px] leading-6 text-sub space-y-3">
        <p>
          测评方法：24 道生活情境题，覆盖六个维度（自主与自由、成长与机会、新鲜与刺激、
          安稳与秩序、关系与归属、自然与松弛）。每道题采用五级量表，反向题反向计分后计算
          各维度 0–100 分数，再与八座城市的原型向量比较欧氏距离得到匹配度。
        </p>
        <p>
          免责声明：本测评仅供娱乐与自我探索，不构成专业心理诊断、命运预测或迁居建议，
          也未经过心理测量学实证验证。城市原型为象征性生活方式形象，不代表任何城市的全体居民。
        </p>
      </section>
    </article>
  )
}
