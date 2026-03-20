import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase/client'
import { useToast } from '../../../components/Toast'
import Pagination from '../../../components/Pagination'

export default function MaterialsList() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalMaterials, setTotalMaterials] = useState(0)
  const pageSize = 12
  const toast = useToast()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  useEffect(() => {
    fetchMaterials()
  }, [currentPage])

  const fetchMaterials = async () => {
    try {
      setLoading(true)

      // 获取总数
      const { count } = await supabase
        .from('knowledge_items')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'learning_material')

      setTotalMaterials(count || 0)

      // 获取分页数据
      const from = (currentPage - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error } = await supabase
        .from('knowledge_items')
        .select('*, profiles(name)')
        .eq('type', 'learning_material')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error
      setMaterials(data || [])
    } catch (error) {
      toast.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定要删除吗？')) return

    try {
      const { error } = await supabase
        .from('knowledge_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('删除成功')
      fetchMaterials()
    } catch (error) {
      toast.error('删除失败')
    }
  }

  return (
    <>
      <Head>
        <title>学习资料 - 知识库 | 第二曲线</title>
      </Head>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/knowledge" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
              ← 返回知识库
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">学习资料</h1>
          </div>
          {user && (
            <Link
              href="/knowledge/materials/new"
              className="bg-gray-900 text-white px-5 py-2.5 sm:px-6 rounded-xl text-sm font-medium hover:bg-gray-800 transition text-center min-h-[44px] flex items-center justify-center"
            >
              上传资料
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : materials.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">暂无学习资料</p>
            {user && (
              <Link href="/knowledge/materials/new" className="text-gray-900 font-medium hover:underline">
                成为第一个上传的人 →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {materials.map((material) => (
              <Link key={material.id} href={`/knowledge/materials/${material.id}`}>
                <div className="border border-gray-200 rounded-2xl p-4 sm:p-6 hover:border-gray-300 hover:shadow-sm transition h-full">
                  <div className="flex items-center gap-2 mb-2">
                    {material.is_vip_only && (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">
                        VIP
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{material.title}</h3>
                  <p className="text-gray-500 text-sm mb-3 sm:mb-4 line-clamp-2">{material.description}</p>
                  {material.link && (
                    <span className="text-sm text-gray-900 font-medium">
                      查看详情 →
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 分页 */}
        {!loading && materials.length > 0 && (
          <Pagination
            total={totalMaterials}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </>
  )
}