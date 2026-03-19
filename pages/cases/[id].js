import Link from 'next/link'
import Head from 'next/head'
import { getCaseIds, getCaseDetail } from '../../lib/data'

export async function getStaticPaths() {
  const ids = getCaseIds()
  const paths = ids.map((id) => ({
    params: { id: String(id) },
  }))
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const data = getCaseDetail(params.id)
  if (!data) {
    return { notFound: true }
  }
  return { props: { caseData: data, id: params.id } }
}

export default function CaseDetail({ caseData }) {
  if (!caseData) return null

  return (
    <>
      <Head>
        <title>{caseData.title} - 实战案例 | 第二曲线</title>
        <meta name="description" content={caseData.overview} />
      </Head>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/cases" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center">
          ← 返回案例列表
        </Link>

        <article>
          <header className="mb-10">
            <span className="text-sm text-gray-500">{caseData.category}</span>
            <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-4">{caseData.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>作者：{caseData.author}</span>
              <span>·</span>
              <span>{caseData.date}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-5">
              {caseData.tags.map((tag, i) => (
                <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div className="prose prose-gray max-w-none">
            <section className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 mb-4">项目概览</h2>
              <p className="text-gray-600">{caseData.overview}</p>
            </section>

            <section className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 mb-4">背景</h2>
              <p className="text-gray-600">{caseData.background}</p>
            </section>

            <section className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 mb-4">核心挑战</h2>
              <ul className="space-y-2 text-gray-600">
                {caseData.challenge.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 mb-4">解决方案</h2>
              <p className="text-gray-600">{caseData.solution}</p>
            </section>

            <section className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 mb-4">技术栈</h2>
              <div className="flex flex-wrap gap-2">
                {caseData.techStack.map((tech, i) => (
                  <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 mb-4">成果数据</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {caseData.results.map((result, i) => (
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
                <p className="text-gray-700 italic">"{caseData.learnings}"</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">有问题想问作者？</h3>
            <button
              onClick={() => alert('💬 请关注微信公众号「第二曲线AI社区」联系作者')}
              className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
            >
              在评论区提问
            </button>
          </div>
        </article>
      </div>
    </>
  )
}
