import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase/client'
import { useToast } from '../../../components/Toast'
import Pagination from '../../../components/Pagination'

export default function ToolsList() {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalTools, setTotalTools] = useState(0)
  const pageSize = 12
  const toast = useToast()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  useEffect(() => {
    fetchTools()
  }, [currentPage])

  const fetchTools = async () => {
    try {
      setLoading(true)

      // 获取总数
      const { count } = await supabase
        .from('knowledge_items')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'tool')

      setTotalTools(count || 0)

      // 获取分页数据
      const from = (currentPage - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error } = await supabase
        .from('knowledge_items')
        .select('*, profiles(name)')
        .eq('type', 'tool')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error
      setTools(data || [])
    } catch (error) {
      toast.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>工具库 - 知识库 | 第二曲线</title>
      </Head>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/knowledge" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
              ← 返回知识库
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">工具库</h1>
          </div>
          {user && (
            <Link
              href="/knowledge/tools/new"
              className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
            >
              添加工具
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : tools.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">暂无工具</p>
            {user && (
              <Link href="/knowledge/tools/new" className="text-gray-900 font-medium hover:underline">
                成为第一个添加的人 →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <Link key={tool.id} href={`/knowledge/tools/${tool.id}`}>
                <div className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition h-full">
                  <div className="flex items-center gap-2 mb-2">
                    {tool.is_vip_only && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                        VIP
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900">{tool.title}</h3>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">{tool.description}</p>
                  {tool.link && (
                    <span className="inline-block mt-3 text-sm text-gray-900 font-medium">
                      访问链接 →
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 分页 */}
        {!loading && tools.length > 0 && (
          <Pagination
            total={totalTools}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </>
  )
}