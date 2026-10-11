import { forwardRef } from 'react'
import { getCityProfile } from '../../lib/city-profiles'
import type { ResultReport, CityMatch } from '../../types/result'

const LEVEL_LABELS: Record<string, string> = {
  low: '较低',
  mid: '中等',
  high: '较高',
}

export interface ResultLongImageProps {
  primaryCityId: string
  secondaryCityId: string
  report: ResultReport
  cityMatches: CityMatch[]
}

// 独立长图版式：固定宽度、系统字体、无导航与按钮，适合 PNG 导出。
const ResultLongImage = forwardRef<HTMLDivElement, ResultLongImageProps>(
  function ResultLongImage({ primaryCityId, secondaryCityId, report, cityMatches }, ref) {
    const primary = getCityProfile(primaryCityId)
    const secondary = getCityProfile(secondaryCityId)
    if (!primary || !secondary) return null

    return (
      <div
        ref={ref}
        style={{
          width: 680,
          background: '#F6F3ED',
          color: '#20201E',
          padding: '56px 56px 48px',
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
          boxSizing: 'border-box',
        }}
      >
        {/* 品牌 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 16, letterSpacing: '0.2em', fontWeight: 700 }}>城市灵魂测评</span>
          <span style={{ fontSize: 10, letterSpacing: '0.28em', color: '#77736C', textTransform: 'uppercase' }}>
            City Soul Quiz
          </span>
        </div>

        {/* 封面 */}
        <div style={{ marginTop: 48, borderTop: `3px solid ${primary.accent}`, paddingTop: 40 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.28em', color: '#77736C', textTransform: 'uppercase', margin: 0 }}>
            Your City Archetype
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 }}>
            <div>
              <div style={{ fontSize: 60, lineHeight: 1.05, fontWeight: 700 }}>{primary.nameZh}</div>
              <div style={{ fontSize: 13, letterSpacing: '0.2em', color: '#77736C', textTransform: 'uppercase', marginTop: 6 }}>
                {primary.nameEn}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#77736C' }}>原型匹配度</div>
              <div style={{ fontSize: 34, fontWeight: 700, color: primary.accent, marginTop: 2 }}>
                {Math.round(report.matchScore)}%
              </div>
            </div>
          </div>

          <div style={{ fontSize: 13, letterSpacing: '0.2em', color: primary.accent, marginTop: 28, textTransform: 'uppercase' }}>
            {primary.titleEn}
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{primary.titleZh}</div>
          <div style={{ fontSize: 15, lineHeight: 1.7, color: '#3a3834', marginTop: 14, fontStyle: 'italic' }}>
            {report.headline}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            {primary.keywords.map((k) => (
              <span
                key={k}
                style={{
                  fontSize: 12,
                  padding: '4px 14px',
                  border: '1px solid #DDD7CD',
                  borderRadius: 999,
                  color: '#77736C',
                }}
              >
                {k}
              </span>
            ))}
          </div>
        </div>

        {/* 六维度 */}
        <div style={{ marginTop: 40 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.28em', color: '#77736C', textTransform: 'uppercase', margin: 0 }}>
            Six Dimensions
          </p>
          <div style={{ marginTop: 18 }}>
            {report.dimensions.map((d) => (
              <div key={d.key} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span>{d.label}</span>
                  <span style={{ color: '#77736C' }}>
                    {d.score.toFixed(1)} · {LEVEL_LABELS[d.level]}
                  </span>
                </div>
                <div style={{ height: 8, background: '#DDD7CD', borderRadius: 999, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.max(0, Math.min(100, d.score))}%`,
                      height: '100%',
                      background: primary.accent,
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 简述 */}
        <div style={{ marginTop: 28, borderTop: '1px solid #DDD7CD', paddingTop: 24 }}>
          <p style={{ fontSize: 14, lineHeight: 1.85, color: '#3a3834', margin: 0 }}>{report.matchReason}</p>
        </div>

        {/* 第二城市 */}
        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.28em', color: '#77736C', textTransform: 'uppercase', margin: 0 }}>
            Runner-up
          </p>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 10 }}>
            {secondary.nameZh} · {secondary.titleZh}
          </div>
        </div>

        {/* 八城排行（紧凑） */}
        <div style={{ marginTop: 28, borderTop: '1px solid #DDD7CD', paddingTop: 24 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.28em', color: '#77736C', textTransform: 'uppercase', margin: 0 }}>
            City Ranking
          </p>
          <div style={{ marginTop: 12 }}>
            {cityMatches.map((m, i) => {
              const city = getCityProfile(m.cityId)
              if (!city) return null
              return (
                <div key={m.cityId} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ width: 16, fontSize: 11, color: '#77736C', textAlign: 'right' }}>{i + 1}</span>
                  <span style={{ width: 40, fontSize: 13 }}>{city.nameZh}</span>
                  <div style={{ flex: 1, height: 6, background: '#DDD7CD', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${m.matchScore}%`, height: '100%', background: '#20201E', borderRadius: 999 }} />
                  </div>
                  <span style={{ width: 44, fontSize: 11, color: '#77736C', textAlign: 'right' }}>{m.matchScore.toFixed(1)}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 免责 */}
        <div style={{ marginTop: 32, borderTop: '1px solid #DDD7CD', paddingTop: 20 }}>
          <p style={{ fontSize: 10.5, lineHeight: 1.7, color: '#77736C', margin: 0 }}>
            本测评仅供娱乐与自我探索，不构成专业心理诊断或迁居建议，未经心理测量学实证验证。
            “原型匹配度”为生活方式原型相似度，非科学概率或人格准确率。
          </p>
        </div>
      </div>
    )
  },
)

export default ResultLongImage
