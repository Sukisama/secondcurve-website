import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getData } from '../lib/data'

export default function Home() {
  const [data, setData] = useState(null)

  useEffect(() => {
    setData(getData())
  }, [])

  const features = [
    { icon: '📚', title: '知识库', description: '体系化的AI学习路径', href: '/knowledge' },
    { icon: '🎯', title: '实战案例', description: '真实项目拆解', href: '/cases' },
    { icon: '👋', title: '线下活动', description: '面对面交流', href: '/about' },
    { icon: '🤝', title: '资源对接', description: '连接对的人', href: '/resources' },
  ]

  const latestCases = data?.cases?.slice(0, 4) || []
  const events = data?.events || []

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="py-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-full max-w-md relative">
            <Image
              src="/logo-full.png"
              alt="第二曲线"
              width={600}
              height={150}
              className="w-full h-auto"
            />
          </div>
        </div>
        <p className="text-lg text-gray-500 mb-6 max-w-2xl mx-auto">
          成都AI创客的聚集地 —— 链接技术人、产品经理、创业者，一起把AI想法变成现实
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition">
            加入社区
          </button>
          <Link href="/knowledge" className="bg-white text-gray-900 px-6 py-3 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition">
            浏览知识库
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="py-6 border-y border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { number: '500+', label: '活跃成员' },
            { number: '80+', label: '实战案例' },
            { number: '30+', label: '线下活动' },
            { number: '15+', label: '孵化项目' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => (
            <Link key={index} href={feature.href} className="group">
              <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Cases */}
      <section className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">精选实战案例</h2>
          <Link href="/cases" className="text-sm text-gray-500 hover:text-gray-900 transition">
            查看全部 →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {latestCases.map((item) => (
            <Link key={item.id} href={`/cases/${item.id}`} className="group">
              <div className="border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-medium text-gray-500">{item.category}</span>
                    <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-gray-700 transition">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-400">作者：{item.author}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Events */}
      <section className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">近期活动</h2>
        </div>
        <div className="space-y-3">
          {events.map((event, index) => (
            <div key={event.id} className="border border-gray-200 rounded-2xl p-5 flex items-center gap-5 hover:bg-gray-50 transition">
              <div className="text-center bg-gray-100 px-4 py-2.5 rounded-xl min-w-[70px]">
                <div className="text-lg font-bold text-gray-900">{event.date?.split('-')[1]}</div>
                <div className="text-xs text-gray-500">{event.date?.split('-')[0]}月</div>
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-gray-900">{event.title}</h3>
                <p className="text-sm text-gray-500 mt-1">📍 {event.location}</p>
              </div>
              <button className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition">
                报名
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 mt-8">
        <div className="bg-gray-900 rounded-3xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-3">
            准备好开始你的AI第二曲线了吗？
          </h2>
          <p className="text-gray-400 mb-6">
            加入500+成都AI创客，一起创造未来
          </p>
          <button className="bg-white text-gray-900 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition">
            立即加入
          </button>
        </div>
      </section>
    </div>
  )
}
