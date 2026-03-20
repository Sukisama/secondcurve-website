import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getUserPointRecords } from '../lib/points'
import { supabase } from '../lib/supabase/client'

export default function Profile({ user, profile }) {
  const router = useRouter()
  const [pointRecords, setPointRecords] = useState([])
  const [loadingRecords, setLoadingRecords] = useState(true)
  const [stats, setStats] = useState({
    posts: 0,
    cases: 0,
    events: 0
  })

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/profile')
    } else if (profile) {
      fetchPointRecords()
      fetchStats()
    }
  }, [user, profile, router])

  const fetchPointRecords = async () => {
    setLoadingRecords(true)
    const { data } = await getUserPointRecords(profile.id, 10)
    setPointRecords(data || [])
    setLoadingRecords(false)
  }

  const fetchStats = async () => {
    try {
      // 统计帖子数量
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', profile.id)

      // 统计案例数量
      const { count: casesCount } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', profile.id)

      // 统计参与的活动数量
      const { count: eventsCount } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)

      setStats({
        posts: postsCount || 0,
        cases: casesCount || 0,
        events: eventsCount || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
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

  const getRoleText = (role) => {
    const roles = {
      guest: '访客',
      member: '普通会员',
      vip: 'VIP会员',
      admin: '管理员',
      super_admin: '超级管理员'
    }
    return roles[role] || role
  }

  const getRoleBadge = (role) => {
    const badges = {
      vip: { text: 'VIP', class: 'bg-yellow-100 text-yellow-800' },
      admin: { text: '管理员', class: 'bg-blue-100 text-blue-800' },
      super_admin: { text: '超管', class: 'bg-purple-100 text-purple-800' }
    }
    return badges[role] || null
  }

  const isVIP = profile.role === 'vip' && profile.vip_expires_at && new Date(profile.vip_expires_at) > new Date()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">个人中心</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* 用户信息卡片 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold">
              {profile.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-1">
                <h2 className="text-2xl font-bold">{profile.name || '未设置昵称'}</h2>
                {getRoleBadge(profile.role) && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadge(profile.role).class} text-white`}>
                    {getRoleBadge(profile.role).text}
                  </span>
                )}
              </div>
              <p className="text-white/80">{user.email}</p>
              <div className="flex items-center space-x-3 mt-1">
                {profile.member_code && (
                  <span className="text-sm text-white/60">
                    成员编号：{profile.member_code}
                  </span>
                )}
                <span className="text-sm text-white/60">
                  加入时间：{new Date(profile.created_at).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 积分展示 */}
        <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">我的积分</h3>
                <p className="text-sm text-gray-600">参与社区活动获取积分</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">{profile.total_points || 0}</div>
              <div className="text-sm text-gray-500">总积分</div>
            </div>
          </div>
        </div>

        {/* 积分记录 */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">积分记录</h3>
            <Link href="/profile/points" className="text-sm text-purple-600 hover:text-purple-700">
              查看全部 →
            </Link>
          </div>
          {loadingRecords ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : pointRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>暂无积分记录</p>
              <p className="text-sm mt-2">参与社区活动开始获取积分吧！</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pointRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{record.action_name}</span>
                      {record.description && (
                        <span className="text-xs text-gray-500">· {record.description}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(record.created_at).toLocaleDateString('zh-CN', {
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className={`font-bold ${record.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {record.points > 0 ? '+' : ''}{record.points}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 会员状态 */}
        {profile.role !== 'vip' && (
          <div className="px-6 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">升级VIP会员</h3>
                <p className="text-sm text-gray-600">年费188元，无限次参加线下活动</p>
              </div>
              <Link
                href="/vip"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2.5 rounded-xl font-medium hover:from-yellow-500 hover:to-orange-600 transition"
              >
                立即开通
              </Link>
            </div>
          </div>
        )}

        {isVIP && (
          <div className="px-6 py-6 border-b border-gray-100 bg-yellow-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">VIP会员</h3>
                  <p className="text-sm text-gray-600">
                    有效期至：{new Date(profile.vip_expires_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
              <Link
                href="/vip/renew"
                className="text-yellow-600 hover:text-yellow-700 font-medium"
              >
                续费
              </Link>
            </div>
          </div>
        )}

        {/* 统计信息 */}
        <div className="px-6 py-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">我的贡献</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-900">{stats.cases}</div>
              <div className="text-sm text-gray-600">发布案例</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-900">{stats.posts}</div>
              <div className="text-sm text-gray-600">发布帖子</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-900">{stats.events}</div>
              <div className="text-sm text-gray-600">参与活动</div>
            </div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="px-6 py-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h3>
          <div className="space-y-2">
            <Link
              href="/profile/edit"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition"
            >
              <span className="text-gray-700">编辑个人资料和名片</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/profile/likes-favorites"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition"
            >
              <span className="text-gray-700">我的点赞和收藏</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/profile/password"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition"
            >
              <span className="text-gray-700">修改密码</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/profile/transactions"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition"
            >
              <span className="text-gray-700">充值记录</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/profile/events"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition"
            >
              <span className="text-gray-700">活动报名记录</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}