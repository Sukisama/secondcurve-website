import { useState } from 'react'
import { useToast } from '../components/Toast'
import { uploadImage } from '../lib/upload'
import { supabase } from '../lib/supabase/client'

export default function MemberPublishModal({ user, profile, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    role: '',
    skills: '',
    looking: '',
    avatar_url: profile?.avatar_url || ''
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.role || !formData.skills) {
      toast.error('请填写完整信息')
      return
    }

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

      // 保存到数据库
      const { error } = await supabase
        .from('members')
        .insert({
          user_id: user.id,
          name: formData.name,
          role: formData.role,
          skills: formData.skills.split(',').map(s => s.trim()),
          looking: formData.looking,
          avatar: '👤',
          avatar_url: avatarUrl
        })

      if (error) throw error

      toast.success('发布成功！')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error('发布失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('图片大小不能超过5MB')
        return
      }
      setAvatarFile(file)

      // 预览
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData({ ...formData, avatar_url: e.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">发布到成员墙</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">头像</label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden">
                  {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                      👤
                    </div>
                  )}
                </div>
                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                    上传头像
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="你的姓名"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">角色/职业 *</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="例如：全栈开发者、产品经理、创业者"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">技能标签 *</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="用逗号分隔，例如：React, Node.js, UI设计"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">正在寻找</label>
              <textarea
                value={formData.looking}
                onChange={(e) => setFormData({ ...formData, looking: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="例如：寻找产品合伙人、技术交流、项目合作"
                rows={3}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '发布中...' : '发布'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}