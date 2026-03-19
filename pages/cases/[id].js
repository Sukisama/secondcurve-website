import { useRouter } from 'next/router'
import Link from 'next/link'

const caseData = {
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
  }
}

export default function CaseDetail() {
  const router = useRouter()
  const { id } = router.query
  const data = caseData[id] || caseData[1]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/cases" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center">
        ← 返回案例列表
      </Link>

      <article>
        <header className="mb-10">
          <span className="text-sm text-gray-500">{data.category}</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-4">{data.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>作者：{data.author}</span>
            <span>·</span>
            <span>{data.date}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-5">
            {data.tags.map((tag, i) => (
              <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="prose prose-gray max-w-none">
          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4">项目概览</h2>
            <p className="text-gray-600">{data.overview}</p>
          </section>

          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4">背景</h2>
            <p className="text-gray-600">{data.background}</p>
          </section>

          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4">核心挑战</h2>
            <ul className="space-y-2 text-gray-600">
              {data.challenge.map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4">解决方案</h2>
            <p className="text-gray-600">{data.solution}</p>
          </section>

          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4">技术栈</h2>
            <div className="flex flex-wrap gap-2">
              {data.techStack.map((tech, i) => (
                <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4">成果数据</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {data.results.map((result, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-xl flex items-start gap-3">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-700 text-sm">{result}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4">经验总结</h2>
            <div className="bg-yellow-50 p-6 rounded-xl border-l-4 border-yellow-400">
              <p className="text-gray-700 italic">"{data.learnings}"</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">有问题想问作者？</h3>
          <button className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition">
            在评论区提问
          </button>
        </div>
      </article>
    </div>
  )
}
