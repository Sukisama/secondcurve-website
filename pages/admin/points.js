import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase/client'
import { hasPermission } from '../../lib/auth/permissions'
import { useToast } from '../../components/Toast'
import {
  getPointSettings,
  updatePointSetting,
  createPointSetting,
  deletePointSetting
} from '../../lib/points'

export default function AdminPoints({ user, profile }) {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 权限检查
  useEffect(() => {
    if (!user || !profile) {
      router.replace('/login?redirect=/admin/points')
      return
    }

    if (!hasPermission(profile.role, 'admin')) {
      router.replace('/403')
      return
    }

    fetchSettings()
  }, [user, profile, router])

  // 获取积分设置
  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await getPointSettings()

      if (error) {
        toast.error(error)
      } else {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('加载积分设置失败')
    } finally {
      setLoading(false)
    }
  }

  // 开始编辑
  const startEdit = (setting) => {
    setEditingId(setting.id)
    setFormData({
      action_key: setting.action_key,
      action_name: setting.action_name,
      points: setting.points,
      description: setting.description || '',
      is_active: setting.is_active
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
      const { success, error } = await updatePointSetting(editingId, formData)

      if (error) {
        toast.error(error)
      } else {
        toast.success('更新成功')
        await fetchSettings()
        cancelEdit()
      }
    } catch (error) {
      console.error('Error updating setting:', error)
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
      action_key: '',
      action_name: '',
      points: 0,
      description: '',
      is_active: true
    })
  }

  // 添加新规则
  const handleAdd = async (e) => {
    e.preventDefault()
    if (submitting) return

    try {
      setSubmitting(true)
      const { success, error } = await createPointSetting(formData)

      if (error) {
        toast.error(error)
      } else {
        toast.success('添加成功')
        await fetchSettings()
        setShowAddForm(false)
        setFormData({})
      }
    } catch (error) {
      console.error('Error adding setting:', error)
      toast.error('添加失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 删除规则
  const handleDelete = async (id, actionName) => {
    if (!confirm(`确定要删除"${actionName}"规则吗？此操作不可撤销。`)) {
      return
    }

    try {
      const { success, error } = await deletePointSetting(id)

      if (error) {
        toast.error(error)
      } else {
        toast.success('删除成功')
        await fetchSettings()
      }
    } catch (error) {
      console.error('Error deleting setting:', error)
      toast.error('删除失败')
    }
  }

  // 切换启用状态
  const toggleActive = async (setting) => {
    try {
      const { success, error } = await updatePointSetting(setting.id, {
        is_active: !setting.is_active
      })

      if (error) {
        toast.error(error)
      } else {
        toast.success(setting.is_active ? '已禁用' : '已启用')
        await fetchSettings()
      }
    } catch (error) {
      console.error('Error toggling setting:', error)
      toast.error('操作失败')
    }
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
        <title>积分设置 | 后台管理 | 第二曲线</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回链接 */}
        <div className="mb-6">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">
            ← 返回后台管理
          </Link>
        </div>

        {/* 标题 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">积分设置</h1>
            <p className="text-sm text-gray-500 mt-1">管理各项操作的积分奖励规则</p>
          </div>
          <button
            onClick={showAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            添加规则
          </button>
        </div>

        {/* 说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">积分规则说明</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 积分可用于激励用户活跃度和贡献度</li>
            <li>• 正数表示奖励积分，负数表示扣除积分</li>
            <li>• 禁用规则后，该操作将不再自动奖励积分</li>
            <li>• 删除规则需谨慎，建议禁用而非删除</li>
          </ul>
        </div>

        {/* 添加表单 */}
        {showAddForm && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">添加新规则</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    操作键 *
                  </label>
                  <input
                    type="text"
                    value={formData.action_key}
                    onChange={(e) => setFormData({ ...formData, action_key: e.target.value })}
                    placeholder="例如: create_post"
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    操作名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.action_name}
                    onChange={(e) => setFormData({ ...formData, action_name: e.target.value })}
                    placeholder="例如: 发布帖子"
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    积分值 *
                  </label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    是否启用
                  </label>
                  <select
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="true">启用</option>
                    <option value="false">禁用</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述说明
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="积分规则的详细说明"
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
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
            {/* 积分规则列表 */}
            {settings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <p className="text-gray-500">暂无积分规则</p>
              </div>
            ) : (
              <div className="space-y-4">
                {settings.map((setting) => (
                  <div
                    key={setting.id}
                    className={`bg-white border rounded-2xl p-6 ${
                      setting.is_active ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    {editingId === setting.id ? (
                      // 编辑表单
                      <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              操作键
                            </label>
                            <input
                              type="text"
                              value={formData.action_key}
                              onChange={(e) => setFormData({ ...formData, action_key: e.target.value })}
                              required
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              操作名称
                            </label>
                            <input
                              type="text"
                              value={formData.action_name}
                              onChange={(e) => setFormData({ ...formData, action_name: e.target.value })}
                              required
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              积分值
                            </label>
                            <input
                              type="number"
                              value={formData.points}
                              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                              required
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              是否启用
                            </label>
                            <select
                              value={formData.is_active ? 'true' : 'false'}
                              onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                              <option value="true">启用</option>
                              <option value="false">禁用</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            描述说明
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
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
                            <h3 className="text-lg font-bold text-gray-900">
                              {setting.action_name}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              setting.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {setting.is_active ? '已启用' : '已禁用'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <span className="bg-gray-100 px-2 py-1 rounded">{setting.action_key}</span>
                            <span className={setting.points > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                              {setting.points > 0 ? '+' : ''}{setting.points} 积分
                            </span>
                          </div>
                          {setting.description && (
                            <p className="text-sm text-gray-500">{setting.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => toggleActive(setting)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                              setting.is_active
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {setting.is_active ? '禁用' : '启用'}
                          </button>
                          <button
                            onClick={() => startEdit(setting)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition"
                            title="编辑"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(setting.id, setting.action_name)}
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