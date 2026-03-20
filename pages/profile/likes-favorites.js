import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getUserLikedPosts, getUserFavoritePosts } from '../../lib/forum'

export default function ProfileLikesFavorites({ user, profile }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('likes')
  const [likedPosts, setLikedPosts] = useState([])
  const [favoritePosts, setFavoritePosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/profile/likes-favorites')
      return
    }

    if (profile) {
      fetchData()
    }
  }, [user, profile, router])

  const fetchData = async () => {
    setLoading(true)
    const { data: liked } = await getUserLikedPosts(profile.id, 50)
    const { data: favorited } = await getUserFavoritePosts(profile.id, 50)
    setLikedPosts(liked || [])
    setFavoritePosts(favorited || [])
    setLoading(false)
  }

  if (!user || !profile) {
    return (
      <div className="min-h-[calc(100vh-3.5rem-8rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  const categoryLabels = {
    '经验分享': '💡',
    '技术交流': '⚙️',
    '资源推荐': '📚',
    '求助问答': '❓',
    '产品发布': '🚀',
    '闲聊灌水': '☕'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 面包屑导航 */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link href="/profile" className="hover:text-gray-900 transition">个人中心</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900">我的点赞和收藏</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">我的点赞和收藏</h1>
        </div>

        {/* 标签页 */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('likes')}
              className={`flex-1 py-3 px-4 text-center font-medium transition ${
                activeTab === 'likes'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              点赞 ({likedPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 py-3 px-4 text-center font-medium transition ${
                activeTab === 'favorites'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              收藏 ({favoritePosts.length})
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">加载中...</p>
            </div>
          ) : (
            <>
              {activeTab === 'likes' && (
                <>
                  {likedPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">❤️</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">还没有点赞过帖子</h3>
                      <p className="text-gray-600 mb-4">去论坛看看感兴趣的内容吧</p>
                      <Link
                        href="/forum"
                        className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition"
                      >
                        浏览论坛
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {likedPosts.map((post) => (
                        <Link
                          key={post.id}
                          href={`/forum/${post.id}`}
                          className="block p-4 hover:bg-gray-50 rounded-xl transition"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs">
                                  {categoryLabels[post.category]} {post.category}
                                </span>
                              </div>
                              <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>{post.profiles?.name || '匿名'}</span>
                                <span>·</span>
                                <span>点赞于 {new Date(post.liked_at).toLocaleDateString('zh-CN')}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'favorites' && (
                <>
                  {favoritePosts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">⭐</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">还没有收藏过帖子</h3>
                      <p className="text-gray-600 mb-4">收藏感兴趣的内容，方便以后查看</p>
                      <Link
                        href="/forum"
                        className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition"
                      >
                        浏览论坛
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {favoritePosts.map((post) => (
                        <Link
                          key={post.id}
                          href={`/forum/${post.id}`}
                          className="block p-4 hover:bg-gray-50 rounded-xl transition"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs">
                                  {categoryLabels[post.category]} {post.category}
                                </span>
                              </div>
                              <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>{post.profiles?.name || '匿名'}</span>
                                <span>·</span>
                                <span>收藏于 {new Date(post.favorited_at).toLocaleDateString('zh-CN')}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}