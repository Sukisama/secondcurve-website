export const defaultData = {
  cases: [
    { id: 1, title: 'AI智能客服系统', category: '智能产品', description: '基于大模型的企业级智能客服解决方案', author: '张明', date: '2026-03-15', tags: ['RAG', 'LangChain'] },
    { id: 2, title: 'RAG知识库系统', category: '技术探索', description: '基于私有数据的检索增强生成系统', author: '李华', date: '2026-03-10', tags: ['Chroma', 'Embedding'] },
    { id: 3, title: 'AI内容创作助手', category: '商业落地', description: '帮助企业批量生成营销内容的AI工具', author: '王芳', date: '2026-03-05', tags: ['内容生成', 'SaaS'] },
    { id: 4, title: 'AI面试助手', category: '智能产品', description: '辅助技术面试的智能问答系统', author: '陈伟', date: '2026-02-28', tags: ['面试', '教育'] },
  ],
  members: [
    { id: 1, name: '张明', role: '全栈开发', skills: ['React', 'Node.js', 'LLM'], looking: '寻找AI产品创业机会', avatar: '👨‍💻' },
    { id: 2, name: '李华', role: '产品经理', skills: ['产品设计', '用户研究', 'AI产品'], looking: '寻找技术合伙人', avatar: '👩‍💼' },
    { id: 3, name: '王芳', role: 'AI算法工程师', skills: ['PyTorch', 'NLP', '模型微调'], looking: '参与有意思的AI项目', avatar: '👩‍🔬' },
    { id: 4, name: '陈伟', role: '创业者', skills: ['创业', '融资', 'BD'], looking: '寻找AI方向的项目和团队', avatar: '👨‍💼' },
  ],
  events: [
    { id: 1, date: '03-25', title: 'AI产品设计 Workshop', location: '成都·天府三街' },
    { id: 2, date: '03-30', title: '大模型微调实战分享', location: '线上·腾讯会议' },
  ]
}

// 案例详情数据
export const caseDetails = {
  1: {
    title: 'AI智能客服系统',
    category: '智能产品',
    author: '张明',
    date: '2026-03-15',
    tags: ['RAG', 'LangChain', '企业应用'],
    overview: '这是一个基于大模型的企业级智能客服解决方案，帮助企业降低70%的人工客服成本。',
    background: '某电商平台每天面临大量重复性客户咨询，人工客服成本高且响应时间不稳定。',
    challenge: [
      '客户咨询量大，人工成本高',
      '常见问题回答不统一',
      '夜间和节假日客服不足',
      '需要对接现有CRM系统'
    ],
    solution: '使用RAG技术，结合企业知识库和大模型，构建智能客服系统。',
    techStack: ['LangChain', 'OpenAI GPT-4', 'Chroma DB', 'FastAPI', 'React'],
    results: [
      '70% 的咨询由AI自动处理',
      '响应时间从5分钟降至秒级',
      '客户满意度提升25%',
      '节省人工成本 ¥50万/年'
    ],
    learnings: '企业级AI应用最重要的是稳定性和可解释性，而不是追求最炫酷的技术。'
  },
  2: {
    title: 'RAG知识库系统',
    category: '技术探索',
    author: '李华',
    date: '2026-03-10',
    tags: ['Chroma', 'Embedding', '知识管理'],
    overview: '基于私有数据的检索增强生成系统，让企业知识库真正"活"起来。',
    background: '企业积累了大量的文档和知识，但员工很难快速找到所需信息。',
    challenge: [
      '文档分散在多个系统中',
      '关键词搜索很难理解语义',
      '新员工上手慢，知识传承困难',
      '文档更新后搜索结果滞后'
    ],
    solution: '使用向量数据库存储文档嵌入，结合大模型实现语义化的知识检索与问答。',
    techStack: ['Chroma DB', 'OpenAI Embedding', 'LangChain', 'Next.js', 'Python'],
    results: [
      '知识检索准确率提升60%',
      '员工平均查找时间减少80%',
      '新员工入职培训时间缩短50%',
      '支持多格式文档自动解析'
    ],
    learnings: '好的 RAG 系统关键在于数据清洗和分块策略，而不仅仅是选择哪个模型。'
  },
  3: {
    title: 'AI内容创作助手',
    category: '商业落地',
    author: '王芳',
    date: '2026-03-05',
    tags: ['内容生成', 'SaaS', '营销'],
    overview: '帮助企业批量生成高质量营销内容的AI工具，已服务50+企业客户。',
    background: '中小企业需要大量的营销内容（社交媒体、广告文案等），但缺少专业的内容团队。',
    challenge: [
      '内容需求量大但预算有限',
      '需要保持品牌调性一致',
      '多平台内容格式各不相同',
      '内容质量参差不齐'
    ],
    solution: '构建品牌知识库，结合大模型和提示工程，实现个性化内容批量生成。',
    techStack: ['OpenAI GPT-4', 'Next.js', 'PostgreSQL', 'Redis', 'AWS'],
    results: [
      '内容生产效率提升10倍',
      '已服务50+企业客户',
      '月生成内容超过10000篇',
      '客户续费率达85%'
    ],
    learnings: '商业化AI产品的核心竞争力不是技术本身，而是对垂直领域的深度理解。'
  },
  4: {
    title: 'AI面试助手',
    category: '智能产品',
    author: '陈伟',
    date: '2026-02-28',
    tags: ['面试', '教育', 'AI助手'],
    overview: '辅助技术面试的智能问答系统，帮助求职者和面试官提升面试效率。',
    background: '技术面试准备耗时长，面试官出题质量不稳定，缺少标准化的评估体系。',
    challenge: [
      '面试题目准备耗时',
      '面试评估标准不统一',
      '求职者缺乏系统化的练习平台',
      '面试反馈不够及时和具体'
    ],
    solution: '基于大模型构建智能面试系统，支持自动出题、模拟面试和即时反馈。',
    techStack: ['OpenAI GPT-4', 'React', 'Node.js', 'MongoDB', 'WebSocket'],
    results: [
      '已帮助1000+求职者准备面试',
      '面试通过率提升35%',
      '平均面试准备时间缩短60%',
      '用户满意度评分4.8/5'
    ],
    learnings: '教育类AI产品要注重引导式学习，而不是简单地给出答案。'
  }
}

export function getData() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('secondcurve_data')
    if (saved) {
      return JSON.parse(saved)
    }
  }
  return defaultData
}

export function saveData(data) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('secondcurve_data', JSON.stringify(data))
  }
}

export function getCaseIds() {
  return Object.keys(caseDetails)
}

export function getCaseDetail(id) {
  return caseDetails[id] || null
}
