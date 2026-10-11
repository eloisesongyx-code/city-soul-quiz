import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, startTest } from '../lib/api'
import { getStoredSession, saveSession } from '../lib/storage'

export default function AccessPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const pendingKeyRef = useRef<string | null>(null)

  useEffect(() => {
    setHasSession(Boolean(getStoredSession()))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = code.trim()
    if (trimmed.length < 4) {
      setError('请输入有效的访问密码')
      return
    }
    setError(null)
    setLoading(true)
    try {
      // 幂等键：同一次“开始”的重试复用，成功后清除
      if (!pendingKeyRef.current) {
        pendingKeyRef.current = crypto.randomUUID()
      }
      const { session } = await startTest(trimmed, pendingKeyRef.current)
      saveSession({ sessionId: session.session_id, sessionToken: session.session_token })
      pendingKeyRef.current = null
      navigate('/quiz')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        // 明确失败：重置幂等键，换密码重试时用新键
        if (
          err.code === 'INVALID_CODE' ||
          err.code === 'QUOTA_EXHAUSTED' ||
          err.code === 'BAD_REQUEST'
        ) {
          pendingKeyRef.current = null
        }
        // NETWORK / SERVER_ERROR：保留幂等键，重试不会重复扣减
      } else {
        setError('发生未知错误，请重试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 pt-14 pb-10">
      <p className="text-[11px] uppercase tracking-wide3 text-sub mb-3">Enter Access Code</p>
      <h1 className="font-serif text-2xl tracking-wide mb-6">输入访问密码</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="请输入测评访问密码"
            className="w-full bg-white border hairline rounded-sm px-4 py-3.5 text-base tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-ink/20"
            aria-label="访问密码"
          />
          {error && (
            <p className="mt-3 text-sm text-[#B23A2E]" role="alert">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-paper py-3.5 text-[15px] tracking-wider rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? '正在验证…' : '开始测评'}
        </button>
      </form>

      {hasSession && (
        <button
          type="button"
          onClick={() => navigate('/quiz')}
          className="mt-4 w-full border hairline py-3 text-[14px] tracking-wider text-ink hover:bg-white transition-colors rounded-sm"
        >
          继续上次未完成的测评
        </button>
      )}

      <p className="mt-8 text-xs leading-6 text-sub">
        提示：成功开始测评后即消耗一次使用次数；若中途退出或未完成，默认仍消耗一次。
        返回上一题、刷新或重新打开同一会话不会重复扣减。
      </p>
    </div>
  )
}
