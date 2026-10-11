import type { DimensionKey } from '../types/quiz'

export interface CityProfile {
  cityId: string
  nameZh: string
  nameEn: string
  titleZh: string
  titleEn: string
  oneLiner: string
  keywords: string[]
  matchReason: string
  strengths: string
  blindSpots: string
  advice: string
  accent: string
  vector: Record<DimensionKey, number>
}

// 维度顺序固定：autonomy, growth, novelty, security, belonging, nature
// 原型分值为 1–5 的产品设计假设，非实证测量结果。
export const CITY_PROFILES: CityProfile[] = [
  {
    cityId: 'shanghai',
    nameZh: '上海',
    nameEn: 'Shanghai',
    titleZh: '世界中心的探索者',
    titleEn: 'The Urban Explorer',
    oneLiner: '你渴望在可能性最密集的地方，把自己活成一部不断更新的作品。',
    keywords: ['自主', '成长', '刺激'],
    matchReason:
      '你对自主空间与新鲜刺激的渴望都处在高位，而上海原型恰好在「自主、成长、刺激」三个维度上最为突出。它能提供你需要的高密度选择与快速迭代的节奏，让你始终感到有事可做、有新东西可追。',
    strengths:
      '你不容易被一套既定轨迹框住，乐于在变化中寻找自己的位置。对机会嗅觉敏锐，也愿意为想要的生活主动争取，适应力与行动力是你最可靠的底牌。',
    blindSpots:
      '持续的高刺激也可能让你把「忙碌」误当成「前进」。当选择多到眼花时，你偶尔会难以安放那些需要慢下来才能长出来的东西——比如一段稳定的关系，或一个真正属于自己的节奏。',
    advice:
      '在追逐可能性的同时，给自己留一处「不产生结果」的时间：一段没有目的地的散步、一个不刷手机的夜晚。真正的自主，也包括有权利选择慢下来。',
    accent: '#B23A2E',
    vector: { autonomy: 5, growth: 5, novelty: 5, security: 2, belonging: 2, nature: 2 },
  },
  {
    cityId: 'chengdu',
    nameZh: '成都',
    nameEn: 'Chengdu',
    titleZh: '把日子过成生活的人',
    titleEn: 'The Everyday Life Romantic',
    oneLiner: '你相信生活的质感藏在一顿饭、一局茶、一次不赶时间的相处里。',
    keywords: ['日常生活', '关系', '适度新鲜感'],
    matchReason:
      '你的关系与归属需求突出，同时对新鲜体验保持适度开放，而成都原型恰好把「关系」放在最高处，并保有恰到好处的新鲜感与自然松弛。它给你的不是冲刺的跑道，而是一张可以慢慢坐下来的桌子。',
    strengths:
      '你很会经营日常，能把平凡的小事变成值得回味的部分。对人有耐心，也容易在熟悉的关系里积累起真实的归属感，这让你的生活有一种稳定而温暖的底色。',
    blindSpots:
      '舒适的氛围有时会悄悄软化你的锐气。当你明明想要更多成长或改变时，「再等等、先舒服一下」的声音可能会替你做决定。',
    advice:
      '让松弛成为你的补给站，而不是拖延的借口。为真正想做的事设一个不妥协的小目标，你会发现从容和进取其实可以并存。',
    accent: '#C26D3A',
    vector: { autonomy: 3, growth: 3, novelty: 4, security: 3, belonging: 5, nature: 4 },
  },
  {
    cityId: 'hangzhou',
    nameZh: '杭州',
    nameEn: 'Hangzhou',
    titleZh: '想成长也想好好生活的人',
    titleEn: 'The Balanced Builder',
    oneLiner: '你既不想错过向上的机会，也不愿意为了奔跑而丢掉生活的质感。',
    keywords: ['成长', '自主', '自然'],
    matchReason:
      '你把「成长」和「自然」同时看得很重，既需要事业上的空间，也渴望能呼吸的日常。杭州原型在成长与自然上都给了高分，能在进取与松弛之间提供一种难得的平衡。',
    strengths:
      '你善于在理想与现实之间搭桥：既有把事情做成的执行力，也保留了感受生活的能力。这种「两条腿走路」的平衡感，让你比纯粹的奋斗者或纯粹的隐士都走得更远。',
    blindSpots:
      '平衡的另一面是拉扯。你偶尔会在「再拼一点」和「该歇一歇」之间反复摇摆，把很多精力花在选择本身，而不是行动上。',
    advice:
      '不必苛求每一天都完美平衡，允许自己在不同阶段有所侧重。一段时间全力向前，一段时间安心生活，动态的平衡比静止的对半开更可持续。',
    accent: '#3E7D5B',
    vector: { autonomy: 4, growth: 5, novelty: 3, security: 3, belonging: 3, nature: 4 },
  },
  {
    cityId: 'nanjing',
    nameZh: '南京',
    nameEn: 'Nanjing',
    titleZh: '有根也有远方的人',
    titleEn: 'The Rooted Intellectual',
    oneLiner: '你需要在安稳的土壤里扎根，也要在文化与思辨里看见更远的地方。',
    keywords: ['归属', '稳定', '文化生活'],
    matchReason:
      '你的归属与稳定需求都很高，而南京原型恰恰把「安稳与秩序」放在首位，同时保有一份有分量的文化沉淀。它像一棵根系很深的老树，能给你既踏实又有深度的生活坐标。',
    strengths:
      '你重视根基，也懂得沉淀。面对不确定时，你有耐心等待、愿意把一件事做深，这种沉得住气的品质，让你在长周期的事情上往往表现得更稳。',
    blindSpots:
      '对安稳的偏爱有时会变成对变化的过度警惕。当新的可能来敲门时，你可能会先看到风险，而慢半拍才看到机会。',
    advice:
      '在守住根基的前提下，给自己一个「小步试探」的通道：每年尝试一件不那么熟悉的事，让远方以你能承受的剂量慢慢靠近。',
    accent: '#5B4A6B',
    vector: { autonomy: 3, growth: 3, novelty: 3, security: 5, belonging: 4, nature: 3 },
  },
  {
    cityId: 'guangzhou',
    nameZh: '广州',
    nameEn: 'Guangzhou',
    titleZh: '务实而自由的生活派',
    titleEn: 'The Grounded Individualist',
    oneLiner: '你追求一种不摆架子的自由：要过得实在，也要活得自在。',
    keywords: ['自主', '日常便利', '关系'],
    matchReason:
      '你在自主、关系与日常便利之间寻求一种务实的平衡，广州原型各维度都不极端，却在「过得自在」这件事上非常实在。它给你的不是宏大的叙事，而是一种可以落地的自由。',
    strengths:
      '你脚踏实地，很少被虚的东西带走。对生活的实际需求判断准确，既能照顾自己，也能在人情往来中游刃有余，这种「接地气」的通达让你到哪里都能活得不差。',
    blindSpots:
      '过于务实，有时会让你低估那些「暂时看不到用处」的东西——比如长期的学习投入，或一段需要慢慢培养的兴趣。',
    advice:
      '偶尔允许自己「务点虚」。为一件不带目的、只凭喜欢的事投入一段时间，它未必立刻有用，却常常在更长的尺度上回馈你。',
    accent: '#B8863A',
    vector: { autonomy: 4, growth: 4, novelty: 4, security: 4, belonging: 4, nature: 2 },
  },
  {
    cityId: 'xiamen',
    nameZh: '厦门',
    nameEn: 'Xiamen',
    titleZh: '需要呼吸空间的人',
    titleEn: 'The Space Seeker',
    oneLiner: '你比很多人更早意识到：自由和自然，是生活里不能妥协的底价。',
    keywords: ['自主', '自然', '松弛'],
    matchReason:
      '你对「自主」和「自然」的需求都处于高位，厦门原型在这两个维度上给了最高分，同时保留一份松弛感。它像一扇随时能推开、就能吹到海风的窗，给你的生活留出了呼吸的余地。',
    strengths:
      '你对环境很敏感，也清楚自己需要什么才能保持状态。这种自我觉察，让你能主动为自己争取空间，而不是等到被消耗殆尽才后知后觉。',
    blindSpots:
      '对呼吸空间的看重，偶尔会与现实的进取压力产生冲突。你可能会在「想要更多机会」和「只想安静待着」之间，迟迟做不出选择。',
    advice:
      '把「呼吸」制度化：无论多忙，为自己固定留出一段不被安排的时间。空间不是等到有空才有的，而是你为自己留出来的。',
    accent: '#2E7DAE',
    vector: { autonomy: 5, growth: 2, novelty: 3, security: 3, belonging: 3, nature: 5 },
  },
  {
    cityId: 'beijing',
    nameZh: '北京',
    nameEn: 'Beijing',
    titleZh: '想参与时代的人',
    titleEn: 'The Purpose-Driven Achiever',
    oneLiner: '你想站在事情发生的地方，成为塑造这个时代的一份子。',
    keywords: ['成长', '影响力', '文化刺激'],
    matchReason:
      '你的成长与刺激需求都很高，北京原型在「成长、新鲜刺激」上极为突出，而安稳与松弛偏低。它吸引的是想要靠近资源、参与大叙事的人——你想要的不是旁观，而是身处其中。',
    strengths:
      '你有明确的方向感和向上的动力，敢于进入高强度的环境，也愿意为更大的目标承担压力。这种「想做事」的劲头，是你最稀缺也最珍贵的资产。',
    blindSpots:
      '高强度环境容易让人把自我价值绑定在外部成就上。当进展不如预期时，你可能会过度自责，忽视了身体和情绪已经发出的信号。',
    advice:
      '记得在奔跑中定期给自己「断电」。你的价值不只来自产出，休息不是浪费，而是让你能跑得更久的必要投资。',
    accent: '#8C2F2F',
    vector: { autonomy: 3, growth: 5, novelty: 5, security: 2, belonging: 3, nature: 2 },
  },
  {
    cityId: 'kunming',
    nameZh: '昆明',
    nameEn: 'Kunming',
    titleZh: '不想把人生过成倒计时的人',
    titleEn: 'The Slow-Living Idealist',
    oneLiner: '你拒绝被效率绑架，更想要一种不慌不忙、有质感的生活节奏。',
    keywords: ['松弛', '自然', '稳定'],
    matchReason:
      '你把「自然与松弛」放在很高的位置，昆明原型在这个维度上给出最高分，同时保有适度的安稳。它像是给生活按下了慢放键，让你不必用倒计时的方式过完每一天。',
    strengths:
      '你有能力对抗集体性的焦虑，不被外界的快节奏带跑。你珍惜当下、重视感受，这种定力在一个人人都很着急的时代里，本身就是一种稀缺的能力。',
    blindSpots:
      '对慢的偏爱，有时会让你错过需要「赶一赶」才能抓住的机会。你可能需要留意，从容不等于拖延，理想主义也需要一些具体的行动去落地。',
    advice:
      '把理想的生活拆成可以执行的小步骤：一个具体的习惯、一次说走就走的安排。慢，是心境，不是停滞——让从容带着你走，而不是让你停在原地。',
    accent: '#4E8C7A',
    vector: { autonomy: 3, growth: 2, novelty: 2, security: 4, belonging: 3, nature: 5 },
  },
]

export function getCityProfile(cityId: string): CityProfile | undefined {
  return CITY_PROFILES.find((c) => c.cityId === cityId)
}

export const CITY_ORDER: string[] = CITY_PROFILES.map((c) => c.cityId)
