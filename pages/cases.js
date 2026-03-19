import Link from 'next/link'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { getData } from '../lib/data'

const categories = ['全部', '智能产品', '技术探索', '商业落地']

export default function Cases() {
  const [data, setData] = useState(null)
  const [activeCategory, setActiveCategory] = useState('全部')

  useEffect(() => {
    setData(getData())
  }, [])

  const allCases = data?.cases || []
  const filteredCases = activeCategory === '全部'
    ? allCases
    : allCases.filter(item => item.category === activeCategory)

  return (
    <>
      <Head>
        <title>实战案例 - 真实项目拆解 | 第二曲线</title>
        <meta name="description" content="成都AI创客社区的实战案例集，真实项目拆解，可复用的方法论。涵盖智能产品、技术探索、商业落地等方向。" />
      </Head>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">实战案例</h1>
          <p className="text-gray-500 text-lg">真实项目拆解，可复用的方法论</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeCategory === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((item) => (
            <Link key={item.id} href={`/cases/${item.id}`} className="group">
              <article className="border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:bg-gray-50 transition h-full flex flex-col">
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500">{item.category}</span>
                    <span className="text-xs text-gray-400">{item.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags?.map((tag, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-400">作者：{item.author}</span>
                  <span className="text-sm text-gray-900 font-medium">
                    查看详情 →
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {filteredCases.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">暂无「{activeCategory}」类目的案例</p>
          </div>
        )}
      </div>
    </>
  )
}
