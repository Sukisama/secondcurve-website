import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase/client'

export default function Transactions({ user, profile }) {
  const router = useRouter()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/profile/transactions')
      return
    }

    fetchTransactions()
  }, [user, router])

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeText = (type) => {
    const types = {
      vip_purchase: 'VIP会员购买',
      event_payment: '活动报名费',
      refund: '退款'
    }
    return types[type] || type
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: '处理中', class: 'bg-yellow-100 text-yellow-800' },
      completed: { text: '已完成', class: 'bg-green-100 text-green-800' },
      failed: { text: '失败', class: 'bg-red-100 text-red-800' },
      refunded: { text: '已退款', class: 'bg-gray-100 text-gray-800' }
    }
    return badges[status] || { text: status, class: 'bg-gray-100 text-gray-800' }
  }

  const formatAmount = (amount, type) => {
    const prefix = type === 'refund' ? '+' : '-'
    return `${prefix}¥${amount.toFixed(2)}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user || !profile) {
    return (
      <div className="min-h-[calc(100vh-3.5rem-8rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 面包屑导航 */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link href="/profile" className="hover:text-gray-900 transition">个人中心</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900">充值记录</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">充值记录</h1>
          <p className="text-sm text-gray-600 mt-1">查看您的所有交易记录</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无交易记录</h3>
            <p className="text-gray-600 mb-6">您还没有任何交易记录</p>
            <Link
              href="/vip"
              className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition"
            >
              开通VIP会员
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* 统计信息 */}
            <div className="px-6 py-4 bg-gray-50">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{transactions.length}</div>
                  <div className="text-sm text-gray-600">总交易笔数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    ¥{transactions
                      .filter(t => t.type !== 'refund' && t.status === 'completed')
                      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                      .toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">总消费金额</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    ¥{transactions
                      .filter(t => t.type === 'refund' && t.status === 'refunded')
                      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                      .toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">总退款金额</div>
                </div>
              </div>
            </div>

            {/* 交易列表 */}
            {transactions.map((transaction) => {
              const status = getStatusBadge(transaction.status)
              return (
                <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        transaction.type === 'refund' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {transaction.type === 'vip_purchase' ? (
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        ) : transaction.type === 'event_payment' ? (
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{getTypeText(transaction.type)}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.class}`}>
                            {status.text}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{transaction.description || '无描述'}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(transaction.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        transaction.type === 'refund' ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {formatAmount(transaction.amount, transaction.type)}
                      </div>
                      {transaction.payment_method && (
                        <div className="text-xs text-gray-500 mt-1">
                          {transaction.payment_method === 'wechat' ? '微信支付' : transaction.payment_method}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}