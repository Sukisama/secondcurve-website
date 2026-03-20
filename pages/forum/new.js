import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase/client'
import { useEffect } from 'react'
import { awardPoints } from '../../lib/points'
import { uploadImage } from '../../lib/upload'

export default function NewPost({ user, profile }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('请填写标题和内容')
      return
    }

    setLoading(true)
    try {
      let imageUrl = null

      // 上传图片（如果有）
      if (imageFile) {
        const { url, error: uploadError } = await uploadImage(imageFile, 'posts')
        if (uploadError) {
          console.error('Error uploading image:', uploadError)
          alert('图片上传失败，请重试')
          setLoading(false)
          return
        }
        imageUrl = url
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category,
          author_id: user.id,
          image_url: imageUrl
        })
        .select()
        .single()

      if (error) throw error

      // 奖励积分
      await awardPoints(user.id, 'create_post')

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
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">发布新话题</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* 分类选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              话题分类
            </label>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`px-4 py-3 sm:py-2 rounded-lg border transition min-h-[48px] sm:min-h-0 text-sm sm:text-base ${
                    formData.category === cat.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 active:bg-gray-100'
                  }`}
                >
                  {cat.emoji} {cat.value}
                </button>
              ))}
            </div>
          </div>

          {/* 图片上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              封面图片（可选）
            </label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="预览" className="w-full sm:w-64 h-40 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="block w-full sm:w-64 h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition active:bg-gray-50">
                <div className="flex flex-col items-center justify-center h-full px-4">
                  <svg className="w-12 h-12 sm:w-10 sm:h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-500">点击上传图片</span>
                  <span className="text-xs text-gray-400 mt-1">最多5MB</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-base"
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition text-base"
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-100">
            <Link
              href="/forum"
              className="px-5 py-3 sm:py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition text-center min-h-[48px] sm:min-h-0 flex items-center justify-center"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
              className="bg-gray-900 text-white px-5 py-3 sm:py-2.5 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition min-h-[48px] sm:min-h-0"
            >
              {loading ? '发布中...' : '发布话题'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}