import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../../../lib/supabase/client'
import { useToast } from '../../../components/Toast'

export default function ToolDetail() {
  const router = useRouter()
  const { id } = router.query
  const [tool, setTool] = useState(null)
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
      fetchTool()
    }
  }, [id])

  const fetchTool = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_items')
        .select('*, profiles(name, avatar, role)')
        .eq('id', id)
        .eq('type', 'tool')
        .single()

      if (error) throw error
      setTool(data)
    } catch (error) {
      toast.error('加载失败')
      router.push('/knowledge/tools')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除此工具吗？')) return

    try {
      const { error } = await supabase
        .from('knowledge_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('删除成功')
      router.push('/knowledge/tools')
    } catch (error) {
      toast.error('删除失败')
    }
  }

  const isVIP = profile?.role === 'vip' && profile?.vip_expires_at && new Date(profile.vip_expires_at) > new Date()
  const isAuthor = user && tool?.author_id === user.id

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  if (!tool) return null

  // VIP专属内容但用户不是VIP
  if (tool.is_vip_only && !isVIP) {
    return (
      <>
        <Head>
          <title>{tool.title} - 工具库 | 第二曲线</title>
        </Head>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/knowledge/tools" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
            ← 返回工具库
          </Link>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-12 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">VIP专属内容</h2>
              <p className="text-gray-600 mb-1">此工具仅限VIP会员查看</p>
              <p className="text-sm text-gray-500">{tool.title}</p>
            </div>

            <Link
              href="/vip"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition"
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
        <title>{tool.title} - 工具库 | 第二曲线</title>
      </Head>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/knowledge/tools" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
          ← 返回工具库
        </Link>

        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            {tool.is_vip_only && (
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                VIP专属
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{tool.title}</h1>

          {tool.description && (
            <p className="text-gray-600 mb-6">{tool.description}</p>
          )}

          {tool.cover_image && (
            <img src={tool.cover_image} alt={tool.title} className="w-full rounded-xl mb-6" />
          )}

          {tool.content && (
            <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: tool.content }} />
          )}

          {tool.link && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">工具链接</p>
              <a
                href={tool.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-900 font-medium hover:underline"
              >
                访问工具
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              {tool.profiles?.avatar ? (
                <img src={tool.profiles.avatar} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">
                    {tool.profiles?.name?.[0] || '?'}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{tool.profiles?.name || '匿名用户'}</p>
                <p className="text-sm text-gray-500">
                  添加于 {new Date(tool.created_at).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>

            {isAuthor && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/knowledge/tools/${id}/edit`}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  编辑
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
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