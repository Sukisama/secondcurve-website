import Link from 'next/link'

const series = [
  {
    id: 1,
    title: '大模型微调实战',
    author: '张三',
    articles: 8,
    description: '从数据准备到模型部署的完整流程'
  },
  {
    id: 2,
    title: 'AI产品设计指南',
    author: '李四',
    articles: 6,
    description: '如何设计有价值的AI产品'
  },
  {
    id: 3,
    title: 'Prompt Engineering',
    author: '王五',
    articles: 10,
    description: '成为Prompt高手的必经之路'
  },
]

const tools = [
  { name: 'OpenAI API', category: '大模型', description: 'GPT-4, GPT-3.5等模型' },
  { name: 'LangChain', category: '框架', description: 'LLM应用开发框架' },
  { name: 'Hugging Face', category: '模型库', description: '开源模型和数据集' },
  { name: 'Chroma', category: '向量数据库', description: '轻量级向量存储' },
  { name: 'Streamlit', category: 'UI框架', description: '快速搭建数据应用' },
  { name: 'Pinecone', category: '向量数据库', description: '云端向量检索服务' },
]

const learningPaths = [
  {
    level: '入门',
    title: 'AI基础',
    topics: ['什么是AI/ML/DL', '大模型基础概念', 'Prompt Engineering入门']
  },
  {
    level: '进阶',
    title: '技术实战',
    topics: ['RAG系统开发', '大模型微调', 'AI应用开发']
  },
  {
    level: '高级',
    title: '深度探索',
    topics: ['Transformer原理解析', '模型训练优化', 'MLOps实践']
  },
]

export default function Knowledge() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">知识库</h1>
        <p className="text-gray-500 text-lg">体系化的AI学习路径，让你少走弯路</p>
      </div>

      {/* Learning Path */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-gray-900 mb-8">学习路径</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {learningPaths.map((path, index) => (
            <div key={index} className="border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">{path.level}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">{path.title}</h3>
              <ul className="space-y-2">
                {path.topics.map((topic, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></span>
                    {topic}
                  </li>
                ))}
              </ul>
              <button className="mt-6 w-full bg-gray-100 text-gray-900 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                开始学习
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Series */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-900">专题系列</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {series.map((s) => (
            <div key={s.id} className="border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                  {s.articles} 篇文章
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm mb-4">{s.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">作者：{s.author}</span>
                <Link href="#" className="text-sm text-gray-900 font-medium hover:underline">
                  阅读 →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-8">工具库</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{tool.name}</h3>
                  <span className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs mt-1">
                    {tool.category}
                  </span>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-3">{tool.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
