import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../../../lib/supabase/client'
import { useToast } from '../../../components/Toast'

export default function MaterialDetail() {
  const router = useRouter()
  const { id } = router.query
  const [material, setMaterial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const toast = useToast()

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
    if (id) {
      fetchMaterial()
    }
  }, [id])

  const fetchMaterial = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_items')
        .select('*, profiles(name, avatar, role)')
        .eq('id', id)
        .eq('type', 'learning_material')
        .single()

      if (error) throw error
      setMaterial(data)
    } catch (error) {
      toast.error('加载失败')
      router.push('/knowledge/materials')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除此资料吗？')) return

    try {
      const { error } = await supabase
        .from('knowledge_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('删除成功')
      router.push('/knowledge/materials')
    } catch (error) {
      toast.error('删除失败')
    }
  }

  const isVIP = profile?.role === 'vip' && profile?.vip_expires_at && new Date(profile.vip_expires_at) > new Date()
  const isAuthor = user && material?.author_id === user.id

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  if (!material) return null

  // VIP专属内容但用户不是VIP
  if (material.is_vip_only && !isVIP) {
    return (
      <>
        <Head>
          <title>{material.title} - 学习资料 | 第二曲线</title>
        </Head>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/knowledge/materials" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
            ← 返回学习资料
          </Link>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6 sm:p-8 md:p-12 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-yellow-100 rounded-full mb-4">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">VIP专属内容</h2>
              <p className="text-gray-600 mb-1 text-sm sm:text-base">此学习资料仅限VIP会员查看</p>
              <p className="text-sm text-gray-500">{material.title}</p>
            </div>

            <Link
              href="/vip"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 sm:px-8 py-3 rounded-xl font-medium hover:from-yellow-500 hover:to-orange-600 transition min-h-[44px]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              立即开通VIP会员
            </Link>

            <p className="text-sm text-gray-500 mt-4">年费仅需 ¥188</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{material.title} - 学习资料 | 第二曲线</title>
      </Head>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/knowledge/materials" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
          ← 返回学习资料
        </Link>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-4">
            {material.is_vip_only && (
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                VIP专属
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">{material.title}</h1>

          {material.description && (
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{material.description}</p>
          )}

          {material.cover_image && (
            <img src={material.cover_image} alt={material.title} className="w-full rounded-xl mb-6" />
          )}

          {material.content && (
            <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: material.content }} />
          )}

          {material.link && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">资料链接</p>
              <a
                href={material.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 font-medium hover:underline break-all"
              >
                {material.link}
              </a>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              {material.profiles?.avatar ? (
                <img src={material.profiles.avatar} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">
                    {material.profiles?.name?.[0] || '?'}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{material.profiles?.name || '匿名用户'}</p>
                <p className="text-sm text-gray-500">
                  发布于 {new Date(material.created_at).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>

            {isAuthor && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href={`/knowledge/materials/${id}/edit`}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition text-center min-h-[40px] flex items-center justify-center"
                >
                  编辑
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition min-h-[40px]"
                >
                  删除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}