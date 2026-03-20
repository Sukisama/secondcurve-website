import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase/client'
import { useToast } from '../../components/Toast'
import { hasPermission } from '../../lib/auth/permissions'
import { awardPoints } from '../../lib/points'
import { likePost, unlikePost, favoritePost, unfavoritePost, checkPostLiked, checkPostFavorited } from '../../lib/forum'

export default function PostDetail({ user, profile }) {
  const router = useRouter()
  const { id } = router.query
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [liked, setLiked] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [liking, setLiking] = useState(false)
  const [favoriting, setFavoriting] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (id) {
      fetchPost()
      fetchComments()
      checkUserInteractions()
    }
  }, [id])

  const checkUserInteractions = async () => {
    if (!user) return

    const { liked: isLiked } = await checkPostLiked(id)
    const { favorited: isFavorited } = await checkPostFavorited(id)
    setLiked(isLiked)
    setFavorited(isFavorited)
  }

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id(name, avatar, role),
          elite_profile:elite_by(name)
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

      // 奖励积分
      await awardPoints(user.id, 'comment_post')

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

  // 切换精华状态
  const toggleElite = async () => {
    if (!user || !profile || !hasPermission(profile.role, 'admin')) {
      toast.error('权限不足')
      return
    }

    try {
      const newStatus = !post.is_elite
      const updateData = {
        is_elite: newStatus,
        elite_at: newStatus ? new Date().toISOString() : null,
        elite_by: newStatus ? user.id : null
      }

      const { error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      // 如果设为精华，奖励积分
      if (newStatus) {
        await awardPoints(post.author_id, 'elite_post')
        toast.success('已设为精华帖，已奖励作者 100 积分')
      } else {
        toast.success('已取消精华')
      }

      // 刷新帖子
      fetchPost()
    } catch (error) {
      console.error('Error toggling elite:', error)
      toast.error('操作失败，请重试')
    }
  }

  // 点赞/取消点赞
  const handleToggleLike = async () => {
    if (!user) {
      toast.error('请先登录')
      router.push('/login?redirect=/forum/' + id)
      return
    }

    if (liking) return
    setLiking(true)

    try {
      if (liked) {
        const { success, error } = await unlikePost(id)
        if (error) {
          toast.error(error)
        } else {
          setLiked(false)
          setPost({ ...post, likes_count: Math.max(0, (post.likes_count || 0) - 1) })
          toast.success('已取消点赞')
        }
      } else {
        const { success, error } = await likePost(id)
        if (error) {
          toast.error(error)
        } else {
          setLiked(true)
          setPost({ ...post, likes_count: (post.likes_count || 0) + 1 })
          toast.success('点赞成功')
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('操作失败')
    } finally {
      setLiking(false)
    }
  }

  // 收藏/取消收藏
  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('请先登录')
      router.push('/login?redirect=/forum/' + id)
      return
    }

    if (favoriting) return
    setFavoriting(true)

    try {
      if (favorited) {
        const { success, error } = await unfavoritePost(id)
        if (error) {
          toast.error(error)
        } else {
          setFavorited(false)
          setPost({ ...post, favorites_count: Math.max(0, (post.favorites_count || 0) - 1) })
          toast.success('已取消收藏')
        }
      } else {
        const { success, error } = await favoritePost(id)
        if (error) {
          toast.error(error)
        } else {
          setFavorited(true)
          setPost({ ...post, favorites_count: (post.favorites_count || 0) + 1 })
          toast.success('收藏成功')
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('操作失败')
    } finally {
      setFavoriting(false)
    }
  }

  // 角色标识徽章
  const RoleBadge = ({ role }) => {
    if (!role || role === 'member' || role === 'guest') return null

    const badges = {
      vip: {
        label: 'VIP',
        className: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-medium'
      },
      admin: {
        label: '管理员',
        className: 'bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium'
      },
      super_admin: {
        label: '超管',
        className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-medium'
      }
    }

    const badge = badges[role]
    if (!badge) return null

    return <span className={badge.className}>{badge.label}</span>
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
      <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden mb-6 ${
        post.is_elite ? 'border-amber-200 bg-amber-50/20' : 'border-gray-100'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              {post.is_elite && (
                <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold shadow-sm">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  精华
                </span>
              )}
              {post.is_pinned && (
                <span className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                  置顶
                </span>
              )}
              <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs">
                {categoryLabels[post.category]?.emoji} {post.category}
              </span>
            </div>

            {/* 管理员操作按钮 */}
            {user && profile && hasPermission(profile.role, 'admin') && (
              <button
                onClick={toggleElite}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  post.is_elite
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600'
                }`}
              >
                {post.is_elite ? '取消精华' : '设为精华'}
              </button>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                  {post.profiles?.avatar ? (
                    <img src={post.profiles.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    post.profiles?.name?.charAt(0) || '?'
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{post.profiles?.name || '匿名用户'}</span>
                  <RoleBadge role={post.profiles?.role} />
                </div>
              </div>
              <span>·</span>
              <span>{new Date(post.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {/* 精华信息 */}
          {post.is_elite && post.elite_at && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center text-sm text-amber-800">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>
                  由 <span className="font-semibold">{post.elite_profile?.name || '管理员'}</span> 设为精华 · {new Date(post.elite_at).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
          )}

          <div className="prose prose-gray max-w-none">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* 操作按钮 */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* 点赞按钮 */}
                <button
                  onClick={handleToggleLike}
                  disabled={liking}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                    liked
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{post.likes_count || 0}</span>
                </button>

                {/* 收藏按钮 */}
                <button
                  onClick={handleToggleFavorite}
                  disabled={favoriting}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                    favorited
                      ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span>{post.favorites_count || 0}</span>
                </button>
              </div>

              {/* 统计信息 */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{post.views || 0} 浏览</span>
                </span>
              </div>
            </div>
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0 overflow-hidden">
                    {comment.profiles?.avatar ? (
                      <img src={comment.profiles.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      comment.profiles?.name?.charAt(0) || '?'
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900">{comment.profiles?.name || '匿名用户'}</span>
                      <RoleBadge role={comment.profiles?.role} />
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