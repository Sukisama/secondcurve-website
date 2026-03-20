import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase/client'

export default function PostDetail({ user, profile }) {
  const router = useRouter()
  const { id } = router.query
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (id) {
      fetchPost()
      fetchComments()
    }
  }, [id])

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id(name, avatar, role)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setPost(data)

      // 增加浏览量
      await supabase
        .from('posts')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', id)
    } catch (error) {
      console.error('Error fetching post:', error)
      router.push('/forum')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:author_id(name, avatar, role)
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!user || !profile || profile.role === 'guest') {
      router.push('/login?redirect=/forum/' + id)
      return
    }

    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: id,
          author_id: user.id,
          content: newComment.trim()
        })

      if (error) throw error

      setNewComment('')
      fetchComments()
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert('评论失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const categoryLabels = {
    '经验分享': { emoji: '💡', label: '经验分享' },
    '技术交流': { emoji: '⚙️', label: '技术交流' },
    '资源推荐': { emoji: '📚', label: '资源推荐' },
    '求助问答': { emoji: '❓', label: '求助问答' },
    '产品发布': { emoji: '🚀', label: '产品发布' },
    '闲聊灌水': { emoji: '☕', label: '闲聊灌水' }
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

  if (!post) {
    return (
      <div className="min-h-[calc(100vh-3.5rem-8rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">帖子不存在</h2>
          <Link href="/forum" className="text-blue-600 hover:text-blue-700">
            返回论坛
          </Link>
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

      {/* 帖子内容 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            {post.is_pinned && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                置顶
              </span>
            )}
            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs">
              {categoryLabels[post.category]?.emoji} {post.category}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                  {post.profiles?.name?.charAt(0) || '?'}
                </div>
                <span className="font-medium text-gray-900">{post.profiles?.name || '匿名用户'}</span>
              </div>
              <span>·</span>
              <span>{new Date(post.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{post.views || 0} 浏览</span>
              </span>
            </div>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>
        </div>
      </div>

      {/* 评论区 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            评论 ({comments.length})
          </h2>
        </div>

        {/* 评论输入 */}
        {user && profile?.role !== 'guest' ? (
          <form onSubmit={handleSubmitComment} className="p-6 border-b border-gray-100">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="写下你的评论..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition"
            />
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="bg-gray-900 text-white px-5 py-2 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {submitting ? '发布中...' : '发布评论'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 border-b border-gray-100 text-center text-gray-600">
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              登录
            </Link>
            {' '}后参与讨论
          </div>
        )}

        {/* 评论列表 */}
        <div className="divide-y divide-gray-100">
          {comments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              暂无评论，来抢沙发吧！
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {comment.profiles?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900">{comment.profiles?.name || '匿名用户'}</span>
                      <span className="text-sm text-gray-500">{new Date(comment.created_at).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}