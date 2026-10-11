import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-5">
      {/* Hero */}
      <section className="pt-14 pb-10 sm:pt-20 sm:pb-14">
        <p className="text-[11px] uppercase tracking-wide3 text-sub mb-5">
          A Soul × City Personality Quiz
        </p>
        <h1 className="font-serif text-3xl sm:text-[2.6rem] leading-tight font-semibold tracking-wide">
          如果你的灵魂只能住进一座城市，
          <br className="hidden sm:block" />
          它会选择哪里？
        </h1>
        <p className="mt-5 text-lg text-sub italic font-serif">
          If Your Soul Could Live in Only One City, Where Would It Belong?
        </p>
        <p className="mt-8 text-[15px] leading-7 text-ink/80 max-w-xl">
          24 道生活情境题，像一面安静的镜子，照出你真正在意的自由、成长、关系与节奏——
          再把它对向不同的中国城市生活方式原型，看看你的灵魂更愿意在哪里安家。
        </p>

        <div className="mt-8 flex flex-wrap gap-3 text-[13px]">
          {['24 道情境题', '约 5 分钟', '生活方式原型'].map((chip) => (
            <span
              key={chip}
              className="px-3.5 py-1.5 border hairline rounded-full text-sub tracking-wide"
            >
              {chip}
            </span>
          ))}
        </div>

        <Link
          to="/access"
          className="mt-10 inline-block bg-ink text-paper px-8 py-3.5 text-[15px] tracking-wider no-underline hover:opacity-90 transition-opacity rounded-sm"
        >
          开始探索
        </Link>
      </section>

      {/* 说明 */}
      <section className="py-10 border-t hairline">
        <h2 className="font-serif text-lg tracking-wide mb-4">关于这次测评</h2>
        <div className="text-sm leading-7 text-ink/80 space-y-4">
          <p>
            你将在六个维度上得到 0–100 的分数：自主与自由、成长与机会、新鲜与刺激、
            安稳与秩序、关系与归属、自然与松弛。这些分数共同指向一个与你生活方式最接近的城市原型。
          </p>
          <p>
            城市原型是基于产品假设设计的象征性形象，不代表某座城市的全体居民。
            结果用于娱乐和自我反思，不构成心理诊断或迁居建议。
          </p>
        </div>
      </section>
    </div>
  )
}
