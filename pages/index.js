import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { getLeaderboard } from '../lib/points'
import { supabase } from '../lib/supabase/client'

export default function Home() {
  const [cases, setCases] = useState([])
  const [events, setEvents] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    fetchLeaderboard()
  }, [])

  const fetchData = async () => {
    try {
      // 获取案例
      const { data: casesData } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4)

      // 获取活动
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(5)

      setCases(casesData || [])
      setEvents(eventsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaderboard = async () => {
    const { data } = await getLeaderboard(10)
    setLeaderboard(data || [])
  }

  const features = [
    { icon: '📚', title: '知识库', description: '体系化的AI学习路径', href: '/knowledge' },
    { icon: '🎯', title: '实战案例', description: '真实项目拆解', href: '/cases' },
    { icon: '👋', title: '线下活动', description: '面对面交流', href: '/events' },
    { icon: '🤝', title: '资源对接', description: '连接对的人', href: '/resources' },
  ]

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  }

  return (
    <>
      <Head>
        <title>第二曲线 · 成都AI创客社区 - 链接技术人、产品经理、创业者</title>
        <meta name="description" content="成都AI创客的聚集地 —— 链接技术人、产品经理、创业者，一起把AI想法变成现实。提供AI知识库、实战案例、线下活动和资源对接。" />
      </Head>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="pb-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-full max-w-md relative">
              <Image
                src="/logo-full.png"
                alt="第二曲线"
                width={600}
                height={150}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
          <p className="text-lg text-gray-500 mb-6 max-w-2xl mx-auto">
            成都AI创客的聚集地 —— 链接技术人、产品经理、创业者，一起把AI想法变成现实
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => alert('💬 请关注微信公众号「第二曲线AI社区」加入我们！')}
              className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition"
            >
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
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : cases.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <p className="text-gray-600">暂无案例</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {cases.map((item) => (
                <Link key={item.id} href={`/cases/${item.id}`} className="group">
                  <div className="border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-medium text-gray-500">{item.category}</span>
                        <h3 className="text-base font-bold text-gray-900 mt-2 group-hover:text-gray-700 transition">
                          {item.title}
                        </h3>
                        <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                          {item.description || item.overview}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-400">作者：{item.author || '匿名'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Events */}
        <section className="py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">近期活动</h2>
            <Link href="/events" className="text-sm text-gray-500 hover:text-gray-900 transition">
              查看全部 →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <p className="text-gray-600">暂无活动</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-2xl p-5 flex items-center gap-5 hover:bg-gray-50 transition">
                  <div className="text-center bg-gray-100 px-4 py-2.5 rounded-xl min-w-[70px]">
                    <div className="text-xs text-gray-500">{formatDate(event.event_date).split('-')[0]}月</div>
                    <div className="text-lg font-bold text-gray-900">{formatDate(event.event_date).split('-')[1]}日</div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">📍 {event.location}</p>
                  </div>
                  <Link
                    href={`/events/${event.id}/register`}
                    className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition flex-shrink-0"
                  >
                    报名
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <section className="py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">积分排行榜</h2>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
                <span>TOP 10</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {leaderboard.map((user, index) => {
                  const rank = index + 1
                  const isTop3 = rank <= 3
                  return (
                    <Link
                      key={user.id}
                      href={`/card/${user.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 transition"
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        rank === 1 ? 'bg-yellow-400 text-white' :
                        rank === 2 ? 'bg-gray-300 text-white' :
                        rank === 3 ? 'bg-orange-300 text-white' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {rank}
                      </div>
                      <div className="flex-shrink-0">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 text-sm font-medium">
                              {user.name?.[0] || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                          {user.role === 'vip' && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">VIP</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-base font-bold text-purple-600">{user.total_points || 0}</div>
                        <div className="text-xs text-gray-500">积分</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-10 mt-8">
          <div className="bg-gray-900 rounded-3xl p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-3">
              准备好开始你的AI第二曲线了吗？
            </h2>
            <p className="text-gray-400 mb-6">
              加入500+成都AI创客，一起创造未来
            </p>
            <button
              onClick={() => alert('💬 请关注微信公众号「第二曲线AI社区」加入我们！')}
              className="bg-white text-gray-900 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition"
            >
              立即加入
            </button>
          </div>
        </section>
      </div>
    </>
  )
}
