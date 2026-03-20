import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase/client'

export default function Search() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({
    posts: [],
    cases: [],
    materials: [],
    tools: [],
    topics: []
  })
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data }) => setProfile(data))
      }
    })
  }, [])

  useEffect(() => {
    const q = router.query.q
    if (q) {
      setQuery(q)
      performSearch(q)
    }
  }, [router.query])

  const isVIP = profile?.role === 'vip' && profile?.vip_expires_at && new Date(profile.vip_expires_at) > new Date()

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return

    setLoading(true)

    try {
      const searchTerm = `%${searchQuery.trim()}%`

      // 并行搜索多个表
      const [postsRes, casesRes, materialsRes, toolsRes, topicsRes] = await Promise.all([
        // 搜索帖子
        supabase
          .from('posts')
          .select('id, title, content, category, created_at, profiles(name, avatar, role)')
          .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
          .order('created_at', { ascending: false })
          .limit(10),

        // 搜索案例
        supabase
          .from('cases')
          .select('id, title, description, category, created_at')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .order('created_at', { ascending: false })
          .limit(10),

        // 搜索学习资料
        supabase
          .from('knowledge_items')
          .select('id, title, description, is_vip_only, created_at')
          .eq('type', 'learning_material')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .order('created_at', { ascending: false })
          .limit(10),

        // 搜索工具
        supabase
          .from('knowledge_items')
          .select('id, title, description, is_vip_only, created_at')
          .eq('type', 'tool')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .order('created_at', { ascending: false })
          .limit(10),

        // 搜索专题
        supabase
          .from('knowledge_items')
          .select('id, title, description, is_vip_only, created_at')
          .eq('type', 'topic_series')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .order('created_at', { ascending: false })
          .limit(10)
      ])

      setResults({
        posts: postsRes.data || [],
        cases: casesRes.data || [],
        // 过滤VIP专属内容（如果用户不是VIP）
        materials: (materialsRes.data || []).filter(item => !item.is_vip_only || isVIP),
        tools: (toolsRes.data || []).filter(item => !item.is_vip_only || isVIP),
        topics: (topicsRes.data || []).filter(item => !item.is_vip_only || isVIP)
      })
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const totalResults =
    results.posts.length +
    results.cases.length +
    results.materials.length +
    results.tools.length +
    results.topics.length

  return (
    <>
      <Head>
        <title>搜索 - 第二曲线</title>
      </Head>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">搜索</h1>

        {/* 搜索框 */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索帖子、案例、学习资料、工具..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        {/* 搜索结果 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">搜索中...</p>
          </div>
        ) : router.query.q ? (
          <>
            {totalResults === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关内容</h3>
                <p className="text-gray-600">试试其他关键词？</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* 帖子结果 */}
                {results.posts.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span>💬</span> 论坛帖子
                      <span className="text-sm font-normal text-gray-500">({results.posts.length})</span>
                    </h2>
                    <div className="space-y-3">
                      {results.posts.map((post) => (
                        <Link
                          key={post.id}
                          href={`/forum/${post.id}`}
                          className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition"
                        >
                          <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span>{post.category}</span>
                            <span>·</span>
                            <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 案例结果 */}
                {results.cases.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span>🎯</span> 实战案例
                      <span className="text-sm font-normal text-gray-500">({results.cases.length})</span>
                    </h2>
                    <div className="space-y-3">
                      {results.cases.map((item) => (
                        <Link
                          key={item.id}
                          href={`/cases/${item.id}`}
                          className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition"
                        >
                          <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span>{item.category}</span>
                            <span>·</span>
                            <span>{new Date(item.created_at).toLocaleDateString('zh-CN')}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 学习资料结果 */}
                {results.materials.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span>📚</span> 学习资料
                      <span className="text-sm font-normal text-gray-500">({results.materials.length})</span>
                    </h2>
                    <div className="space-y-3">
                      {results.materials.map((item) => (
                        <Link
                          key={item.id}
                          href={`/knowledge/materials/${item.id}`}
                          className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {item.is_vip_only && (
                              <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">
                                VIP
                              </span>
                            )}
                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 工具结果 */}
                {results.tools.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span>🔧</span> 工具库
                      <span className="text-sm font-normal text-gray-500">({results.tools.length})</span>
                    </h2>
                    <div className="space-y-3">
                      {results.tools.map((item) => (
                        <Link
                          key={item.id}
                          href={`/knowledge/tools/${item.id}`}
                          className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {item.is_vip_only && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                                VIP
                              </span>
                            )}
                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 专题结果 */}
                {results.topics.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span>📖</span> 专题系列
                      <span className="text-sm font-normal text-gray-500">({results.topics.length})</span>
                    </h2>
                    <div className="space-y-3">
                      {results.topics.map((item) => (
                        <Link
                          key={item.id}
                          href={`/knowledge/topics/${item.id}`}
                          className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {item.is_vip_only && (
                              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">
                                VIP
                              </span>
                            )}
                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">输入关键词开始搜索</h3>
            <p className="text-gray-600">搜索论坛帖子、实战案例、学习资料、工具等</p>
          </div>
        )}
      </div>
    </>
  )
}