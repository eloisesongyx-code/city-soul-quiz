import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSupabase } from '../lib/supabase'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const supabase = getSupabase()
        const { data } = await supabase.auth.getSession()
        if (!cancelled && data.session) {
          navigate('/admin', { replace: true })
        }
      } catch {
        if (!cancelled) setUnavailable(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const supabase = getSupabase()
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) {
        setError(err.message === 'Invalid login credentials' ? '邮箱或密码错误' : err.message)
        return
      }
      navigate('/admin', { replace: true })
    } catch {
      setError('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  if (unavailable) {
    return (
      <div className="mx-auto max-w-md px-5 pt-20 text-center">
        <p className="text-sm text-sub">服务未配置（缺少 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY）。</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm px-5 pt-16 pb-10">
      <p className="text-[11px] uppercase tracking-wide3 text-sub mb-3">Admin</p>
      <h1 className="font-serif text-2xl tracking-wide mb-8">管理员登录</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-[12px] text-sub tracking-wide mb-1.5">
            邮箱
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border hairline rounded-sm px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ink/20"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-[12px] text-sub tracking-wide mb-1.5">
            密码
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border hairline rounded-sm px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ink/20"
          />
        </div>

        {error && (
          <p className="text-sm text-[#B23A2E]" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-paper py-3.5 text-[15px] tracking-wider rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? '正在登录…' : '登录'}
        </button>
      </form>

      <p className="mt-6 text-xs text-sub leading-5">
        登录使用 Supabase Auth 邮箱 + 密码，需先将你的账号加入 admins 表后方可访问后台。
      </p>
    </div>
  )
}
