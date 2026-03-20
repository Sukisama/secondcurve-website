import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase/client'
import { getMessages, deleteMessage, markMessageAsRead, markAllMessagesAsRead } from '../../lib/messages'
import { useToast } from '../../components/Toast'

export default function MessagesPage() {
  const router = useRouter()
  const { user } = router.query
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const toast = useToast()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchMessages()
    }
  }, [currentUser])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setCurrentUser(user)
  }

  const fetchMessages = async () => {
    setLoading(true)
    const { data, error } = await getMessages(currentUser.id)
    if (error) {
      toast.error(error)
    } else {
      setMessages(data)
    }
    setLoading(false)
  }

  const handleDelete = async (messageId) => {
    if (!confirm('确定要删除这条消息吗？')) return

    const { success, error } = await deleteMessage(messageId, currentUser.id)
    if (success) {
      toast.success('消息已删除')
      fetchMessages()
    } else {
      toast.error(error || '删除失败')
    }
  }

  const handleMarkAsRead = async (messageId) => {
    const { success, error } = await markMessageAsRead(messageId, currentUser.id)
    if (success) {
      fetchMessages()
    } else {
      toast.error(error || '标记失败')
    }
  }

  const handleMarkAllAsRead = async () => {
    const { success, error } = await markAllMessagesAsRead(currentUser.id)
    if (success) {
      toast.success('已全部标记为已读')
      fetchMessages()
    } else {
      toast.error(error || '标记失败')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN')
  }

  const unreadCount = messages.filter(m => !m.is_read).length

  if (loading) {
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
    <>
      <Head>
        <title>站内信 - 第二曲线</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">站内信</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {unreadCount} 条未读消息
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                全部标为已读
              </button>
            )}
            <Link
              href="/messages/new"
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition"
            >
              发送私信
            </Link>
          </div>
        </div>

        {/* 消息列表 */}
        {messages.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无消息</h3>
            <p className="text-gray-500">您的收件箱是空的</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 hover:bg-gray-50 transition ${
                  !message.is_read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    {/* 发送者头像 */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium text-sm flex-shrink-0 overflow-hidden">
                      {message.sender?.avatar_url ? (
                        <img
                          src={message.sender.avatar_url}
                          alt={message.sender.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        message.is_system ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        ) : (
                          message.sender?.name?.charAt(0) || '?'
                        )
                      )}
                    </div>

                    {/* 消息内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-sm ${!message.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {message.is_system ? '系统通知' : message.sender?.name || '未知用户'}
                        </span>
                        {!message.is_read && (
                          <span className="inline-flex items-center justify-center w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <Link href={`/messages/${message.id}`}>
                        <h3 className={`text-base mb-1 cursor-pointer hover:text-blue-600 ${
                          !message.is_read ? 'font-bold text-gray-900' : 'text-gray-900'
                        }`}>
                          {message.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {message.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center space-x-2 ml-4">
                    {!message.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(message.id)}
                        className="text-xs text-gray-500 hover:text-gray-700 transition"
                        title="标记为已读"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="text-xs text-gray-500 hover:text-red-600 transition"
                      title="删除"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}