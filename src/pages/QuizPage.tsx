import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUIZ_QUESTIONS } from '../lib/quiz-data'
import { ANSWER_OPTIONS, type AnswerMap, type AnswerValue } from '../types/quiz'
import { ApiError, completeTest, getSession, saveAnswer } from '../lib/api'
import { getStoredSession, type StoredSession } from '../lib/storage'

export default function QuizPage() {
  const navigate = useNavigate()
  const [stored] = useState<StoredSession | null>(() => getStoredSession())
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // 恢复会话与答题进度
  useEffect(() => {
    if (!stored) {
      navigate('/access', { replace: true })
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { session: detail } = await getSession(stored.sessionId, stored.sessionToken)
        if (cancelled) return
        if (detail.status === 'completed') {
          navigate('/result', { replace: true })
          return
        }
        const loaded = (detail.answers ?? {}) as AnswerMap
        setAnswers(loaded)
        const firstUnanswered = QUIZ_QUESTIONS.findIndex((q) => loaded[q.id] === undefined)
        setCurrentIndex(firstUnanswered === -1 ? QUIZ_QUESTIONS.length - 1 : firstUnanswered)
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError && err.code === 'SESSION_NOT_FOUND') {
          navigate('/access', { replace: true })
          return
        }
        setError(err instanceof ApiError ? err.message : '加载失败，请刷新重试')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [stored, navigate])

  const currentQuestion = QUIZ_QUESTIONS[currentIndex]
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers])
  const progress = (answeredCount / QUIZ_QUESTIONS.length) * 100

  function selectAnswer(questionId: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    setError(null)
    // 乐观更新 + 后台保存；导航时会再次确认保存
    if (stored) {
      saveAnswer(stored.sessionId, stored.sessionToken, questionId, value).catch(() => {
        // 忽略，导航/提交时会做最终保存并提示错误
      })
    }
  }

  async function flushCurrent(): Promise<boolean> {
    if (!stored) return false
    const q = QUIZ_QUESTIONS[currentIndex]
    if (!q) return false
    const value = answers[q.id]
    if (value === undefined) return true
    try {
      await saveAnswer(stored.sessionId, stored.sessionToken, q.id, value)
      return true
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '保存失败，请重试')
      return false
    }
  }

  async function handleNext() {
    const q = QUIZ_QUESTIONS[currentIndex]
    if (!q) return
    if (answers[q.id] === undefined) return
    const ok = await flushCurrent()
    if (!ok) return
    if (currentIndex === QUIZ_QUESTIONS.length - 1) {
      await handleComplete()
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  async function handlePrev() {
    if (currentIndex === 0) return
    await flushCurrent()
    setCurrentIndex((i) => Math.max(0, i - 1))
  }

  async function handleComplete() {
    if (!stored) return
    setSubmitting(true)
    setError(null)
    try {
      await completeTest(stored.sessionId, stored.sessionToken)
      navigate('/result', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '生成结果失败，请重试')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-5 pt-24 text-center text-sub">
        <p className="text-sm">正在恢复你的答题进度…</p>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="mx-auto max-w-xl px-5 pt-24 text-center">
        <p className="text-sm text-sub">没有更多题目了。</p>
      </div>
    )
  }

  const isLast = currentIndex === QUIZ_QUESTIONS.length - 1
  const selected = answers[currentQuestion.id]

  return (
    <div className="mx-auto max-w-xl px-5 pt-8 pb-10">
      {/* 进度 */}
      <div className="flex items-center justify-between text-[12px] text-sub tracking-wide mb-3">
        <span>第 {currentIndex + 1} / {QUIZ_QUESTIONS.length} 题</span>
        <span>已答 {answeredCount} 题</span>
      </div>
      <div className="h-1 w-full bg-line rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-ink transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 题目 */}
      <h1 className="font-serif text-xl sm:text-2xl leading-relaxed tracking-wide mb-8">
        {currentQuestion.text}
      </h1>

      {/* 选项 */}
      <div className="space-y-3">
        {ANSWER_OPTIONS.map((opt) => {
          const isSelected = selected === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => selectAnswer(currentQuestion.id, opt.value)}
              className={`w-full text-left px-4 py-3.5 border rounded-sm transition-colors ${
                isSelected
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line bg-white hover:border-ink/40'
              }`}
            >
              <span className="text-[13px] tracking-wider">{opt.label}</span>
            </button>
          )
        })}
      </div>

      {error && (
        <p className="mt-5 text-sm text-[#B23A2E]" role="alert">
          {error}
        </p>
      )}

      {/* 导航 */}
      <div className="mt-9 flex gap-3">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0 || submitting}
          className="flex-1 border hairline py-3 text-[14px] tracking-wider rounded-sm hover:bg-white disabled:opacity-40 transition-colors"
        >
          上一题
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={selected === undefined || submitting}
          className="flex-[1.4] bg-ink text-paper py-3 text-[14px] tracking-wider rounded-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          {submitting ? '正在生成结果…' : isLast ? '查看我的城市' : '下一题'}
        </button>
      </div>
    </div>
  )
}
