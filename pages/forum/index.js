import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase/client'

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

  useEffect(() => {
    fetchCategories()
    fetchStats()
    fetchPosts()
  }, [activeCategory])

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('category')
      .then(({ data }) => {
        if (data) {
          const uniqueCategories = [...new Set(data.map(p => p.category))]
          setCategories(uniqueCategories)
        }
      })
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
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id(name, avatar, role)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory)
      }

      const { data, error } = await query

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
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

  return (
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
                  activeCategory === 'all'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
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
                    activeCategory === key
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
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
                  activeCategory === 'all'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                全部
              </button>
              {Object.entries(categoryLabels).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    activeCategory === key
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
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
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">加载中...</p>
              </div>
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
                  <Link
                    key={post.id}
                    href={`/forum/${post.id}`}
                    className="block p-6 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {post.is_pinned && (
                            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                              置顶
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs">
                            {categoryLabels[post.category]?.emoji} {post.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                                {post.profiles?.name?.charAt(0) || '?'}
                              </div>
                              <span>{post.profiles?.name || '匿名用户'}</span>
                            </div>
                            <span>·</span>
                            <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>{post.views || 0}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              <span>{post.likes || 0}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}