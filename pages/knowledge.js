import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../lib/supabase/client'
import { useToast } from '../components/Toast'

export default function Knowledge() {
  const [series, setSeries] = useState([])
  const [materials, setMaterials] = useState([])
  const [tools, setTools] = useState([])
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
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [seriesRes, materialsRes, toolsRes] = await Promise.all([
        supabase.from('knowledge_items').select('*').eq('type', 'topic_series').order('created_at', { ascending: false }).limit(3),
        supabase.from('knowledge_items').select('*').eq('type', 'learning_material').order('created_at', { ascending: false }).limit(3),
        supabase.from('knowledge_items').select('*').eq('type', 'tool').order('created_at', { ascending: false }).limit(6)
      ])

      setSeries(seriesRes.data || [])
      setMaterials(materialsRes.data || [])
      setTools(toolsRes.data || [])
    } catch (error) {
      toast.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>知识库 | 第二曲线</title>
        <meta name="description" content="体系化的AI学习资料，涵盖大模型微调、AI产品设计、Prompt Engineering等专题" />
      </Head>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">知识库</h1>
          <p className="text-gray-500 text-lg">体系化的AI学习资料，让你少走弯路</p>
        </div>

        {/* Topic Series - VIP专属 */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">专题系列</h2>
              <p className="text-sm text-gray-500 mt-1">VIP会员专属内容</p>
            </div>
            <Link href="/knowledge/topics" className="text-sm text-gray-900 font-medium hover:underline">
              查看更多 →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {series.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-400">
                专题系列整理中...
              </div>
            ) : (
              series.map((s) => (
                <Link key={s.id} href={`/knowledge/topics/${s.id}`} className="border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition group">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                      VIP专属
                    </span>
                    {profile?.role !== 'vip' && (
                      <span className="text-xs text-gray-400">需要VIP会员</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm">{s.description}</p>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Learning Materials */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">学习资料</h2>
            <Link href="/knowledge/materials" className="text-sm text-gray-900 font-medium hover:underline">
              查看更多 →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {materials.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-400">
                暂无学习资料
              </div>
            ) : (
              materials.map((m) => (
                <div key={m.id} className="border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{m.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{m.description}</p>
                  {m.link && (
                    <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-900 font-medium hover:underline">
                      查看详情 →
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Tools */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">工具库</h2>
            <Link href="/knowledge/tools" className="text-sm text-gray-900 font-medium hover:underline">
              查看更多 →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-400">
                暂无工具
              </div>
            ) : (
              tools.map((tool) => (
                <div key={tool.id} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition">
                  <h3 className="font-bold text-gray-900">{tool.title}</h3>
                  <p className="text-gray-500 text-sm mt-2">{tool.description}</p>
                  {tool.link && (
                    <a href={tool.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm text-gray-900 font-medium hover:underline">
                      访问链接 →
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  )
}
