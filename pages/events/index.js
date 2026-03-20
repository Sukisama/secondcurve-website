import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { supabase } from '../../lib/supabase/client'
import Pagination from '../../components/Pagination'
import { EventSkeleton } from '../../components/Skeleton'

export default function Events({ user, profile }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalEvents, setTotalEvents] = useState(0)
  const pageSize = 10

  useEffect(() => {
    fetchEvents()
  }, [currentPage])

  const fetchEvents = async () => {
    try {
      setLoading(true)

      // 获取总数
      const { count } = await supabase
        .from('events')
        .select('id', { count: 'exact', head: true })

      setTotalEvents(count || 0)

      // 获取分页数据
      const from = (currentPage - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })
        .range(from, to)

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const getStatusBadge = (event) => {
    const now = new Date()
    const eventDate = new Date(event.event_date)

    if (event.status === 'cancelled') {
      return { text: '已取消', class: 'bg-red-100 text-red-700' }
    }
    if (event.status === 'ended') {
      return { text: '已结束', class: 'bg-gray-100 text-gray-700' }
    }
    if (event.status === 'ongoing') {
      return { text: '进行中', class: 'bg-green-100 text-green-700' }
    }
    if (event.max_participants && event.current_participants >= event.max_participants) {
      return { text: '已满员', class: 'bg-yellow-100 text-yellow-700' }
    }
    return { text: '报名中', class: 'bg-blue-100 text-blue-700' }
  }

  const isVIP = profile?.role === 'vip' && profile?.vip_expires_at && new Date(profile.vip_expires_at) > new Date()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">线下活动</h1>
        <p className="text-gray-600">参加社区活动，与志同道合的朋友面对面交流</p>
      </div>

      {/* VIP 提示 */}
      {!isVIP && (
        <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">升级VIP会员</h3>
                <p className="text-sm text-gray-600">年费188元，无限次免费参加所有线下活动</p>
              </div>
            </div>
            <Link
              href="/vip"
              className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2.5 rounded-xl font-medium transition"
            >
              立即开通
            </Link>
          </div>
        </div>
      )}

      {/* 活动列表 */}
      {loading ? (
        <div className="grid gap-6">
          <EventSkeleton count={3} />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无活动</h3>
          <p className="text-gray-600">敬请期待即将举办的线下活动！</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => {
            const status = getStatusBadge(event)
            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.class}`}>
                          {status.text}
                        </span>
                        {isVIP && event.status === 'upcoming' && (
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            VIP免费
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h2>
                      <p className="text-gray-600 line-clamp-2">{event.description}</p>
                    </div>
                    {event.image_url && (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-32 h-32 object-cover rounded-xl ml-4"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">{formatDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm">
                        {event.current_participants || 0}
                        {event.max_participants && ` / ${event.max_participants}`} 人
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">
                        {isVIP ? 'VIP免费' : `¥${event.price_non_vip || 68}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-gray-500">
                      {event.status === 'upcoming' && !event.max_participants && '名额充足，欢迎报名'}
                      {event.status === 'upcoming' && event.max_participants && `剩余 ${event.max_participants - (event.current_participants || 0)} 个名额`}
                    </p>
                    {event.status === 'upcoming' && (
                      event.mini_program_link ? (
                        <a
                          href={event.mini_program_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-900 text-white px-6 py-2 rounded-xl font-medium hover:bg-gray-800 transition"
                        >
                          前往小程序报名
                        </a>
                      ) : (
                        <button
                          onClick={() => alert('报名功能即将上线，请关注公众号获取最新活动信息')}
                          className="bg-gray-900 text-white px-6 py-2 rounded-xl font-medium hover:bg-gray-800 transition"
                        >
                          立即报名
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 分页 */}
      {!loading && events.length > 0 && (
        <Pagination
          total={totalEvents}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}