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
  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    company: '',
    position: '',
    location: '',
    website: '',
    wechat: '',
    weibo: '',
    twitter: '',
    github: '',
    linkedin: '',
    skills: '',
    interests: '',
    show_on_member_wall: false,
    show_on_needs: false,
    needs: '',
    can_provide: '',
    looking_for: ''
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
        bio: profile.bio || '',
        company: profile.company || '',
        position: profile.position || '',
        location: profile.location || '',
        website: profile.website || '',
        wechat: profile.wechat || '',
        weibo: profile.weibo || '',
        twitter: profile.twitter || '',
        github: profile.github || '',
        linkedin: profile.linkedin || '',
        skills: profile.skills?.join(', ') || '',
        interests: profile.interests?.join(', ') || '',
        show_on_member_wall: profile.show_on_member_wall || false,
        show_on_needs: profile.show_on_needs || false,
        needs: profile.needs || '',
        can_provide: profile.can_provide || '',
        looking_for: profile.looking_for || ''
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
          bio: formData.bio.trim(),
          company: formData.company.trim(),
          position: formData.position.trim(),
          location: formData.location.trim(),
          website: formData.website.trim(),
          wechat: formData.wechat.trim(),
          weibo: formData.weibo.trim(),
          twitter: formData.twitter.trim(),
          github: formData.github.trim(),
          linkedin: formData.linkedin.trim(),
          skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
          interests: formData.interests.split(',').map(s => s.trim()).filter(s => s),
          show_on_member_wall: formData.show_on_member_wall,
          show_on_needs: formData.show_on_needs,
          needs: formData.needs.trim(),
          can_provide: formData.can_provide.trim(),
          looking_for: formData.looking_for.trim()
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
    <div className="max-w-4xl mx-auto px-4 py-8">
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
          <p className="text-sm text-gray-600 mt-1">完善您的个人资料和名片信息</p>
        </div>

        {/* 标签页 */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'basic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              基本信息
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'social'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              社交链接
            </button>
            <button
              onClick={() => setActiveTab('display')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'display'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              展示设置
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* 基本信息标签页 */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
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
                  rows={3}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none ${
                    errors.bio ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="一句话介绍自己..."
                  maxLength={200}
                />
                {errors.bio && (
                  <p className="text-sm text-red-600 mt-1">{errors.bio}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/200</p>
              </div>

              {/* 公司和职位 */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    公司
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="公司名称"
                  />
                </div>
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                    职位
                  </label>
                  <input
                    id="position"
                    name="position"
                    type="text"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="职位名称"
                  />
                </div>
              </div>

              {/* 所在城市 */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  所在城市
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="例如：成都"
                />
              </div>

              {/* 技能标签 */}
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                  技能标签
                </label>
                <input
                  id="skills"
                  name="skills"
                  type="text"
                  value={formData.skills}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="用逗号分隔，例如：React, Node.js, UI设计"
                />
              </div>

              {/* 兴趣爱好 */}
              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
                  兴趣爱好
                </label>
                <input
                  id="interests"
                  name="interests"
                  type="text"
                  value={formData.interests}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="用逗号分隔，例如：AI, 创业, 阅读"
                />
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
            </div>
          )}

          {/* 社交链接标签页 */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="wechat" className="block text-sm font-medium text-gray-700 mb-1">
                    微信
                  </label>
                  <input
                    id="wechat"
                    name="wechat"
                    type="text"
                    value={formData.wechat}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="微信号"
                  />
                </div>
                <div>
                  <label htmlFor="weibo" className="block text-sm font-medium text-gray-700 mb-1">
                    微博
                  </label>
                  <input
                    id="weibo"
                    name="weibo"
                    type="text"
                    value={formData.weibo}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="微博ID"
                  />
                </div>
                <div>
                  <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1">
                    GitHub
                  </label>
                  <input
                    id="github"
                    name="github"
                    type="text"
                    value={formData.github}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="GitHub用户名"
                  />
                </div>
                <div>
                  <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                    Twitter
                  </label>
                  <input
                    id="twitter"
                    name="twitter"
                    type="text"
                    value={formData.twitter}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Twitter用户名"
                  />
                </div>
                <div>
                  <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn
                  </label>
                  <input
                    id="linkedin"
                    name="linkedin"
                    type="text"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="LinkedIn链接"
                  />
                </div>
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    个人网站
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 展示设置标签页 */}
          {activeTab === 'display' && (
            <div className="space-y-6">
              {/* 成员墙展示 */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="show_on_member_wall"
                  checked={formData.show_on_member_wall}
                  onChange={(e) => setFormData({ ...formData, show_on_member_wall: e.target.checked })}
                  className="mt-1 w-4 h-4"
                />
                <div>
                  <label htmlFor="show_on_member_wall" className="font-medium text-gray-900 cursor-pointer">
                    在成员墙展示我的名片
                  </label>
                  <p className="text-sm text-gray-500 mt-1">勾选后，您的名片将展示在资源对接的成员墙页面</p>
                </div>
              </div>

              {/* 需求广场展示 */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="show_on_needs"
                  checked={formData.show_on_needs}
                  onChange={(e) => setFormData({ ...formData, show_on_needs: e.target.checked })}
                  className="mt-1 w-4 h-4"
                />
                <div>
                  <label htmlFor="show_on_needs" className="font-medium text-gray-900 cursor-pointer">
                    在需求广场展示我的需求
                  </label>
                  <p className="text-sm text-gray-500 mt-1">勾选后，您的需求信息将展示在资源对接的需求广场页面</p>
                </div>
              </div>

              {/* 需求信息 */}
              {formData.show_on_needs && (
                <div className="space-y-4 pl-7 border-l-2 border-gray-200 ml-2">
                  <div>
                    <label htmlFor="needs" className="block text-sm font-medium text-gray-700 mb-1">
                      我需要的帮助
                    </label>
                    <textarea
                      id="needs"
                      name="needs"
                      value={formData.needs}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                      placeholder="描述您需要的帮助或资源..."
                    />
                  </div>

                  <div>
                    <label htmlFor="can_provide" className="block text-sm font-medium text-gray-700 mb-1">
                      我可以提供的帮助
                    </label>
                    <textarea
                      id="can_provide"
                      name="can_provide"
                      value={formData.can_provide}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                      placeholder="描述您可以提供的帮助或资源..."
                    />
                  </div>

                  <div>
                    <label htmlFor="looking_for" className="block text-sm font-medium text-gray-700 mb-1">
                      正在寻找
                    </label>
                    <textarea
                      id="looking_for"
                      name="looking_for"
                      value={formData.looking_for}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                      placeholder="例如：寻找技术合伙人、寻找投资机会..."
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 提交按钮 */}
          <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-100">
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