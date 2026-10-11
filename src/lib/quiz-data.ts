import type { AnswerValue, QuizQuestion } from '../types/quiz'

// 24 道情境题，六个维度 × 4 题。反向题已标注 reverseScored。
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // A. 自主与自由 autonomy
  {
    id: 'A1',
    number: 1,
    dimension: 'autonomy',
    reverseScored: false,
    text: '比起生活节奏已经被安排好的环境，我更希望自己决定每天怎么度过。',
  },
  {
    id: 'A2',
    number: 2,
    dimension: 'autonomy',
    reverseScored: false,
    text: '如果一座城市能给我更多选择，即使生活需要自己多费一点心，我也愿意接受。',
  },
  {
    id: 'A3',
    number: 3,
    dimension: 'autonomy',
    reverseScored: false,
    text: '我会在意自己是否能按照个人喜好生活，而不是总被周围人的期待左右。',
  },
  {
    id: 'A4',
    number: 4,
    dimension: 'autonomy',
    reverseScored: true,
    text: '对我来说，生活中有明确规则、稳定安排，比拥有较大的个人选择空间更重要。',
  },

  // B. 成长与机会 growth
  {
    id: 'B1',
    number: 5,
    dimension: 'growth',
    reverseScored: false,
    text: '我希望生活的城市能让我接触到新的知识、职业机会或不同的人生路径。',
  },
  {
    id: 'B2',
    number: 6,
    dimension: 'growth',
    reverseScored: false,
    text: '即使需要面对竞争和压力，只要有值得争取的成长机会，我通常愿意尝试。',
  },
  {
    id: 'B3',
    number: 7,
    dimension: 'growth',
    reverseScored: false,
    text: '如果一座城市让我觉得未来几年很难继续成长，我可能会考虑离开。',
  },
  {
    id: 'B4',
    number: 8,
    dimension: 'growth',
    reverseScored: true,
    text: '即使身边没有太多新的发展机会，只要目前生活稳定，我通常就很满足。',
  },

  // C. 新鲜与刺激 novelty
  {
    id: 'C1',
    number: 9,
    dimension: 'novelty',
    reverseScored: false,
    text: '我喜欢城市里经常有新的展览、演出、活动、店铺或值得探索的地方。',
  },
  {
    id: 'C2',
    number: 10,
    dimension: 'novelty',
    reverseScored: false,
    text: '周末如果总是重复同样的安排，我很容易感到生活有些无聊。',
  },
  {
    id: 'C3',
    number: 11,
    dimension: 'novelty',
    reverseScored: false,
    text: '我愿意为了新鲜体验尝试不熟悉的街区、活动或生活方式。',
  },
  {
    id: 'C4',
    number: 12,
    dimension: 'novelty',
    reverseScored: true,
    text: '比起不断接触新事物，我更喜欢熟悉的环境和固定的日常。',
  },

  // D. 安稳与秩序 security
  {
    id: 'D1',
    number: 13,
    dimension: 'security',
    reverseScored: false,
    text: '生活成本、通勤时间和日常安排相对可预测，会让我更有安全感。',
  },
  {
    id: 'D2',
    number: 14,
    dimension: 'security',
    reverseScored: false,
    text: '我希望所在城市的公共交通、生活设施和办事流程尽量可靠。',
  },
  {
    id: 'D3',
    number: 15,
    dimension: 'security',
    reverseScored: false,
    text: '即使某座城市很有吸引力，如果生活成本和日常压力让我难以掌控，我也会犹豫。',
  },
  {
    id: 'D4',
    number: 16,
    dimension: 'security',
    reverseScored: true,
    text: '为了体验更丰富的生活，我可以接受日常安排经常变化、缺少稳定感。',
  },

  // E. 关系与归属 belonging
  {
    id: 'E1',
    number: 17,
    dimension: 'belonging',
    reverseScored: false,
    text: '我希望生活的城市能让我比较容易找到有共同兴趣、可以自然相处的人。',
  },
  {
    id: 'E2',
    number: 18,
    dimension: 'belonging',
    reverseScored: false,
    text: '熟悉的街区、常去的店铺和稳定的人际关系，会让我逐渐对一个地方产生归属感。',
  },
  {
    id: 'E3',
    number: 19,
    dimension: 'belonging',
    reverseScored: false,
    text: '我希望自己不只是住在一座城市里，还能感觉到自己是这里生活的一部分。',
  },
  {
    id: 'E4',
    number: 20,
    dimension: 'belonging',
    reverseScored: true,
    text: '即使很少与周围的人建立联系，只要个人生活方便，我也能长期适应。',
  },

  // F. 自然与松弛 nature
  {
    id: 'F1',
    number: 21,
    dimension: 'nature',
    reverseScored: false,
    text: '当我能比较容易接触到公园、绿地、海边、山景或其他自然环境时，生活质量会明显提高。',
  },
  {
    id: 'F2',
    number: 22,
    dimension: 'nature',
    reverseScored: false,
    text: '我希望日常生活留有喘息的空间，而不是长期处于赶时间的状态。',
  },
  {
    id: 'F3',
    number: 23,
    dimension: 'nature',
    reverseScored: false,
    text: '相比一直追赶效率，我更重视能否拥有从容的生活节奏。',
  },
  {
    id: 'F4',
    number: 24,
    dimension: 'nature',
    reverseScored: true,
    text: '为了获得更多机会和城市资源，我愿意长期牺牲休息时间，并接受较少的自然空间。',
  },
]

export function isValidAnswerValue(value: unknown): value is AnswerValue {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  )
}

export function getQuestionById(id: string): QuizQuestion | undefined {
  return QUIZ_QUESTIONS.find((q) => q.id === id)
}
