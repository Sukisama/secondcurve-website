import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase/client'
import { uploadImage } from '../../lib/upload'
import { useToast } from '../../components/Toast'

export default function EditProfile({ user, profile }) {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    bio: ''
  })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/profile/edit')
      return
    }

    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || ''
      })
      if (profile.avatar_url) {
        setAvatarPreview(profile.avatar_url)
      }
    }
  }, [user, profile, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }

    // 验证文件大小（最大 2MB）
    if (file.size > 2 * 1024 * 1024) {
      toast.error('图片大小不能超过 2MB')
      return
    }

    // 显示预览
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target.result)
    }
    reader.readAsDataURL(file)

    // 上传头像
    setUploadingAvatar(true)
    try {
      const { url, error } = await uploadImage(file, 'avatars')
      if (error) throw error

      // 更新用户头像
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', user.id)

      if (updateError) throw updateError

      toast.success('头像上传成功')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('头像上传失败，请重试')
      // 恢复原头像
      setAvatarPreview(profile?.avatar_url || null)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = '昵称不能为空'
    } else if (formData.name.length > 50) {
      newErrors.name = '昵称不能超过 50 个字符'
    }

    if (formData.bio && formData.bio.length > 200) {
      newErrors.bio = '个人简介不能超过 200 个字符'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name.trim(),
          bio: formData.bio.trim()
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('个人资料更新成功')
      router.push('/profile')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('更新失败，请重试')
    } finally {
      setLoading(false)
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 面包屑导航 */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link href="/profile" className="hover:text-gray-900 transition">个人中心</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900">编辑个人资料</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">编辑个人资料</h1>
          <p className="text-sm text-gray-600 mt-1">更新您的个人信息</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 头像上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">头像</label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="头像" className="w-full h-full object-cover" />
                  ) : (
                    profile.name?.charAt(0) || user.email?.charAt(0).toUpperCase()
                  )}
                </div>
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition inline-block">
                    {uploadingAvatar ? '上传中...' : '更换头像'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">支持 JPG、PNG 格式，最大 2MB</p>
              </div>
            </div>
          </div>

          {/* 昵称 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              昵称 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.name ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="请输入昵称"
              maxLength={50}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">{formData.name.length}/50</p>
          </div>

          {/* 个人简介 */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              个人简介
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none ${
                errors.bio ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="介绍一下自己吧..."
              maxLength={200}
            />
            {errors.bio && (
              <p className="text-sm text-red-600 mt-1">{errors.bio}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/200</p>
          </div>

          {/* 邮箱（只读） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">邮箱地址不可修改</p>
          </div>

          {/* 提交按钮 */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
            <Link
              href="/profile"
              className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}