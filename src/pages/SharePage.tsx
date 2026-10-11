import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, getShareResult, type ShareResultView } from '../lib/api'
import { getCityProfile } from '../lib/city-profiles'
import ResultView from '../components/result/ResultView'
import ResultLongImage from '../components/result/ResultLongImage'
import ExportActions from '../components/result/ExportActions'

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const [result, setResult] = useState<ShareResultView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const longImageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) {
      setError('分享链接无效')
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { result } = await getShareResult(token)
        if (!cancelled) setResult(result)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : '加载分享结果失败')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-5 pt-24 text-center text-sub">
        <p className="text-sm">正在加载分享结果…</p>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="mx-auto max-w-md px-5 pt-20 text-center">
        <p className="text-[11px] uppercase tracking-wide3 text-sub mb-4">Shared Result</p>
        <h1 className="font-serif text-2xl tracking-wide mb-4">分享链接无效或已失效</h1>
        <p className="text-sm text-sub leading-6">
          该分享链接可能已被删除、过期，或地址有误。
        </p>
        <Link
          to="/"
          className="mt-8 inline-block bg-ink text-paper px-6 py-3 text-sm tracking-wider rounded-sm hover:opacity-90"
        >
          我也来测一测
        </Link>
      </div>
    )
  }

  const primary = getCityProfile(result.primaryCityId)
  const fileName = primary
    ? `城市灵魂测评_${primary.nameZh}.png`
    : '城市灵魂测评结果.png'

  return (
    <div className="mx-auto max-w-xl px-5 pt-6 pb-14">
      <p className="text-[11px] uppercase tracking-wide3 text-sub mb-6">
        Shared Result · 他人分享的城市档案
      </p>

      <ResultView
        primaryCityId={result.primaryCityId}
        secondaryCityId={result.secondaryCityId}
        dimensionScores={result.dimensionScores}
        cityMatches={result.cityMatches}
        report={result.report}
      />

      <div className="mt-8 space-y-3">
        <ExportActions nodeRef={longImageRef} fileName={fileName} />
        <Link
          to="/"
          className="block w-full text-center bg-ink text-paper py-3.5 text-[15px] tracking-wider rounded-sm hover:opacity-90"
        >
          我也来测一测
        </Link>
      </div>

      {/* 离屏长图节点 */}
      <div style={{ position: 'fixed', left: -9999, top: 0, pointerEvents: 'none' }} aria-hidden="true">
        <ResultLongImage
          ref={longImageRef}
          primaryCityId={result.primaryCityId}
          secondaryCityId={result.secondaryCityId}
          report={result.report}
          cityMatches={result.cityMatches}
        />
      </div>
    </div>
  )
}
