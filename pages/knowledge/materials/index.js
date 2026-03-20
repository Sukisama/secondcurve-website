import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase/client'
import { useToast } from '../../../components/Toast'

export default function MaterialsList() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const toast = useToast()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_items')
        .select('*, profiles(name)')
        .eq('type', 'learning_material')
        .order('created_at', { ascending: false })

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/knowledge" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
              ← 返回知识库
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">学习资料</h1>
          </div>
          {user && (
            <Link
              href="/knowledge/materials/new"
              className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <div key={material.id} className="border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{material.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{material.description}</p>
                {material.link && (
                  <a
                    href={material.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-900 font-medium hover:underline"
                  >
                    查看详情 →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}