import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase/client'
import { hasPermission } from '../../lib/auth/permissions'
import { useToast } from '../../components/Toast'

export default function AdminKnowledge({ user, profile }) {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [filterType, setFilterType] = useState('all')

  // 权限检查
  useEffect(() => {
    if (!user || !profile) {
      router.replace('/login?redirect=/admin/knowledge')
      return
    }

    if (!hasPermission(profile.role, 'admin')) {
      router.replace('/403')
      return
    }

    fetchItems()
  }, [user, profile, router])

  // 获取知识库内容
  const fetchItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('knowledge_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching items:', error)
      toast.error('加载知识库内容失败')
    } finally {
      setLoading(false)
    }
  }

  // 开始编辑
  const startEdit = (item) => {
    setEditingId(item.id)
    setFormData({
      type: item.type,
      title: item.title,
      description: item.description || '',
      content: item.content || '',
      link: item.link || '',
      is_vip_only: item.is_vip_only
    })
    setShowAddForm(false)
  }

  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null)
    setFormData({})
  }

  // 保存编辑
  const handleUpdate = async (e) => {
    e.preventDefault()
    if (submitting) return

    try {
      setSubmitting(true)
      const { error } = await supabase
        .from('knowledge_items')
        .update(formData)
        .eq('id', editingId)

      if (error) throw error

      toast.success('更新成功')
      await fetchItems()
      cancelEdit()
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error('更新失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 显示添加表单
  const showAddNew = () => {
    setShowAddForm(true)
    setEditingId(null)
    setFormData({
      type: 'learning_material',
      title: '',
      description: '',
      content: '',
      link: '',
      is_vip_only: false
    })
  }

  // 添加新内容
  const handleAdd = async (e) => {
    e.preventDefault()
    if (submitting) return

    try {
      setSubmitting(true)
      const { error } = await supabase
        .from('knowledge_items')
        .insert([formData])

      if (error) throw error

      toast.success('添加成功')
      await fetchItems()
      setShowAddForm(false)
      setFormData({})
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('添加失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 删除内容
  const handleDelete = async (id, title) => {
    if (!confirm(`确定要删除"${title}"吗？此操作不可撤销。`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('knowledge_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('删除成功')
      await fetchItems()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('删除失败')
    }
  }

  // 切换VIP状态
  const toggleVip = async (item) => {
    try {
      const { error } = await supabase
        .from('knowledge_items')
        .update({ is_vip_only: !item.is_vip_only })
        .eq('id', item.id)

      if (error) throw error

      toast.success(item.is_vip_only ? '已设为公开' : '已设为VIP专属')
      await fetchItems()
    } catch (error) {
      console.error('Error toggling VIP:', error)
      toast.error('操作失败')
    }
  }

  // 获取类型名称
  const getTypeName = (type) => {
    const types = {
      learning_material: '学习资料',
      tool: '工具',
      topic_series: '专题系列'
    }
    return types[type] || type
  }

  // 获取类型颜色
  const getTypeColor = (type) => {
    const colors = {
      learning_material: 'bg-blue-100 text-blue-700',
      tool: 'bg-purple-100 text-purple-700',
      topic_series: 'bg-green-100 text-green-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  // 过滤内容
  const filteredItems = filterType === 'all'
    ? items
    : items.filter(item => item.type === filterType)

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
        <title>知识库管理 | 后台管理 | 第二曲线</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回链接 */}
        <div className="mb-6">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">
            ← 返回后台管理
          </Link>
        </div>

        {/* 标题和操作 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">知识库管理</h1>
            <p className="text-sm text-gray-500 mt-1">管理学习资料、工具和专题系列</p>
          </div>
          <button
            onClick={showAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            添加内容
          </button>
        </div>

        {/* 过滤器 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全部 ({items.length})
          </button>
          <button
            onClick={() => setFilterType('learning_material')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === 'learning_material'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            学习资料
          </button>
          <button
            onClick={() => setFilterType('tool')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === 'tool'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            工具
          </button>
          <button
            onClick={() => setFilterType('topic_series')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === 'topic_series'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            专题系列
          </button>
        </div>

        {/* 添加表单 */}
        {showAddForm && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">添加新内容</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    类型 *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="learning_material">学习资料</option>
                    <option value="tool">工具</option>
                    <option value="topic_series">专题系列</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    标题 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例如: ChatGPT 使用指南"
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="简短描述..."
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  内容 {formData.type === 'tool' ? '' : '*'}
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={formData.type === 'tool' ? '工具介绍...' : 'Markdown 格式的详细内容...'}
                  rows={formData.type === 'tool' ? 3 : 8}
                  required={formData.type !== 'tool'}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-sm"
                />
                {formData.type === 'topic_series' && (
                  <p className="text-xs text-gray-500 mt-1">支持 Markdown 格式</p>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    链接 {formData.type === 'tool' ? '*' : ''}
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://..."
                    required={formData.type === 'tool'}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    访问权限
                  </label>
                  <select
                    value={formData.is_vip_only ? 'vip' : 'public'}
                    onChange={(e) => setFormData({ ...formData, is_vip_only: e.target.value === 'vip' })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="public">公开</option>
                    <option value="vip">VIP专属</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? '添加中...' : '添加'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 加载状态 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : (
          <>
            {/* 内容列表 */}
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <p className="text-gray-500">暂无内容</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-2xl p-6"
                  >
                    {editingId === item.id ? (
                      // 编辑表单
                      <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              类型
                            </label>
                            <select
                              value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                              required
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                              <option value="learning_material">学习资料</option>
                              <option value="tool">工具</option>
                              <option value="topic_series">专题系列</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              标题
                            </label>
                            <input
                              type="text"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              required
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            描述
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            内容
                          </label>
                          <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={formData.type === 'tool' ? 3 : 8}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-sm"
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              链接
                            </label>
                            <input
                              type="url"
                              value={formData.link}
                              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              访问权限
                            </label>
                            <select
                              value={formData.is_vip_only ? 'vip' : 'public'}
                              onChange={(e) => setFormData({ ...formData, is_vip_only: e.target.value === 'vip' })}
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                              <option value="public">公开</option>
                              <option value="vip">VIP专属</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
                          >
                            {submitting ? '保存中...' : '保存'}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="px-6 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
                          >
                            取消
                          </button>
                        </div>
                      </form>
                    ) : (
                      // 显示模式
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(item.type)}`}>
                              {getTypeName(item.type)}
                            </span>
                            {item.is_vip_only && (
                              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                VIP专属
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          )}
                          <div className="text-xs text-gray-400">
                            创建于 {new Date(item.created_at).toLocaleDateString('zh-CN')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => toggleVip(item)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                              item.is_vip_only
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {item.is_vip_only ? '设为公开' : '设为VIP'}
                          </button>
                          <button
                            onClick={() => startEdit(item)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition"
                            title="编辑"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            className="p-2 text-gray-400 hover:text-red-600 transition"
                            title="删除"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}