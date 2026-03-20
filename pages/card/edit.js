import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase/client'
import { useToast } from '../../components/Toast'
import { uploadImage } from '../../lib/upload'

export default function EditCard({ user, profile }) {
  const router = useRouter()
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
    looking_for: '',
    avatar_url: ''
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/card/edit')
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
        looking_for: profile.looking_for || '',
        avatar_url: profile.avatar_url || ''
      })
    }
  }, [user, profile, router])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('图片大小不能超过2MB')
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData({ ...formData, avatar_url: e.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let avatarUrl = formData.avatar_url

      // 上传头像
      if (avatarFile) {
        const { url, error } = await uploadImage(avatarFile, 'avatars')
        if (error) {
          toast.error('头像上传失败')
          setLoading(false)
          return
        }
        avatarUrl = url
      }

      // 更新 profile
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          bio: formData.bio,
          company: formData.company,
          position: formData.position,
          location: formData.location,
          website: formData.website,
          wechat: formData.wechat,
          weibo: profile.weibo,
          twitter: formData.twitter,
          github: formData.github,
          linkedin: formData.linkedin,
          skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
          interests: formData.interests.split(',').map(s => s.trim()).filter(s => s),
          show_on_member_wall: formData.show_on_member_wall,
          show_on_needs: formData.show_on_needs,
          needs: formData.needs,
          can_provide: formData.can_provide,
          looking_for: formData.looking_for,
          avatar_url: avatarUrl
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('名片保存成功！')
      router.push('/card')
    } catch (error) {
      toast.error('保存失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (!user || !profile) {
    return (
      <div className="min-h-[calc(100vh-3.5rem-8rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>编辑名片 - 第二曲线</title>
      </Head>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/card" className="text-sm text-gray-500 hover:text-gray-700">
            ← 返回我的名片
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">编辑名片</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本信息 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">基本信息</h2>

            <div className="space-y-4">
              {/* 头像 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">头像</label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden">
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">👤</div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                      上传头像
                    </span>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* 姓名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  required
                />
              </div>

              {/* 个人简介 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">个人简介</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  rows={3}
                  placeholder="一句话介绍自己..."
                />
              </div>

              {/* 公司和职位 */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">公司</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">职位</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
              </div>

              {/* 地点 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">所在城市</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="例如：成都"
                />
              </div>
            </div>
          </div>

          {/* 技能和兴趣 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">技能和兴趣</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">技能标签</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="用逗号分隔，例如：React, Node.js, UI设计"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">兴趣爱好</label>
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="用逗号分隔，例如：AI, 创业, 阅读"
                />
              </div>
            </div>
          </div>

          {/* 社交链接 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">社交链接</h2>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">微信</label>
                  <input
                    type="text"
                    value={formData.wechat}
                    onChange={(e) => setFormData({ ...formData, wechat: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    placeholder="微信号"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">微博</label>
                  <input
                    type="text"
                    value={formData.weibo}
                    onChange={(e) => setFormData({ ...formData, weibo: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    placeholder="微博ID"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                  <input
                    type="text"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    placeholder="GitHub用户名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                  <input
                    type="text"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    placeholder="Twitter用户名"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    placeholder="LinkedIn链接"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">个人网站</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 展示设置 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">展示设置</h2>

            <div className="space-y-6">
              {/* 成员墙展示 */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="show_on_member_wall"
                  checked={formData.show_on_member_wall}
                  onChange={(e) => setFormData({ ...formData, show_on_member_wall: e.target.checked })}
                  className="mt-1"
                />
                <div>
                  <label htmlFor="show_on_member_wall" className="font-medium text-gray-900">
                    在成员墙展示我的名片
                  </label>
                  <p className="text-sm text-gray-500">勾选后，您的名片将展示在资源对接的成员墙页面</p>
                </div>
              </div>

              {/* 需求广场展示 */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="show_on_needs"
                  checked={formData.show_on_needs}
                  onChange={(e) => setFormData({ ...formData, show_on_needs: e.target.checked })}
                  className="mt-1"
                />
                <div>
                  <label htmlFor="show_on_needs" className="font-medium text-gray-900">
                    在需求广场展示我的需求
                  </label>
                  <p className="text-sm text-gray-500">勾选后，您的需求信息将展示在资源对接的需求广场页面</p>
                </div>
              </div>

              {/* 需求信息 */}
              {formData.show_on_needs && (
                <div className="space-y-4 pl-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">我需要的帮助</label>
                    <textarea
                      value={formData.needs}
                      onChange={(e) => setFormData({ ...formData, needs: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      rows={3}
                      placeholder="描述您需要的帮助或资源..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">我可以提供的帮助</label>
                    <textarea
                      value={formData.can_provide}
                      onChange={(e) => setFormData({ ...formData, can_provide: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      rows={3}
                      placeholder="描述您可以提供的帮助或资源..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">正在寻找</label>
                    <textarea
                      value={formData.looking_for}
                      onChange={(e) => setFormData({ ...formData, looking_for: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      rows={2}
                      placeholder="例如：寻找技术合伙人、寻找投资机会..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '保存中...' : '保存名片'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/card')}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </>
  )
}