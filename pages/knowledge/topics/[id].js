import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../../../lib/supabase/client'
import { useToast } from '../../../components/Toast'

export default function TopicSeriesDetail() {
  const router = useRouter()
  const { id } = router.query
  const [series, setSeries] = useState(null)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const toast = useToast()

  useEffect(() => {
    // 获取用户信息
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
      fetchSeries()
    }
  }, [id])

  const fetchSeries = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_items')
        .select('*')
        .eq('id', id)
        .eq('type', 'topic_series')
        .single()

      if (error) throw error

      // 检查VIP权限
      if (data.is_vip_only && (!profile || profile.role !== 'vip')) {
        toast.warning('此专题仅限VIP会员查看')
        router.push('/vip')
        return
      }

      setSeries(data)
      // 这里可以加载专题下的文章列表
      setArticles([])
    } catch (error) {
      toast.error('加载失败')
      router.push('/knowledge')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  if (!series) return null

  return (
    <>
      <Head>
        <title>{series.title} - 专题系列 | 第二曲线</title>
      </Head>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/knowledge" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
          ← 返回知识库
        </Link>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
              VIP专属
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{series.title}</h1>
          <p className="text-gray-600 mb-6">{series.description}</p>

          {series.cover_image && (
            <img src={series.cover_image} alt={series.title} className="w-full rounded-xl mb-6" />
          )}

          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: series.content }} />
        </div>

        {articles.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>专题内容整理中，敬请期待...</p>
          </div>
        )}
      </div>
    </>
  )
}