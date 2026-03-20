import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase/client'
import MemberPublishModal from '../components/MemberPublishModal'
import { useToast } from '../components/Toast'

const filters = ['全部', '找合伙人', '找项目', '求职', '招聘']

export default function Resources({ user, profile }) {
  const [activeTab, setActiveTab] = useState('members')
  const [activeFilter, setActiveFilter] = useState('全部')
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const toast = useToast()

  // 加载成员数据
  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers()
    }
  }, [activeTab])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      toast.error('加载成员数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMember = async (memberId, memberUserId) => {
    // 权限检查：用户只能删除自己的，管理员可以删除所有人的
    const canDelete = user && (memberUserId === user.id || profile?.role === 'admin' || profile?.role === 'super_admin')

    if (!canDelete) {
      toast.error('您没有权限删除此成员')
      return
    }

    if (!confirm('确定要删除这个成员信息吗？')) {
      return
    }

    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      toast.success('删除成功')
      fetchMembers()
    } catch (error) {
      toast.error('删除失败，请重试')
    }
  }

  const handlePublishSuccess = () => {
    fetchMembers()
  }
  const allNeeds = [
    { id: 1, type: '找合伙人', title: 'AI教育产品寻技术合伙人', author: '李华', date: '2026-03-18', description: '已有清晰的产品规划和种子用户，需要一位懂LLM开发的技术合伙人', tags: ['教育', 'LLM', '合伙人'] },
    { id: 2, type: '找项目', title: 'RAG系统开发者找项目参与', author: '张明', date: '2026-03-15', description: '有丰富的RAG和LangChain开发经验，想参与有意思的项目', tags: ['RAG', 'LangChain', '兼职'] },
    { id: 3, type: '招聘', title: '某公司招聘AI产品经理', author: 'HR小吴', date: '2026-03-12', description: '成都本地AI创业公司，薪资open，期权激励', tags: ['成都', '全职', '产品经理'] },
  ]

  const filteredNeeds = activeFilter === '全部'
    ? allNeeds
    : allNeeds.filter(need => need.type === activeFilter)

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
            {user && activeTab === 'members' && (
              <button
                onClick={() => setShowPublishModal(true)}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>发布到成员墙</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-10 border-b border-gray-100">
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

        {activeTab === 'members' ? (
          loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">加载中...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {members.length === 0 ? (
                <div className="col-span-full text-center py-16 text-gray-400">
                  <p className="text-lg">暂无成员信息</p>
                  {user && (
                    <button
                      onClick={() => setShowPublishModal(true)}
                      className="mt-4 text-gray-600 hover:text-gray-900 underline"
                    >
                      成为第一个发布的人
                    </button>
                  )}
                </div>
              ) : (
                members.map((member) => {
                  const canDelete = user && (member.user_id === user.id || profile?.role === 'admin' || profile?.role === 'super_admin')

                  return (
                    <div key={member.id} className="border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition relative group">
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteMember(member.id, member.user_id)}
                          className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                          title="删除"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          {member.avatar_url ? (
                            <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              {member.avatar || '👤'}
                            </div>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="font-bold text-gray-900 truncate">{member.name}</h3>
                          <p className="text-sm text-gray-500 truncate">{member.role}</p>
                        </div>
                      </div>
                      <div className="mt-5">
                        <h4 className="text-xs font-medium text-gray-400 mb-2">技能</h4>
                        <div className="flex flex-wrap gap-2">
                          {member.skills?.map((skill, i) => (
                            <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      {member.looking && (
                        <div className="mt-5 p-4 bg-gray-50 rounded-xl">
                          <h4 className="text-xs font-medium text-gray-400 mb-1">寻找</h4>
                          <p className="text-sm text-gray-600">{member.looking}</p>
                        </div>
                      )}
                      <button
                        onClick={() => toast.info('请关注微信公众号「第二曲线AI社区」联系社区成员！')}
                        className="mt-5 w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
                      >
                        联系 TA
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          )
        ) : (
          <div>
            <div className="flex flex-wrap gap-2 mb-8">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    activeFilter === filter
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredNeeds.map((need) => (
                <div key={need.id} className="border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                        {need.type}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mt-4">{need.title}</h3>
                      <p className="text-gray-500 mt-2">{need.description}</p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {need.tags.map((tag, i) => (
                          <span key={i} className="bg-gray-50 text-gray-600 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-400">
                      {need.author} · {need.date}
                    </span>
                    <button
                      onClick={() => toast.info('请关注微信公众号「第二曲线AI社区」查看需求详情！')}
                      className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
                    >
                      查看详情
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredNeeds.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg">暂无「{activeFilter}」类型的需求</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-16">
          <div className="bg-gray-900 rounded-3xl p-10 text-center">
            <h2 className="text-xl font-bold text-white mb-3">发布你的需求</h2>
            <p className="text-gray-400 mb-6">找人、找项目、找工作，都可以在这里发布</p>
            <button
              onClick={() => toast.info('请关注微信公众号「第二曲线AI社区」发布你的需求！')}
              className="bg-white text-gray-900 px-7 py-3 rounded-xl font-medium hover:bg-gray-100 transition"
            >
              发布需求
            </button>
          </div>
        </div>
      </div>

      {/* 发布成员墙弹窗 */}
      {showPublishModal && (
        <MemberPublishModal
          user={user}
          profile={profile}
          onClose={() => setShowPublishModal(false)}
          onSuccess={handlePublishSuccess}
        />
      )}
    </>
  )
}
