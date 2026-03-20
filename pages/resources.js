import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../lib/supabase/client'
import { useToast } from '../components/Toast'

export default function Resources({ user, profile }) {
  const [activeTab, setActiveTab] = useState('members')
  const [members, setMembers] = useState([])
  const [needs, setNeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const toast = useToast()

  // 角色标识徽章
  const RoleBadge = ({ role }) => {
    if (!role || role === 'member' || role === 'guest') return null

    const badges = {
      vip: {
        label: 'VIP',
        className: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-medium'
      },
      admin: {
        label: '管理员',
        className: 'bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium'
      },
      super_admin: {
        label: '超管',
        className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-medium'
      }
    }

    const badge = badges[role]
    if (!badge) return null

    return <span className={badge.className}>{badge.label}</span>
  }

  // 加载数据
  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers()
    } else {
      fetchNeeds()
    }
  }, [activeTab])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('show_on_member_wall', true)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error('加载成员数据失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchNeeds = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('show_on_needs', true)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setNeeds(data || [])
    } catch (error) {
      console.error('Error fetching needs:', error)
      toast.error('加载需求数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 搜索过滤
  const filteredMembers = members.filter(member => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      member.name?.toLowerCase().includes(query) ||
      member.company?.toLowerCase().includes(query) ||
      member.position?.toLowerCase().includes(query) ||
      member.skills?.some(skill => skill.toLowerCase().includes(query)) ||
      member.location?.toLowerCase().includes(query)
    )
  })

  const filteredNeeds = needs.filter(need => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      need.name?.toLowerCase().includes(query) ||
      need.needs?.toLowerCase().includes(query) ||
      need.can_provide?.toLowerCase().includes(query) ||
      need.looking_for?.toLowerCase().includes(query) ||
      need.skills?.some(skill => skill.toLowerCase().includes(query))
    )
  })

  return (
    <>
      <Head>
        <title>资源对接 - 让对的人找到对的人 | 第二曲线</title>
        <meta name="description" content="成都AI创客社区资源对接平台，找合伙人、找项目、求职招聘，让对的人找到对的人。" />
      </Head>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">资源对接</h1>
              <p className="text-gray-500 text-lg">让对的人找到对的人</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-8 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-4 px-4 text-sm font-medium transition ${
              activeTab === 'members'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            成员墙
          </button>
          <button
            onClick={() => setActiveTab('needs')}
            className={`pb-4 px-4 text-sm font-medium transition ${
              activeTab === 'needs'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            需求广场
          </button>
        </div>

        {/* 搜索框 */}
        <div className="mb-8">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={activeTab === 'members' ? '搜索成员姓名、公司、技能...' : '搜索需求、技能...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {activeTab === 'members' ? (
          loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">加载中...</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-500">
                共找到 {filteredMembers.length} 位成员
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.length === 0 ? (
                  <div className="col-span-full text-center py-16 text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-lg">暂无成员信息</p>
                    {user && (
                      <Link
                        href="/card/edit"
                        className="mt-4 inline-block text-gray-600 hover:text-gray-900 underline"
                      >
                        成为第一个展示的人
                      </Link>
                    )}
                  </div>
                ) : (
                  filteredMembers.map((member) => (
                    <div key={member.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-lg transition">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 flex items-center justify-center text-white text-2xl font-bold">
                          {member.avatar_url ? (
                            <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            member.name?.charAt(0) || '?'
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-gray-900 truncate">{member.name}</h3>
                            <RoleBadge role={member.role} />
                          </div>
                          {member.position && (
                            <p className="text-sm text-gray-600 truncate">{member.position}</p>
                          )}
                          {member.company && (
                            <p className="text-sm text-gray-500 truncate">{member.company}</p>
                          )}
                        </div>
                      </div>

                      {member.bio && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{member.bio}</p>
                      )}

                      {member.skills && member.skills.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">技能</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {member.skills.slice(0, 4).map((skill, i) => (
                              <span key={i} className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">
                                {skill}
                              </span>
                            ))}
                            {member.skills.length > 4 && (
                              <span className="text-gray-500 text-xs py-1">+{member.skills.length - 4}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {member.location && (
                        <div className="flex items-center text-xs text-gray-500 mb-4">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {member.location}
                        </div>
                      )}

                      <button
                        onClick={() => toast.info('请关注微信公众号「第二曲线AI社区」联系社区成员！')}
                        className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
                      >
                        联系 TA
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )
        ) : (
          loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">加载中...</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-500">
                共找到 {filteredNeeds.length} 条需求
              </div>
              <div className="space-y-4">
                {filteredNeeds.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg">暂无需求信息</p>
                    {user && (
                      <Link
                        href="/card/edit"
                        className="mt-4 inline-block text-gray-600 hover:text-gray-900 underline"
                      >
                        发布第一条需求
                      </Link>
                    )}
                  </div>
                ) : (
                  filteredNeeds.map((need) => (
                    <div key={need.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-lg transition">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-500 flex-shrink-0 flex items-center justify-center text-white text-xl font-bold">
                          {need.avatar_url ? (
                            <img src={need.avatar_url} alt={need.name} className="w-full h-full object-cover" />
                          ) : (
                            need.name?.charAt(0) || '?'
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-gray-900">{need.name}</h3>
                            <RoleBadge role={need.role} />
                          </div>
                          {need.position && need.company && (
                            <p className="text-sm text-gray-500">{need.position} · {need.company}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {need.looking_for && (
                          <div className="bg-blue-50 rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              正在寻找
                            </h4>
                            <p className="text-sm text-blue-800">{need.looking_for}</p>
                          </div>
                        )}

                        {need.needs && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">需要的帮助</h4>
                            <p className="text-sm text-gray-600">{need.needs}</p>
                          </div>
                        )}

                        {need.can_provide && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">可以提供的帮助</h4>
                            <p className="text-sm text-gray-600">{need.can_provide}</p>
                          </div>
                        )}

                        {need.skills && need.skills.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">技能标签</h4>
                            <div className="flex flex-wrap gap-2">
                              {need.skills.map((skill, i) => (
                                <span key={i} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-400">
                          更新于 {new Date(need.updated_at || need.created_at).toLocaleDateString('zh-CN')}
                        </span>
                        <button
                          onClick={() => toast.info('请关注微信公众号「第二曲线AI社区」联系社区成员！')}
                          className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
                        >
                          联系 TA
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )
        )}

        {/* 引导卡片 */}
        <div className="mt-16">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-10 text-center">
            <h2 className="text-xl font-bold text-white mb-3">展示你的名片</h2>
            <p className="text-gray-400 mb-6">完善名片信息，展示在成员墙和需求广场</p>
            <Link
              href={user ? '/card/edit' : '/login?redirect=/card/edit'}
              className="inline-block bg-white text-gray-900 px-7 py-3 rounded-xl font-medium hover:bg-gray-100 transition"
            >
              {user ? '编辑名片' : '登录后编辑名片'}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}