import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase/client'
import { hasPermission } from '../lib/auth/permissions'
import { useToast } from '../components/Toast'

export default function Admin({ user, profile }) {
  const router = useRouter()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('cases')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    cases: [],
    profiles: [],
    events: []
  })
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // 权限检查
  useEffect(() => {
    if (!user || !profile) {
      router.replace('/login?redirect=/admin')
      return
    }

    if (!hasPermission(profile.role, 'admin')) {
      router.replace('/403')
      return
    }

    fetchData()
  }, [user, profile, router])

  // 获取数据
  const fetchData = async () => {
    try {
      setLoading(true)

      // 并行获取所有数据
      const [casesRes, profilesRes, eventsRes] = await Promise.all([
        supabase
          .from('cases')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: true })
      ])

      if (casesRes.error) throw casesRes.error
      if (profilesRes.error) throw profilesRes.error
      if (eventsRes.error) throw eventsRes.error

      setData({
        cases: casesRes.data || [],
        profiles: profilesRes.data || [],
        events: eventsRes.data || []
      })
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    try {
      setSubmitting(true)

      if (activeTab === 'cases') {
        await handleCaseSubmit()
      } else if (activeTab === 'profiles') {
        await handleProfileSubmit()
      } else if (activeTab === 'events') {
        await handleEventSubmit()
      }

      await fetchData()
      setEditingItem(null)
      setFormData({})
      toast.success(editingItem ? '更新成功' : '创建成功')
    } catch (error) {
      console.error('Error submitting:', error)
      toast.error('操作失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  // 案例提交
  const handleCaseSubmit = async () => {
    const caseData = {
      title: formData.title,
      category: formData.category,
      description: formData.description,
      author: formData.author,
      tags: formData.tags ? formData.tags.split(',').map(s => s.trim()) : [],
      overview: formData.overview,
      background: formData.background,
      solution: formData.solution,
      learnings: formData.learnings
    }

    if (editingItem) {
      const { error } = await supabase
        .from('cases')
        .update(caseData)
        .eq('id', editingItem.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('cases')
        .insert([caseData])
      if (error) throw error
    }
  }

  // 用户提交
  const handleProfileSubmit = async () => {
    const profileData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      avatar: formData.avatar
    }

    if (editingItem) {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', editingItem.id)
      if (error) throw error
    }
  }

  // 活动提交
  const handleEventSubmit = async () => {
    const eventData = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      event_date: formData.event_date,
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
      price_non_vip: formData.price_non_vip ? parseFloat(formData.price_non_vip) : 68.00,
      status: formData.status || 'upcoming'
    }

    if (editingItem) {
      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', editingItem.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('events')
        .insert([eventData])
      if (error) throw error
    }
  }

  // 删除项目
  const deleteItem = async (id) => {
    if (!confirm('确定要删除吗？此操作不可撤销。')) return

    try {
      const { error } = await supabase
        .from(activeTab)
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchData()
      toast.success('删除成功')
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('删除失败，请重试')
    }
  }

  // 编辑项目
  const editItem = (item) => {
    setEditingItem(item)
    if (activeTab === 'cases') {
      setFormData({
        title: item.title || '',
        category: item.category || '',
        description: item.description || '',
        author: item.author || '',
        tags: item.tags?.join(', ') || '',
        overview: item.overview || '',
        background: item.background || '',
        solution: item.solution || '',
        learnings: item.learnings || ''
      })
    } else if (activeTab === 'profiles') {
      setFormData({
        name: item.name || '',
        email: item.email || '',
        role: item.role || 'member',
        avatar: item.avatar || ''
      })
    } else if (activeTab === 'events') {
      setFormData({
        title: item.title || '',
        description: item.description || '',
        location: item.location || '',
        event_date: item.event_date?.split('T')[0] || '',
        max_participants: item.max_participants || '',
        price_non_vip: item.price_non_vip || 68,
        status: item.status || 'upcoming'
      })
    }
  }

  // 导出数据
  const exportData = () => {
    const exportContent = {
      cases: data.cases,
      profiles: data.profiles.map(p => ({
        ...p,
        id: undefined // 导出时移除敏感ID
      })),
      events: data.events,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportContent, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `secondcurve-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('数据导出成功')
  }

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 如果没有权限，显示加载状态
  if (!user || !profile || !hasPermission(profile.role, 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">验证权限中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>后台管理 | 第二曲线</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回链接 */}
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← 返回首页
          </Link>
        </div>

        {/* 权限提示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>管理后台</strong> · 您正在以 <span className="font-semibold">{profile?.role === 'super_admin' ? '超级管理员' : '管理员'}</span> 身份访问数据库。
          </p>
        </div>

        {/* 标题和导出按钮 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">后台管理</h1>
          <button
            onClick={exportData}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
          >
            导出数据
          </button>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {[
            { key: 'cases', label: '实战案例', count: data.cases.length },
            { key: 'profiles', label: '用户管理', count: data.profiles.length },
            { key: 'events', label: '活动管理', count: data.events.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key)
                setEditingItem(null)
                setFormData({})
              }}
              className={`pb-4 px-4 text-sm font-medium transition flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* 加载状态 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载数据中...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* 左侧表单 */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-2xl p-6 sticky top-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  {editingItem ? '编辑' : '新增'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* 案例表单 */}
                  {activeTab === 'cases' && (
                    <>
                      <input
                        type="text"
                        placeholder="标题 *"
                        value={formData.title || ''}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        required
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <input
                        type="text"
                        placeholder="分类 *"
                        value={formData.category || ''}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        required
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <textarea
                        placeholder="描述"
                        value={formData.description || ''}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        rows={2}
                      />
                      <input
                        type="text"
                        placeholder="作者"
                        value={formData.author || ''}
                        onChange={e => setFormData({ ...formData, author: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <input
                        type="text"
                        placeholder="标签（逗号分隔）"
                        value={formData.tags || ''}
                        onChange={e => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <textarea
                        placeholder="概述"
                        value={formData.overview || ''}
                        onChange={e => setFormData({ ...formData, overview: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        rows={2}
                      />
                    </>
                  )}

                  {/* 用户表单 */}
                  {activeTab === 'profiles' && (
                    <>
                      {editingItem ? (
                        <>
                          <input
                            type="text"
                            placeholder="姓名"
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          <input
                            type="email"
                            placeholder="邮箱"
                            value={formData.email || ''}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          <select
                            value={formData.role || 'member'}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            <option value="guest">访客</option>
                            <option value="member">会员</option>
                            <option value="vip">VIP会员</option>
                            <option value="admin">管理员</option>
                            <option value="super_admin">超级管理员</option>
                          </select>
                          <input
                            type="text"
                            placeholder="头像 URL"
                            value={formData.avatar || ''}
                            onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                          用户需通过注册页面创建，此处仅可编辑现有用户
                        </p>
                      )}
                    </>
                  )}

                  {/* 活动表单 */}
                  {activeTab === 'events' && (
                    <>
                      <input
                        type="text"
                        placeholder="标题 *"
                        value={formData.title || ''}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        required
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <textarea
                        placeholder="描述"
                        value={formData.description || ''}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        rows={2}
                      />
                      <input
                        type="text"
                        placeholder="地点"
                        value={formData.location || ''}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <input
                        type="date"
                        value={formData.event_date || ''}
                        onChange={e => setFormData({ ...formData, event_date: e.target.value })}
                        required
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <input
                        type="number"
                        placeholder="最大人数"
                        value={formData.max_participants || ''}
                        onChange={e => setFormData({ ...formData, max_participants: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="非VIP价格"
                        value={formData.price_non_vip || ''}
                        onChange={e => setFormData({ ...formData, price_non_vip: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <select
                        value={formData.status || 'upcoming'}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="upcoming">即将开始</option>
                        <option value="ongoing">进行中</option>
                        <option value="ended">已结束</option>
                        <option value="cancelled">已取消</option>
                      </select>
                    </>
                  )}

                  {/* 提交按钮 */}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting || (activeTab === 'profiles' && !editingItem)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? '处理中...' : (editingItem ? '保存' : '添加')}
                    </button>
                    {editingItem && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(null)
                          setFormData({})
                        }}
                        className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
                      >
                        取消
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* 右侧列表 */}
            <div className="lg:col-span-2">
              <div className="space-y-3">
                {data[activeTab]?.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <p className="text-gray-500">暂无数据</p>
                  </div>
                ) : (
                  data[activeTab]?.map(item => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-xl p-4 flex items-start justify-between hover:shadow-md transition"
                    >
                      <div className="flex-1">
                        {/* 案例列表项 */}
                        {activeTab === 'cases' && (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                {item.category}
                              </span>
                              <span className="text-xs text-gray-400">{formatDate(item.created_at)}</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                            {item.description && (
                              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            )}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.tags.map((tag, i) => (
                                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        )}

                        {/* 用户列表项 */}
                        {activeTab === 'profiles' && (
                          <>
                            <div className="flex items-center gap-3 mb-2">
                              {item.avatar ? (
                                <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full" />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-gray-600 text-sm font-medium">
                                    {item.name?.[0] || '?'}
                                  </span>
                                </div>
                              )}
                              <div>
                                <h3 className="font-bold text-gray-900">{item.name}</h3>
                                <p className="text-sm text-gray-500">{item.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                item.role === 'super_admin' ? 'bg-red-100 text-red-700' :
                                item.role === 'admin' ? 'bg-orange-100 text-orange-700' :
                                item.role === 'vip' ? 'bg-yellow-100 text-yellow-700' :
                                item.role === 'member' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {item.role === 'super_admin' ? '超级管理员' :
                                 item.role === 'admin' ? '管理员' :
                                 item.role === 'vip' ? 'VIP会员' :
                                 item.role === 'member' ? '会员' : '访客'}
                              </span>
                              {item.vip_expires_at && new Date(item.vip_expires_at) > new Date() && (
                                <span className="text-xs text-yellow-600">
                                  VIP至{formatDate(item.vip_expires_at)}
                                </span>
                              )}
                            </div>
                          </>
                        )}

                        {/* 活动列表项 */}
                        {activeTab === 'events' && (
                          <>
                            <div className="flex items-center gap-4 mb-2">
                              <div className="text-center bg-gray-100 px-3 py-2 rounded-lg min-w-[60px]">
                                <div className="text-lg font-bold text-gray-900">
                                  {new Date(item.event_date).getDate()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(item.event_date).getMonth() + 1}月
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-gray-900">{item.title}</h3>
                                {item.location && (
                                  <p className="text-sm text-gray-500">{item.location}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                item.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                item.status === 'ended' ? 'bg-gray-100 text-gray-700' :
                                item.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {item.status === 'cancelled' ? '已取消' :
                                 item.status === 'ended' ? '已结束' :
                                 item.status === 'ongoing' ? '进行中' : '报名中'}
                              </span>
                              {item.max_participants && (
                                <span className="text-xs text-gray-500">
                                  {item.current_participants || 0}/{item.max_participants} 人
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                ¥{item.price_non_vip || 68}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => editItem(item)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition"
                          title="编辑"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {activeTab !== 'profiles' && (
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition"
                            title="删除"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}