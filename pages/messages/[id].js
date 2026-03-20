import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase/client'
import { getMessage, deleteMessage, markMessageAsRead } from '../../lib/messages'
import { useToast } from '../../components/Toast'

export default function MessageDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const toast = useToast()

  const [currentUser, setCurrentUser] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (id && currentUser) {
      fetchMessage()
    }
  }, [id, currentUser])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setCurrentUser(user)
  }

  const fetchMessage = async () => {
    setLoading(true)
    const { data, error } = await getMessage(id, currentUser.id)

    if (error || !data) {
      toast.error('消息不存在或无权查看')
      router.push('/messages')
      return
    }

    setMessage(data)

    // 自动标记为已读
    if (!data.is_read) {
      await markMessageAsRead(id, currentUser.id)
    }

    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这条消息吗？')) return

    const { success, error } = await deleteMessage(id, currentUser.id)
    if (success) {
      toast.success('消息已删除')
      router.push('/messages')
    } else {
      toast.error(error || '删除失败')
    }
  }

  const handleReply = async (e) => {
    e.preventDefault()

    if (!replyContent.trim()) {
      toast.error('请输入回复内容')
      return
    }

    if (!message.sender_id) {
      toast.error('无法回复系统消息')
      return
    }

    setSending(true)

    const { success, error } = await supabase
      .from('messages')
      .insert([{
        sender_id: currentUser.id,
        receiver_id: message.sender_id,
        title: `回复: ${message.title}`,
        content: replyContent.trim(),
        is_read: false
      }])

    setSending(false)

    if (!error) {
      toast.success('回复发送成功')
      setShowReplyForm(false)
      setReplyContent('')
    } else {
      toast.error('发送失败')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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

  if (!message) {
    return null
  }

  return (
    <>
      <Head>
        <title>{message.title} - 站内信 - 第二曲线</title>
      </Head>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link
            href="/messages"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回消息列表
          </Link>
        </div>

        {/* 消息详情 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* 消息头部 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{message.title}</h1>
              <div className="flex items-center space-x-2">
                {!message.is_system && (
                  <button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    回复
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition"
                >
                  删除
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* 发送者头像 */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium overflow-hidden">
                {message.sender?.avatar_url ? (
                  <img
                    src={message.sender.avatar_url}
                    alt={message.sender.name}
                    className="w-full h-full object-cover"
                  />
                ) : message.is_system ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                ) : (
                  message.sender?.name?.charAt(0) || '?'
                )}
              </div>

              <div>
                <p className="font-medium text-gray-900">
                  {message.is_system ? '系统通知' : message.sender?.name || '未知用户'}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(message.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* 消息内容 */}
          <div className="p-6">
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {message.content}
              </p>
            </div>
          </div>

          {/* 回复表单 */}
          {showReplyForm && !message.is_system && (
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">回复消息</h3>
              <form onSubmit={handleReply}>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="输入回复内容..."
                  rows={4}
                  maxLength={5000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-gray-400">
                    {replyContent.length} / 5000
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReplyForm(false)
                        setReplyContent('')
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={sending}
                      className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? '发送中...' : '发送回复'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  )
}