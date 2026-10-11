import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <header className="border-b hairline">
        <div className="mx-auto max-w-3xl px-5 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-baseline gap-3 no-underline text-ink">
            <span className="font-serif text-lg tracking-wide2 font-semibold">城市灵魂测评</span>
            <span className="text-[10px] uppercase tracking-wide3 text-sub hidden sm:inline">
              City Soul Quiz
            </span>
          </Link>
          <Link
            to="/admin/login"
            className="text-xs text-sub hover:text-ink no-underline tracking-wide"
          >
            管理后台
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t hairline mt-16">
        <div className="mx-auto max-w-3xl px-5 py-8 text-center">
          <p className="text-xs leading-relaxed text-sub">
            本测评仅供娱乐与自我探索，不构成专业心理诊断，也不是迁居建议。
            结果基于城市生活方式原型匹配，未经心理测量学实证验证。
          </p>
        </div>
      </footer>
    </div>
  )
}
