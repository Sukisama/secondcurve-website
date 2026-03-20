import Link from 'next/link'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase/client'
import { useToast } from '../components/Toast'
import CasePublishModal from '../components/CasePublishModal'
import { hasPermission } from '../lib/auth/permissions'

const categories = ['全部', 'AI应用', '产品实战', '创业经验', '技术开发', '其他']

export default function Cases({ user, profile }) {
  const [cases, setCases] = useState([])
  const [activeCategory, setActiveCategory] = useState('全部')
  const [loading, setLoading] = useState(true)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const toast = useToast()

  useEffect(() => {
    fetchCases()
  }, [])

  const fetchCases = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          profiles:author_id(name, avatar, role)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCases(data || [])
    } catch (error) {
      console.error('Error fetching cases:', error)
      toast.error('加载案例失败')
    } finally {
      setLoading(false)
    }
  }

  const filteredCases = activeCategory === '全部'
    ? cases
    : cases.filter(item => item.category === activeCategory)

  const handleDelete = async (caseId, caseTitle) => {
    // 检查权限
    const caseItem = cases.find(c => c.id === caseId)
    if (!caseItem) return

    const isAuthor = caseItem.author_id === user?.id
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

    if (!isAuthor && !isAdmin) {
      toast.error('你没有权限删除此案例')
      return
    }

    // 确认删除
    if (!confirm(`确定要删除案例「${caseTitle}」吗？此操作不可撤销。`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', caseId)

      if (error) throw error

      toast.success('案例已删除')
      fetchCases()
    } catch (error) {
      console.error('Error deleting case:', error)
      toast.error('删除失败，请重试')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 检查用户是否可以发布内容
  const canPublish = user && profile && hasPermission(profile.role, 'member')

  return (
    <>
      <Head>
        <title>实战案例 - 真实项目拆解 | 第二曲线</title>
        <meta name="description" content="成都AI创客社区的实战案例集，真实项目拆解，可复用的方法论。涵盖智能产品、技术探索、商业落地等方向。" />
      </Head>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">实战案例</h1>
              <p className="text-gray-500 text-base sm:text-lg">真实项目拆解，可复用的方法论</p>
            </div>
            {canPublish && (
              <button
                onClick={() => setShowPublishModal(true)}
                className="bg-gray-900 text-white px-5 py-3 sm:py-2.5 rounded-xl font-medium hover:bg-gray-800 transition whitespace-nowrap text-center min-h-[48px]"
              >
                发布案例
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-10 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2.5 sm:py-2 rounded-xl text-sm font-medium transition whitespace-nowrap min-h-[44px] ${
                activeCategory === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredCases.map((item) => {
              const isAuthor = item.author_id === user?.id
              const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
              const canDelete = isAuthor || isAdmin

              return (
                <div key={item.id} className="group relative">
                  <Link href={`/cases/${item.id}`} className="block h-full">
                    <article className="border border-gray-200 rounded-2xl p-4 sm:p-6 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition h-full flex flex-col">
                      {/* 缩略图 */}
                      {item.thumbnail && (
                        <div className="mb-3 sm:mb-4 -mt-2 -mx-4 sm:-mx-6">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-40 sm:h-48 object-cover rounded-t-2xl"
                          />
                        </div>
                      )}

                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <span className="text-xs font-medium text-gray-500">{item.category}</span>
                          <span className="text-xs text-gray-400">{formatDate(item.created_at)}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-500 text-sm mb-3 sm:mb-4 line-clamp-3">
                          {item.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {item.tags?.map((tag, i) => (
                            <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                            {item.profiles?.name?.charAt(0) || item.author?.charAt(0) || '?'}
                          </div>
                          <span className="text-sm text-gray-400 truncate max-w-[100px] sm:max-w-none">
                            {item.profiles?.name || item.author || '匿名用户'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900 font-medium whitespace-nowrap">
                          查看详情
                        </span>
                      </div>
                    </article>
                  </Link>

                  {/* 删除按钮 */}
                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDelete(item.id, item.title)
                      }}
                      className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-red-50 active:bg-red-100 text-gray-400 hover:text-red-600 p-2.5 sm:p-2 rounded-lg transition opacity-100 sm:opacity-0 group-hover:opacity-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="删除案例"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {!loading && filteredCases.length === 0 && (
          <div className="text-center py-12 sm:py-16 text-gray-400">
            <div className="text-5xl sm:text-6xl mb-4">📝</div>
            <p className="text-base sm:text-lg mb-2">暂无「{activeCategory}」类目的案例</p>
            {canPublish && (
              <button
                onClick={() => setShowPublishModal(true)}
                className="mt-4 bg-gray-900 text-white px-6 py-3 sm:py-2.5 rounded-xl font-medium hover:bg-gray-800 transition min-h-[48px]"
              >
                发布第一个案例
              </button>
            )}
          </div>
        )}
      </div>

      {/* 发布弹窗 */}
      {showPublishModal && (
        <CasePublishModal
          user={user}
          profile={profile}
          onClose={() => setShowPublishModal(false)}
          onSuccess={fetchCases}
        />
      )}
    </>
  )
}