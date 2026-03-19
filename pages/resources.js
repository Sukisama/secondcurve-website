import { useState, useEffect } from 'react'
import { getData } from '../lib/data'

const filters = ['全部', '找合伙人', '找项目', '求职', '招聘']

export default function Resources() {
  const [activeTab, setActiveTab] = useState('members')
  const [data, setData] = useState(null)

  useEffect(() => {
    setData(getData())
  }, [])

  const members = data?.members || []
  const needs = [
    { id: 1, type: '找合伙人', title: 'AI教育产品寻技术合伙人', author: '李华', date: '2026-03-18', description: '已有清晰的产品规划和种子用户，需要一位懂LLM开发的技术合伙人', tags: ['教育', 'LLM', '合伙人'] },
    { id: 2, type: '找项目', title: 'RAG系统开发者找项目参与', author: '张明', date: '2026-03-15', description: '有丰富的RAG和LangChain开发经验，想参与有意思的项目', tags: ['RAG', 'LangChain', '兼职'] },
    { id: 3, type: '招聘', title: '某公司招聘AI产品经理', author: 'HR小吴', date: '2026-03-12', description: '成都本地AI创业公司，薪资open，期权激励', tags: ['成都', '全职', '产品经理'] },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">资源对接</h1>
        <p className="text-gray-500 text-lg">让对的人找到对的人</p>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {members.map((member) => (
            <div key={member.id} className="border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{member.avatar}</div>
                <div className="flex-grow">
                  <h3 className="font-bold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.role}</p>
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
              <div className="mt-5 p-4 bg-gray-50 rounded-xl">
                <h4 className="text-xs font-medium text-gray-400 mb-1">寻找</h4>
                <p className="text-sm text-gray-600">{member.looking}</p>
              </div>
              <button className="mt-5 w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition">
                联系 TA
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap gap-2 mb-8">
            {filters.map((filter, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  index === 0
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {needs.map((need) => (
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
                  <button className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition">
                    查看详情
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-16">
        <div className="bg-gray-900 rounded-3xl p-10 text-center">
          <h2 className="text-xl font-bold text-white mb-3">发布你的需求</h2>
          <p className="text-gray-400 mb-6">找人、找项目、找工作，都可以在这里发布</p>
          <button className="bg-white text-gray-900 px-7 py-3 rounded-xl font-medium hover:bg-gray-100 transition">
            发布需求
          </button>
        </div>
      </div>
    </div>
  )
}
