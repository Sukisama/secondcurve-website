import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase/client'
import { sendMessage, searchUsers } from '../../lib/messages'
import { useToast } from '../../components/Toast'

export default function NewMessagePage() {
  const router = useRouter()
  const { to } = router.query // 从URL参数获取预填的收件人ID
  const toast = useToast()

  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const [formData, setFormData] = useState({
    receiver_id: '',
    title: '',
    content: ''
  })

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (to && currentUser) {
      // 预填收件人
      fetchPreselectedUser(to)
    }
  }, [to, currentUser])

  useEffect(() => {
    // 搜索防抖
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 0 && currentUser) {
        handleSearch()
      } else {
        setSearchResults([])
        setShowDropdown(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, currentUser])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setCurrentUser(user)
  }

  const fetchPreselectedUser = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, email')
      .eq('id', userId)
      .single()

    if (data) {
      setSelectedUser(data)
      setFormData(prev => ({ ...prev, receiver_id: userId }))
    }
  }

  const handleSearch = async () => {
    const { data, error } = await searchUsers(searchQuery, currentUser.id)
    if (error) {
      toast.error(error)
    } else {
      setSearchResults(data)
      setShowDropdown(true)
    }
  }

  const handleSelectUser = (user) => {
    setSelectedUser(user)
    setFormData(prev => ({ ...prev, receiver_id: user.id }))
    setSearchQuery('')
    setShowDropdown(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 表单验证
    if (!formData.receiver_id) {
      toast.error('请选择收件人')
      return
    }

    if (!formData.title.trim()) {
      toast.error('请输入消息标题')
      return
    }

    if (!formData.content.trim()) {
      toast.error('请输入消息内容')
      return
    }

    setLoading(true)

    const { success, error } = await sendMessage(
      currentUser.id,
      formData.receiver_id,
      formData.title.trim(),
      formData.content.trim()
    )

    setLoading(false)

    if (success) {
      toast.success('消息发送成功')
      router.push('/messages')
    } else {
      toast.error(error || '发送失败')
    }
  }

  return (
    <>
      <Head>
        <title>发送私信 - 第二曲线</title>
      </Head>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">发送私信</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* 收件人 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              收件人
            </label>
            {selectedUser ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium overflow-hidden">
                    {selectedUser.avatar_url ? (
                      <img
                        src={selectedUser.avatar_url}
                        alt={selectedUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      selectedUser.name?.charAt(0) || '?'
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedUser.name}</p>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null)
                    setFormData(prev => ({ ...prev, receiver_id: '' }))
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索用户姓名或邮箱..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {/* 搜索结果下拉 */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium overflow-hidden">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user.name?.charAt(0) || '?'
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showDropdown && searchQuery.trim().length > 0 && searchResults.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                    未找到相关用户
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 标题 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              消息标题
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="请输入消息标题"
              maxLength={200}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* 内容 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              消息内容
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="请输入消息内容..."
              rows={6}
              maxLength={5000}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {formData.content.length} / 5000
            </p>
          </div>

          {/* 按钮 */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '发送中...' : '发送'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}