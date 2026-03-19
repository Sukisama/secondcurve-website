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
