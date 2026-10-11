import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, getResult, type ResultView as ResultData } from '../lib/api'
import { getStoredSession, clearStoredSession } from '../lib/storage'
import { buildShareUrl } from '../lib/share'
import { getCityProfile } from '../lib/city-profiles'
import ResultView from '../components/result/ResultView'
import ResultLongImage from '../components/result/ResultLongImage'
import ExportActions from '../components/result/ExportActions'

export default function ResultPage() {
  const navigate = useNavigate()
  const [stored] = useState(() => getStoredSession())
  const [result, setResult] = useState<ResultData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const longImageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!stored) {
      navigate('/access', { replace: true })
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { result } = await getResult(stored.sessionId, stored.sessionToken)
        if (!cancelled) setResult(result)
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError && (err.code === 'SESSION_NOT_FOUND' || err.code === 'NOT_FOUND')) {
          navigate('/access', { replace: true })
          return
        }
        setError(err instanceof ApiError ? err.message : '加载结果失败，请刷新重试')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [stored, navigate])

  function handleRetake() {
    clearStoredSession()
    navigate('/access', { replace: true })
  }

  async function handleCopyShareUrl() {
    if (!result) return
    const url = buildShareUrl(result.shareToken)
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-5 pt-24 text-center text-sub">
        <p className="text-sm">正在生成你的城市档案…</p>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="mx-auto max-w-md px-5 pt-20 text-center">
        <p className="text-[#B23A2E]" role="alert">
          {error ?? '结果不存在'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/access')}
          className="mt-6 bg-ink text-paper px-6 py-3 text-sm tracking-wider rounded-sm hover:opacity-90"
        >
          返回测评
        </button>
      </div>
    )
  }

  const primary = getCityProfile(result.primaryCityId)
  const fileName = primary
    ? `城市灵魂测评_${primary.nameZh}.png`
    : '城市灵魂测评结果.png'

  return (
    <div className="mx-auto max-w-xl px-5 pt-6 pb-14">
      {/* 结果报告 */}
      <ResultView
        primaryCityId={result.primaryCityId}
        secondaryCityId={result.secondaryCityId}
        dimensionScores={result.dimensionScores}
        cityMatches={result.cityMatches}
        report={result.report}
      />

      {/* 操作区 */}
      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={handleCopyShareUrl}
          className="w-full border border-ink py-3.5 text-[15px] tracking-wider rounded-sm hover:bg-ink hover:text-paper transition-colors"
        >
          {copied ? '已复制分享链接' : '复制分享链接'}
        </button>

        <ExportActions nodeRef={longImageRef} fileName={fileName} />

        <button
          type="button"
          onClick={handleRetake}
          className="w-full border hairline py-3 text-[14px] tracking-wider text-sub hover:text-ink hover:bg-white transition-colors rounded-sm"
        >
          再测一次
        </button>
      </div>

      <p className="mt-6 text-xs text-sub leading-5">
        分享链接为公开结果页，不含访问密码、不消耗次数，他人无需登录即可查看。
      </p>

      {/* 离屏长图节点（供 html-to-image 导出） */}
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
