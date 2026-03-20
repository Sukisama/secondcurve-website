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

  // 检查是否为VIP
  const isVIP = profile?.role === 'vip' && profile?.vip_expires_at && new Date(profile.vip_expires_at) > new Date()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  if (!series) return null

  // VIP专属内容但用户不是VIP
  if (series.is_vip_only && !isVIP) {
    return (
      <>
        <Head>
          <title>{series.title} - 专题系列 | 第二曲线</title>
        </Head>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/knowledge" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
            ← 返回知识库
          </Link>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-12 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
                <svg className="w-10 h-10 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">VIP专属内容</h2>
              <p className="text-gray-600 mb-1">此专题仅限VIP会员查看</p>
              <p className="text-sm text-gray-500">{series.title}</p>
            </div>

            <div className="bg-white rounded-xl p-6 mb-6 max-w-md mx-auto">
              <h3 className="font-bold text-gray-900 mb-3">开通VIP会员即可享受</h3>
              <ul className="text-left text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  无限次参加线下活动
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  查看所有VIP专属内容
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  专属VIP会员群
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  更多特权...
                </li>
              </ul>
            </div>

            <Link
              href="/vip"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition"
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

  // VIP用户可以查看内容
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
            {series.is_vip_only && (
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                VIP专属
              </span>
            )}
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