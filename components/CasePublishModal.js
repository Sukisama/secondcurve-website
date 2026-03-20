import { useState } from 'react'
import { useToast } from '../components/Toast'
import { uploadMultipleImages } from '../lib/upload'
import { supabase } from '../lib/supabase/client'
import { awardPoints } from '../lib/points'

export default function CasePublishModal({ user, profile, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    author: profile?.name || '',
    tags: ''
  })
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)

    if (files.length + imageFiles.length > 5) {
      toast.error('最多只能上传5张图片')
      return
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} 超过5MB，已跳过`)
        return false
      }
      return true
    })

    setImageFiles([...imageFiles, ...validFiles])

    // 预览
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.category || !formData.description) {
      toast.error('请填写完整信息')
      return
    }

    setLoading(true)

    try {
      let imageUrls = []
      let thumbnail = ''

      // 上传图片
      if (imageFiles.length > 0) {
        const { urls, errors } = await uploadMultipleImages(imageFiles, 'cases', 5)
        if (errors.length > 0) {
          toast.error(`${errors.length}张图片上传失败`)
        }
        imageUrls = urls
        thumbnail = urls[0] || ''
      }

      // 保存到数据库
      const { error } = await supabase
        .from('cases')
        .insert({
          author_id: user.id,
          title: formData.title,
          category: formData.category,
          description: formData.description,
          author: formData.author,
          tags: formData.tags.split(',').map(s => s.trim()).filter(s => s),
          images: imageUrls,
          thumbnail: thumbnail
        })

      if (error) throw error

      // 奖励积分
      await awardPoints(user.id, 'create_case')

      toast.success('案例发布成功！')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error('发布失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">发布实战案例</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">案例图片（最多5张）</label>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {imageFiles.length < 5 && (
                  <label className="aspect-video bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition">
                    <div className="text-center">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-xs text-gray-500">上传</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-500">支持 JPG、PNG 格式，单张不超过5MB</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">案例标题 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="例如：AI客服机器人实战"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">分类 *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              >
                <option value="">选择分类</option>
                <option value="AI应用">AI应用</option>
                <option value="产品实战">产品实战</option>
                <option value="创业经验">创业经验</option>
                <option value="技术开发">技术开发</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">案例描述 *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="详细描述你的实战经验、遇到的问题、解决方案等"
                rows={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">作者</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="你的姓名或昵称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="用逗号分隔，例如：AI, ChatGPT, 自动化"
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