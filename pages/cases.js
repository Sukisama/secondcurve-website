import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getData } from '../lib/data'

const categories = ['全部', '智能产品', '技术探索', '商业落地']

export default function Cases() {
  const [data, setData] = useState(null)

  useEffect(() => {
    setData(getData())
  }, [])

  const cases = data?.cases || []

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">实战案例</h1>
        <p className="text-gray-500 text-lg">真实项目拆解，可复用的方法论</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map((cat, index) => (
          <button
            key={index}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              index === 0
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((item) => (
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

      <div className="flex justify-center mt-12">
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition">
            ← 上一页
          </button>
          <button className="px-4 py-2 rounded-xl text-sm bg-gray-900 text-white">1</button>
          <button className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition">2</button>
          <button className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition">3</button>
          <button className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition">
            下一页 →
          </button>
        </div>
      </div>
    </div>
  )
}
