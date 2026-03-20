import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase/client'
import { useEffect } from 'react'

export default function NewPost({ user, profile }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '经验分享'
  })

  useEffect(() => {
    if (!user || profile?.role === 'guest') {
      router.push('/login?redirect=/forum/new')
    }
  }, [user, profile, router])

  const categories = [
    { value: '经验分享', emoji: '💡' },
    { value: '技术交流', emoji: '⚙️' },
    { value: '资源推荐', emoji: '📚' },
    { value: '求助问答', emoji: '❓' },
    { value: '产品发布', emoji: '🚀' },
    { value: '闲聊灌水', emoji: '☕' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('请填写标题和内容')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category,
          author_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/forum/${data.id}`)
    } catch (error) {
      console.error('Error creating post:', error)
      alert('发布失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (!user || profile?.role === 'guest') {
    return (
      <div className="min-h-[calc(100vh-3.5rem-8rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">验证权限中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 返回按钮 */}
      <Link
        href="/forum"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回论坛
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">发布新话题</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 分类选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              话题分类
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`px-4 py-2 rounded-lg border transition ${
                    formData.category === cat.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {cat.emoji} {cat.value}
                </button>
              ))}
            </div>
          </div>

          {/* 标题 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              标题
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="一句话描述你的话题"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              maxLength={100}
            />
            <p className="text-sm text-gray-500 mt-1">{formData.title.length}/100</p>
          </div>

          {/* 内容 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              内容
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="详细描述你的话题内容..."
              rows={10}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition"
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
            <Link
              href="/forum"
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? '发布中...' : '发布话题'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}