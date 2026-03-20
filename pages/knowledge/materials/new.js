import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../../../lib/supabase/client'
import { useToast } from '../../../components/Toast'
import { uploadImage } from '../../../lib/upload'

export default function NewMaterial() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const toast = useToast()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    link: '',
    is_vip_only: false
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login?redirect=/knowledge/materials/new')
        return
      }
      setUser(user)
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setProfile(data))
    })
  }, [router])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过5MB')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('请输入标题')
      return
    }

    setLoading(true)

    try {
      let coverImageUrl = null

      // 上传图片
      if (imageFile) {
        const { url, error: uploadError } = await uploadImage(imageFile, 'knowledge')
        if (uploadError) {
          toast.error('图片上传失败')
          setLoading(false)
          return
        }
        coverImageUrl = url
      }

      const { error } = await supabase
        .from('knowledge_items')
        .insert({
          type: 'learning_material',
          title: formData.title.trim(),
          description: formData.description.trim(),
          content: formData.content.trim(),
          link: formData.link.trim() || null,
          cover_image: coverImageUrl,
          is_vip_only: formData.is_vip_only,
          author_id: user.id
        })

      if (error) throw error

      toast.success('发布成功')
      router.push('/knowledge/materials')
    } catch (error) {
      console.error('Error creating material:', error)
      toast.error('发布失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>上传学习资料 - 知识库 | 第二曲线</title>
      </Head>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/knowledge/materials" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
          ← 返回学习资料
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">上传学习资料</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              标题 <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="输入资料标题"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              简介
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              placeholder="简单介绍一下这份资料"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              详细内容
            </label>
            <textarea
              id="content"
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              placeholder="详细介绍资料内容、学习路径等"
            />
          </div>

          <div>
            <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
              资料链接
            </label>
            <input
              id="link"
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="https://example.com/material"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              封面图片
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
              {imagePreview ? (
                <div className="mb-4">
                  <img src={imagePreview} alt="预览" className="max-h-48 mx-auto rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                    className="mt-2 text-sm text-red-600 hover:underline"
                  >
                    移除图片
                  </button>
                </div>
              ) : (
                <div>
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 mb-2">点击或拖拽上传封面图片</p>
                  <p className="text-sm text-gray-400">支持 JPG、PNG 格式，最大 5MB</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={{ position: 'relative' }}
              />
            </div>
          </div>

          {profile?.role === 'admin' || profile?.role === 'super_admin' ? (
            <div className="flex items-center gap-2">
              <input
                id="is_vip_only"
                type="checkbox"
                checked={formData.is_vip_only}
                onChange={(e) => setFormData({ ...formData, is_vip_only: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_vip_only" className="text-sm text-gray-700">
                设为VIP专属内容
              </label>
            </div>
          ) : null}

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? '发布中...' : '发布资料'}
            </button>
            <Link
              href="/knowledge/materials"
              className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition"
            >
              取消
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}