import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSupabase } from '../lib/supabase'
import {
  ApiError,
  adminDisableCode,
  adminGenerateCodes,
  adminListCodes,
  adminStats,
  type AdminStats,
  type CodeRow,
} from '../lib/api'

type StatusFilter = '' | 'active' | 'disabled'

export default function AdminPage() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [unavailable, setUnavailable] = useState(false)
  const [checking, setChecking] = useState(true)

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [codes, setCodes] = useState<CodeRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [listLoading, setListLoading] = useState(false)

  // 生成表单
  const [count, setCount] = useState('10')
  const [totalUses, setTotalUses] = useState('3')
  const [note, setNote] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<{ codes: string[]; batchId: string } | null>(null)

  // 筛选
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')
  const [search, setSearch] = useState('')

  // 登录校验
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const supabase = getSupabase()
        const { data } = await supabase.auth.getSession()
        if (!cancelled) {
          if (!data.session) {
            navigate('/admin/login', { replace: true })
          } else {
            setToken(data.session.access_token)
          }
        }
      } catch {
        if (!cancelled) setUnavailable(true)
      } finally {
        if (!cancelled) setChecking(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [navigate])

  const loadStats = useCallback(async (t: string) => {
    try {
      const { stats } = await adminStats(t)
      setStats(stats)
    } catch (err) {
      if (err instanceof ApiError && err.code === 'UNAUTHORIZED') {
        navigate('/admin/login', { replace: true })
      }
    }
  }, [navigate])

  const loadCodes = useCallback(
    async (t: string, s: StatusFilter, q: string) => {
      setListLoading(true)
      try {
        const { codes } = await adminListCodes(t, {
          ...(s ? { status: s } : {}),
          ...(q ? { search: q } : {}),
        })
        setCodes(codes)
      } catch (err) {
        if (err instanceof ApiError && err.code === 'UNAUTHORIZED') {
          navigate('/admin/login', { replace: true })
        } else {
          setError(err instanceof ApiError ? err.message : '加载失败')
        }
      } finally {
        setListLoading(false)
      }
    },
    [navigate],
  )

  useEffect(() => {
    if (token) {
      void loadStats(token)
      void loadCodes(token, statusFilter, search)
    }
  }, [token, statusFilter, search, loadStats, loadCodes])

  async function handleGenerate(e: FormEvent) {
    e.preventDefault()
    if (!token) return
    const n = parseInt(count, 10)
    const uses = parseInt(totalUses, 10)
    if (!Number.isFinite(n) || n < 1 || n > 200) {
      setError('数量需为 1–200 的整数')
      return
    }
    if (!Number.isFinite(uses) || uses < 1 || uses > 1000) {
      setError('使用次数需为 1–1000 的整数')
      return
    }
    setError(null)
    setGenerating(true)
    try {
      const res = await adminGenerateCodes(token, n, uses, note)
      setGenerated({ codes: res.codes, batchId: res.batchId })
      setNote('')
      void loadStats(token)
      void loadCodes(token, statusFilter, search)
    } catch (err) {
      if (err instanceof ApiError && err.code === 'UNAUTHORIZED') {
        navigate('/admin/login', { replace: true })
      } else {
        setError(err instanceof ApiError ? err.message : '生成失败')
      }
    } finally {
      setGenerating(false)
    }
  }

  async function handleDisable(codeId: string) {
    if (!token) return
    try {
      await adminDisableCode(token, codeId)
      void loadStats(token)
      void loadCodes(token, statusFilter, search)
    } catch (err) {
      if (err instanceof ApiError && err.code === 'UNAUTHORIZED') {
        navigate('/admin/login', { replace: true })
      } else {
        setError(err instanceof ApiError ? err.message : '操作失败')
      }
    }
  }

  async function handleSignOut() {
    try {
      await getSupabase().auth.signOut()
    } catch {
      // ignore
    }
    navigate('/admin/login', { replace: true })
  }

  async function copyCodes() {
    if (!generated) return
    const text = generated.codes.join('\n')
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
  }

  if (unavailable) {
    return (
      <div className="mx-auto max-w-md px-5 pt-20 text-center">
        <p className="text-sm text-sub">服务未配置（缺少 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY）。</p>
      </div>
    )
  }

  if (checking) {
    return (
      <div className="mx-auto max-w-xl px-5 pt-24 text-center text-sub">
        <p className="text-sm">正在验证登录状态…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pt-10 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-wide3 text-sub mb-1">Admin Console</p>
          <h1 className="font-serif text-2xl tracking-wide">管理后台</h1>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-sm text-sub hover:text-ink border hairline px-4 py-2 rounded-sm transition-colors"
        >
          退出登录
        </button>
      </div>

      {/* 统计 */}
      <section className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
        {[
          { label: '密码总数', value: stats?.total_codes },
          { label: '已使用', value: stats?.total_used },
          { label: '剩余', value: stats?.total_remaining },
          { label: '已停用', value: stats?.disabled_codes },
          { label: '已完成测评', value: stats?.completed_tests },
        ].map((s) => (
          <div key={s.label} className="border hairline rounded-sm bg-white px-4 py-4">
            <div className="font-serif text-2xl">{s.value ?? '–'}</div>
            <div className="text-[11px] text-sub tracking-wide mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      {/* 生成密码 */}
      <section className="border hairline rounded-sm bg-white p-5 mb-8">
        <h2 className="text-[11px] uppercase tracking-wide3 text-sub mb-4">批量生成访问密码</h2>
        <form onSubmit={handleGenerate} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[12px] text-sub mb-1">数量</label>
            <input
              type="number"
              min={1}
              max={200}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="w-full border hairline rounded-sm px-3 py-2.5"
            />
          </div>
          <div>
            <label className="block text-[12px] text-sub mb-1">每码可用次数</label>
            <input
              type="number"
              min={1}
              max={1000}
              value={totalUses}
              onChange={(e) => setTotalUses(e.target.value)}
              className="w-full border hairline rounded-sm px-3 py-2.5"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[12px] text-sub mb-1">备注（可选）</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="如：10 月内测批次"
              className="w-full border hairline rounded-sm px-3 py-2.5"
            />
          </div>
          <div className="col-span-2 sm:col-span-4">
            <button
              type="submit"
              disabled={generating}
              className="bg-ink text-paper px-5 py-2.5 text-sm tracking-wider rounded-sm hover:opacity-90 disabled:opacity-50"
            >
              {generating ? '正在生成…' : '生成'}
            </button>
          </div>
        </form>

        {generated && (
          <div className="mt-5 border-t hairline pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm">
                已生成 {generated.codes.length} 个密码（批次 {generated.batchId}）
              </p>
              <button type="button" onClick={copyCodes} className="text-sm text-sub hover:text-ink">
                复制全部
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {generated.codes.map((c) => (
                <code key={c} className="bg-paper border hairline rounded-sm px-3 py-1.5 text-sm tracking-[0.15em]">
                  {c}
                </code>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 密码列表 */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-[11px] uppercase tracking-wide3 text-sub">密码列表</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="text-sm border hairline rounded-sm px-2 py-1.5 bg-white"
          >
            <option value="">全部状态</option>
            <option value="active">启用中</option>
            <option value="disabled">已停用</option>
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索前缀 / 备注"
            className="text-sm border hairline rounded-sm px-3 py-1.5 bg-white flex-1"
          />
        </div>

        {error && (
          <p className="mb-4 text-sm text-[#B23A2E]" role="alert">
            {error}
          </p>
        )}

        {listLoading ? (
          <p className="text-sm text-sub py-6">加载中…</p>
        ) : codes.length === 0 ? (
          <p className="text-sm text-sub py-6">暂无匹配的密码。</p>
        ) : (
          <div className="border hairline rounded-sm overflow-x-auto bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[12px] text-sub border-b hairline">
                  <th className="px-4 py-3 font-normal">前缀</th>
                  <th className="px-4 py-3 font-normal">使用 / 总量</th>
                  <th className="px-4 py-3 font-normal">剩余</th>
                  <th className="px-4 py-3 font-normal">状态</th>
                  <th className="px-4 py-3 font-normal">备注</th>
                  <th className="px-4 py-3 font-normal text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c.id} className="border-b hairline last:border-b-0">
                    <td className="px-4 py-3 font-mono tracking-[0.12em]">{c.code_prefix}****</td>
                    <td className="px-4 py-3">
                      {c.used_count} / {c.total_uses}
                    </td>
                    <td className="px-4 py-3">{c.remaining_uses}</td>
                    <td className="px-4 py-3">
                      {c.is_active ? (
                        <span className="text-[#2F6B3A]">启用</span>
                      ) : (
                        <span className="text-sub">停用</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sub">{c.note ?? '–'}</td>
                    <td className="px-4 py-3 text-right">
                      {c.is_active && (
                        <button
                          type="button"
                          onClick={() => handleDisable(c.id)}
                          className="text-sm text-[#B23A2E] hover:underline"
                        >
                          停用
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
