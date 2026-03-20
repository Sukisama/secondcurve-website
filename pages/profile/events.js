import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase/client'

export default function MyEvents({ user, profile }) {
  const router = useRouter()
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/profile/events')
      return
    }

    fetchRegistrations()
  }, [user, router])

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          events (
            id,
            title,
            description,
            location,
            event_date,
            image_url,
            status,
            max_participants,
            current_participants
          )
        `)
        .eq('user_id', user.id)
        .order('registered_at', { ascending: false })

      if (error) throw error
      setRegistrations(data || [])
    } catch (error) {
      console.error('Error fetching registrations:', error)
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

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventStatusBadge = (event) => {
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
    return { text: '即将开始', class: 'bg-blue-100 text-blue-700' }
  }

  const getPaymentStatusBadge = (status) => {
    const badges = {
      pending: { text: '待支付', class: 'bg-yellow-100 text-yellow-800' },
      paid: { text: '已支付', class: 'bg-green-100 text-green-800' },
      refunded: { text: '已退款', class: 'bg-gray-100 text-gray-800' }
    }
    return badges[status] || { text: status, class: 'bg-gray-100 text-gray-800' }
  }

  if (!user || !profile) {
    return (
      <div className="min-h-[calc(100vh-3.5rem-8rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 面包屑导航 */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link href="/profile" className="hover:text-gray-900 transition">个人中心</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900">活动报名记录</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">活动报名记录</h1>
          <p className="text-sm text-gray-600 mt-1">查看您报名参加的所有活动</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无报名记录</h3>
            <p className="text-gray-600 mb-6">您还没有报名参加任何活动</p>
            <Link
              href="/events"
              className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition"
            >
              浏览活动
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* 统计信息 */}
            <div className="px-6 py-4 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{registrations.length}</div>
                  <div className="text-sm text-gray-600">报名总数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {registrations.filter(r => r.events?.status === 'upcoming').length}
                  </div>
                  <div className="text-sm text-gray-600">即将参加</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {registrations.filter(r => r.events?.status === 'ongoing').length}
                  </div>
                  <div className="text-sm text-gray-600">进行中</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">
                    {registrations.filter(r => r.events?.status === 'ended').length}
                  </div>
                  <div className="text-sm text-gray-600">已结束</div>
                </div>
              </div>
            </div>

            {/* 活动列表 */}
            {registrations.map((registration) => {
              const event = registration.events
              if (!event) return null

              const eventStatus = getEventStatusBadge(event)
              const paymentStatus = getPaymentStatusBadge(registration.payment_status)

              return (
                <div key={registration.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex flex-col md:flex-row md:items-start md:space-x-4">
                    {/* 活动图片 */}
                    {event.image_url && (
                      <div className="mb-4 md:mb-0 flex-shrink-0">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full md:w-32 h-32 object-cover rounded-xl"
                        />
                      </div>
                    )}

                    {/* 活动信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${eventStatus.class}`}>
                              {eventStatus.text}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatus.class}`}>
                              {paymentStatus.text}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <div className="text-sm font-medium text-gray-900">
                            ¥{registration.paid_amount.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{event.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(event.event_date)} {formatTime(event.event_date)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          报名时间：{formatDate(registration.registered_at)} {formatTime(registration.registered_at)}
                        </div>
                        {event.status === 'upcoming' && (
                          <div className="text-xs text-blue-600 font-medium">
                            {event.max_participants
                              ? `名额：${event.current_participants}/${event.max_participants}`
                              : '名额充足'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}