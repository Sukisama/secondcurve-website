import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase/client'

export default function VIP({ user, profile }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    if (!user) {
      router.push('/login?redirect=/vip')
      return
    }

    setLoading(true)
    try {
      // TODO: 集成微信支付
      alert('支付功能即将上线，请联系客服开通VIP会员')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const isVIP = profile?.role === 'vip' && profile?.vip_expires_at && new Date(profile.vip_expires_at) > new Date()

  const benefits = [
    {
      icon: '🎫',
      title: '无限次参加线下活动',
      description: '全年任意参加社区举办的线下交流活动、技术分享会'
    },
    {
      icon: '⭐',
      title: '专属VIP标识',
      description: '在论坛、个人主页展示VIP会员专属徽章'
    },
    {
      icon: '💬',
      title: '优先回复权',
      description: '在论坛发布的求助帖优先获得社区专家回复'
    },
    {
      icon: '🎁',
      title: '专属优惠',
      description: '享受合作商家专属折扣和福利'
    }
  ]

  return (
    <div className="min-h-[calc(100vh-3.5rem-8rem)] py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">VIP 年卡会员</h1>
          <p className="text-base sm:text-xl text-gray-600">解锁全部特权，享受无限可能</p>
        </div>

        {/* 价格卡片 */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl sm:rounded-3xl shadow-xl border border-yellow-200 p-6 sm:p-8 mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">年卡会员</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">有效期：开通后365天内有效</p>
              <div className="flex items-baseline justify-center sm:justify-start">
                <span className="text-4xl sm:text-5xl font-bold text-gray-900">¥188</span>
                <span className="text-lg sm:text-xl text-gray-600 ml-2">/年</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">平均每天仅需 ¥0.51</p>
            </div>
            <div className="text-center sm:text-right">
              {isVIP ? (
                <div>
                  <div className="text-green-600 font-semibold mb-2 text-sm sm:text-base">您已是VIP会员</div>
                  <div className="text-xs sm:text-sm text-gray-600 mb-4">
                    有效期至：{new Date(profile.vip_expires_at).toLocaleDateString('zh-CN')}
                  </div>
                  <button
                    onClick={() => alert('续费功能即将上线')}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-medium transition min-h-[48px] w-full sm:w-auto"
                  >
                    续费会员
                  </button>
                </div>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={loading}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 sm:px-8 py-3.5 sm:py-3 rounded-xl font-medium transition disabled:opacity-50 min-h-[48px] w-full sm:w-auto"
                >
                  {loading ? '处理中...' : '立即开通'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 特权列表 */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">会员特权</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition"
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="text-3xl sm:text-4xl flex-shrink-0">{benefit.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{benefit.title}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 常见问题 */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">常见问题</h2>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Q: VIP会员可以退费吗？</h3>
              <p className="text-gray-600 text-xs sm:text-sm">A: VIP会员费用一经支付不支持退款，请谨慎购买。</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Q: 如何参加线下活动？</h3>
              <p className="text-gray-600 text-xs sm:text-sm">A: VIP会员可在活动页面直接报名，无需支付额外费用。活动前会收到短信提醒。</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Q: 年卡到期后会自动续费吗？</h3>
              <p className="text-gray-600 text-xs sm:text-sm">A: 不会自动续费，到期后需要手动续费。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}