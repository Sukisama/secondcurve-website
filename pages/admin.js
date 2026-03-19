import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { defaultData, saveData as persistData } from '../lib/data'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('cases')
  const [data, setData] = useState(defaultData)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    const saved = localStorage.getItem('secondcurve_data')
    if (saved) {
      setData(JSON.parse(saved))
    }
  }, [])

  const saveData = (newData) => {
    setData(newData)
    persistData(newData)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newData = { ...data }
    if (editingItem) {
      newData[activeTab] = newData[activeTab].map(item =>
        item.id === editingItem.id ? { ...item, ...formData } : item
      )
    } else {
      formData.id = Date.now()
      newData[activeTab] = [...(newData[activeTab] || []), formData]
    }
    saveData(newData)
    setEditingItem(null)
    setFormData({})
  }

  const deleteItem = (id) => {
    if (confirm('确定要删除吗？')) {
      const newData = { ...data }
      newData[activeTab] = newData[activeTab].filter(item => item.id !== id)
      saveData(newData)
    }
  }

  const editItem = (item) => {
    setEditingItem(item)
    setFormData(item)
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'secondcurve-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result)
          saveData(imported)
          alert('导入成功！')
        } catch (err) {
          alert('导入失败，请检查文件格式')
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <>
      <Head>
        <title>后台管理 | 第二曲线</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← 返回首页</Link>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>开发者工具</strong> · 此页面仅供本地数据管理使用，数据保存在浏览器本地存储中。
          </p>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">后台管理</h1>
          <div className="flex gap-3">
            <label className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition cursor-pointer">
              导入数据
              <input type="file" accept=".json" onChange={importData} className="hidden" />
            </label>
            <button onClick={exportData} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
              导出数据
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {[
            { key: 'cases', label: '实战案例' },
            { key: 'members', label: '成员' },
            { key: 'events', label: '活动' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setEditingItem(null); setFormData({}) }}
              className={`pb-4 px-4 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {editingItem ? '编辑' : '新增'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'cases' && (
                  <>
                    <input
                      type="text"
                      placeholder="标题"
                      value={formData.title || ''}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="分类"
                      value={formData.category || ''}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                    <textarea
                      placeholder="描述"
                      value={formData.description || ''}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      rows={3}
                    />
                    <input
                      type="text"
                      placeholder="作者"
                      value={formData.author || ''}
                      onChange={e => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="标签（逗号分隔）"
                      value={formData.tags?.join(', ') || ''}
                      onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                  </>
                )}
                {activeTab === 'members' && (
                  <>
                    <input
                      type="text"
                      placeholder="姓名"
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="角色"
                      value={formData.role || ''}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="技能（逗号分隔）"
                      value={formData.skills?.join(', ') || ''}
                      onChange={e => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="寻找什么"
                      value={formData.looking || ''}
                      onChange={e => setFormData({ ...formData, looking: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="头像（emoji）"
                      value={formData.avatar || ''}
                      onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                  </>
                )}
                {activeTab === 'events' && (
                  <>
                    <input
                      type="text"
                      placeholder="日期（MM-DD）"
                      value={formData.date || ''}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="标题"
                      value={formData.title || ''}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="地点"
                      value={formData.location || ''}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                  </>
                )}
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-gray-900 text-white py-2 rounded-xl font-medium hover:bg-gray-800 transition">
                    {editingItem ? '保存' : '添加'}
                  </button>
                  {editingItem && (
                    <button type="button" onClick={() => { setEditingItem(null); setFormData({}) }} className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                      取消
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-3">
              {(data[activeTab] || []).map(item => (
                <div key={item.id} className="border border-gray-200 rounded-xl p-4 flex items-start justify-between">
                  <div>
                    {activeTab === 'cases' && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{item.category}</span>
                        </div>
                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        <div className="flex gap-2 mt-2">
                          {item.tags?.map((tag, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{tag}</span>
                          ))}
                        </div>
                      </>
                    )}
                    {activeTab === 'members' && (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.avatar}</span>
                          <div>
                            <h3 className="font-bold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.role}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {item.skills?.map((skill, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{skill}</span>
                          ))}
                        </div>
                      </>
                    )}
                    {activeTab === 'events' && (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="text-center bg-gray-100 px-3 py-2 rounded-lg min-w-[60px]">
                            <div className="text-lg font-bold text-gray-900">{item.date?.split('-')[1]}</div>
                            <div className="text-xs text-gray-500">{item.date?.split('-')[0]}月</div>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.location}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editItem(item)} className="p-2 text-gray-400 hover:text-gray-600 transition">
                      ✏️
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
