import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { supabase } from '../../lib/supabase/client'
import { useToast } from '../../components/Toast'
import { hasPermission } from '../../lib/auth/permissions'
import { awardPoints } from '../../lib/points'
import { likePost, unlikePost, favoritePost, unfavoritePost } from '../../lib/forum'
import Pagination from '../../components/Pagination'
import { ForumPostSkeleton } from '../../components/Skeleton'

export default function Forum({ user, profile }) {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalMembers: 0,
    totalReplies: 0
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const [userLikes, setUserLikes] = useState({})
  const [userFavorites, setUserFavorites] = useState({})
  const pageSize = 20
  const toast = useToast()

  useEffect(() => {
    fetchCategories()
    fetchStats()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
    fetchPosts()
  }, [activeCategory])

  useEffect(() => {
    fetchPosts()
  }, [currentPage])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('posts')
      .select('category')

    if (data) {
      const uniqueCategories = [...new Set(data.map(p => p.category))]
      setCategories(uniqueCategories)
    }
  }

  const fetchStats = async () => {
    try {
      const [postsCount, membersCount, commentsCount] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true })
      ])

      setStats({
        totalPosts: postsCount.count || 0,
        totalMembers: membersCount.count || 0,
        totalReplies: commentsCount.count || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchPosts = async () => {
    try {
      setLoading(true)

      // 获取总数
      let countQuery = supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })

      if (activeCategory !== 'all') {
        countQuery = countQuery.eq('category', activeCategory)
      }

      const { count } = await countQuery
      setTotalPosts(count || 0)

      // 获取分页数据
      const from = (currentPage - 1) * pageSize
      const to = from + pageSize - 1

      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id(name, avatar, role),
          elite_profile:elite_by(name)
        `)
        .order('is_pinned', { ascending: false })
        .order('is_elite', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory)
      }

      const { data, error } = await query

      if (error) throw error
      setPosts(data || [])

      // 获取用户的点赞和收藏状态
      if (user && data) {
        const postIds = data.map(p => p.id)
        await fetchUserInteractions(postIds)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserInteractions = async (postIds) => {
    try {
      const [likesRes, favoritesRes] = await Promise.all([
        supabase
          .from('post_likes')
          .select('post_id')
          .in('post_id', postIds)
          .eq('user_id', user.id),
        supabase
          .from('post_favorites')
          .select('post_id')
          .in('post_id', postIds)
          .eq('user_id', user.id)
      ])

      const likes = {}
      likesRes.data?.forEach(like => {
        likes[like.post_id] = true
      })

      const favorites = {}
      favoritesRes.data?.forEach(fav => {
        favorites[fav.post_id] = true
      })

      setUserLikes(likes)
      setUserFavorites(favorites)
    } catch (error) {
      console.error('Error fetching user interactions:', error)
    }
  }

  const handleLike = async (e, postId) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.error('请先登录')
      return
    }

    try {
      if (userLikes[postId]) {
        await unlikePost(postId)
        setUserLikes(prev => ({ ...prev, [postId]: false }))
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, likes_count: Math.max(0, (p.likes_count || 0) - 1) } : p
        ))
      } else {
        await likePost(postId)
        setUserLikes(prev => ({ ...prev, [postId]: true }))
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p
        ))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('操作失败')
    }
  }

  const handleFavorite = async (e, postId) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.error('请先登录')
      return
    }

    try {
      if (userFavorites[postId]) {
        await unfavoritePost(postId)
        setUserFavorites(prev => ({ ...prev, [postId]: false }))
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, favorites_count: Math.max(0, (p.favorites_count || 0) - 1) } : p
        ))
        toast.success('已取消收藏')
      } else {
        await favoritePost(postId)
        setUserFavorites(prev => ({ ...prev, [postId]: true }))
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, favorites_count: (p.favorites_count || 0) + 1 } : p
        ))
        toast.success('收藏成功')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('操作失败')
    }
  }

  const toggleElite = async (e, postId, currentStatus, authorId) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user || !profile || !hasPermission(profile.role, 'admin')) {
      toast.error('权限不足')
      return
    }

    try {
      const newStatus = !currentStatus
      const updateData = {
        is_elite: newStatus,
        elite_at: newStatus ? new Date().toISOString() : null,
        elite_by: newStatus ? user.id : null
      }

      const { error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', postId)

      if (error) throw error

      if (newStatus) {
        await awardPoints(authorId, 'elite_post')
        toast.success('已设为精华帖，已奖励作者 100 积分')
      } else {
        toast.success('已取消精华')
      }

      fetchPosts()
    } catch (error) {
      console.error('Error toggling elite:', error)
      toast.error('操作失败，请重试')
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

  const RoleBadge = ({ role }) => {
    if (!role || role === 'member' || role === 'guest') return null

    const badges = {
      vip: { label: 'VIP', className: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-medium' },
      admin: { label: '管理员', className: 'bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium' },
      super_admin: { label: '超管', className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-medium' }
    }

    const badge = badges[role]
    return badge ? <span className={badge.className}>{badge.label}</span> : null
  }

  return (
    <>
      <Head>
        <title>社区论坛 - 交流想法，分享经验 | 第二曲线</title>
        <meta name="description" content="成都AI创客社区论坛，交流想法，分享经验，一起成长" />
      </Head>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">社区论坛</h1>
          <p className="text-gray-600">交流想法，分享经验，一起成长</p>
        </div>

        <div className="flex gap-6">
          {/* 左侧边栏 */}
          <div className="hidden lg:block w-64 flex-shrink-0 space-y-6">
            {/* 社区概览 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">社区概览</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">成员</span>
                  <span className="font-semibold text-gray-900">{stats.totalMembers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">话题</span>
                  <span className="font-semibold text-gray-900">{stats.totalPosts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">回复</span>
                  <span className="font-semibold text-gray-900">{stats.totalReplies}</span>
                </div>
              </div>
            </div>

            {/* 话题分类 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">话题分类</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    activeCategory === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">🌐</span>
                  全部
                </button>
                {Object.entries(categoryLabels).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      activeCategory === key ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{value.emoji}</span>
                    {value.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 主内容区 */}
          <div className="flex-1">
            {/* 发帖按钮 */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-2 overflow-x-auto lg:hidden">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    activeCategory === 'all' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  全部
                </button>
                {Object.entries(categoryLabels).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                      activeCategory === key ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {value.emoji} {value.label}
                  </button>
                ))}
              </div>

              {user && profile?.role !== 'guest' && (
                <Link
                  href="/forum/new"
                  className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition whitespace-nowrap ml-4"
                >
                  发布话题
                </Link>
              )}
            </div>

            {/* 帖子列表 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <ForumPostSkeleton count={5} />
              ) : posts.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">还没有话题</h3>
                  <p className="text-gray-600 mb-4">成为第一个发布话题的人吧！</p>
                  {user && profile?.role !== 'guest' && (
                    <Link
                      href="/forum/new"
                      className="inline-block bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition"
                    >
                      发布第一个话题
                    </Link>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className={`block p-6 hover:bg-gray-50 transition relative ${
                        post.is_elite ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        {/* 图片缩略图 */}
                        {post.image_url && (
                          <Link href={`/forum/${post.id}`} className="flex-shrink-0">
                            <img
                              src={post.image_url}
                              alt=""
                              className="w-32 h-24 object-cover rounded-lg"
                            />
                          </Link>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-2">
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
                          <Link href={`/forum/${post.id}`}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 line-clamp-1">
                              {post.title}
                            </h3>
                          </Link>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {post.content}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                                  {post.profiles?.avatar ? (
                                    <img src={post.profiles.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    post.profiles?.name?.charAt(0) || '?'
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>{post.profiles?.name || '匿名用户'}</span>
                                  <RoleBadge role={post.profiles?.role} />
                                </div>
                              </div>
                              <span>·</span>
                              <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 互动按钮 */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          {/* 浏览量 */}
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{post.views || 0}</span>
                          </span>

                          {/* 点赞 */}
                          <button
                            onClick={(e) => handleLike(e, post.id)}
                            className={`flex items-center space-x-1 ${userLikes[post.id] ? 'text-red-500' : 'hover:text-red-500'}`}
                          >
                            <svg className="w-4 h-4" fill={userLikes[post.id] ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{post.likes_count || 0}</span>
                          </button>

                          {/* 收藏 */}
                          <button
                            onClick={(e) => handleFavorite(e, post.id)}
                            className={`flex items-center space-x-1 ${userFavorites[post.id] ? 'text-yellow-500' : 'hover:text-yellow-500'}`}
                          >
                            <svg className="w-4 h-4" fill={userFavorites[post.id] ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            <span>{post.favorites_count || 0}</span>
                          </button>

                          {/* 评论数 */}
                          <Link href={`/forum/${post.id}#comments`} className="flex items-center space-x-1 hover:text-blue-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{post.comments_count || 0}</span>
                          </Link>
                        </div>

                        {/* 管理员操作按钮 */}
                        {user && profile && hasPermission(profile.role, 'admin') && (
                          <button
                            onClick={(e) => toggleElite(e, post.id, post.is_elite, post.author_id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                              post.is_elite
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            }`}
                          >
                            {post.is_elite ? '取消精华' : '设为精华'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 分页 */}
            {!loading && posts.length > 0 && (
              <Pagination
                total={totalPosts}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}