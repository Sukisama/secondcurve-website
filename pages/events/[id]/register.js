import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase/client'
import { useToast } from '../../../components/Toast'

export default function EventRegister({ user, profile }) {
  const router = useRouter()
  const { id } = router.query
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    position: '',
    remarks: ''
  })
  const [errors, setErrors] = useState({})
  const toast = useToast()

  useEffect(() => {
    if (id) {
      fetchEvent()
    }
  }, [id])

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || '',
        company: profile.company || '',
        position: profile.position || ''
      }))
    }
  }, [profile])

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setEvent(data)

      // 检查是否已报名
      if (user) {
        const { data: registration } = await supabase
          .from('event_registrations')
          .select('id')
          .eq('event_id', id)
          .eq('user_id', user.id)
          .single()

        if (registration) {
          toast.error('您已经报名过此活动')
          router.push('/events')
        }
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      router.push('/events')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号'
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入正确的手机号'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      toast.error('请先登录')
      router.push('/login?redirect=/events/' + id + '/register')
      return
    }

    if (!validateForm()) {
      return
    }

    // 检查活动是否已满员
    if (event.max_participants && event.current_participants >= event.max_participants) {
      toast.error('活动已满员')
      return
    }

    setSubmitting(true)

    try {
      // 创建报名记录
      const { error: registrationError } = await supabase
        .from('event_registrations')
        .insert({
          event_id: id,
          user_id: user.id,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          company: formData.company.trim(),
          position: formData.position.trim(),
          remarks: formData.remarks.trim(),
          status: 'registered'
        })

      if (registrationError) throw registrationError

      // 更新活动参与人数
      const { error: updateError } = await supabase
        .from('events')
        .update({
          current_participants: (event.current_participants || 0) + 1
        })
        .eq('id', id)

      if (updateError) throw updateError

      toast.success('报名成功！')
      router.push('/profile/events')
    } catch (error) {
      console.error('Error registering event:', error)
      toast.error('报名失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !event) {
    return (
      <div className="min-h-[calc(100vh-3.5rem-8rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  const isVIP = profile?.role === 'vip' && profile?.vip_expires_at && new Date(profile.vip_expires_at) > new Date()
  const isFull = event.max_participants && event.current_participants >= event.max_participants

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 返回按钮 */}
      <Link
        href="/events"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回活动列表
      </Link>

      {/* 活动信息 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h1>

          <div className="space-y-3 text-gray-600">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(event.event_date).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}</span>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{event.location}</span>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={isVIP ? 'text-yellow-600 font-semibold' : ''}>
                {isVIP ? 'VIP免费' : `¥${event.price_non_vip || 68}`}
              </span>
            </div>
            {event.max_participants && (
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>
                  已报名 {event.current_participants || 0} / {event.max_participants} 人
                  {isFull && <span className="text-red-600 ml-2">已满员</span>}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VIP 提示 */}
      {isVIP && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">⭐</div>
            <div>
              <p className="font-semibold text-yellow-900">VIP会员专享</p>
              <p className="text-sm text-yellow-700">您是VIP会员，可免费报名参加此活动</p>
            </div>
          </div>
        </div>
      )}

      {/* 报名表单 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">填写报名信息</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 姓名 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.name ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="请输入姓名"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          {/* 手机号 */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              手机号 <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.phone ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="请输入手机号"
            />
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
            )}
          </div>

          {/* 公司 */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              公司
            </label>
            <input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="请输入公司名称"
            />
          </div>

          {/* 职位 */}
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
              职位
            </label>
            <input
              id="position"
              name="position"
              type="text"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="请输入职位"
            />
          </div>

          {/* 备注 */}
          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
              备注
            </label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              placeholder="其他需要说明的信息..."
            />
          </div>

          {/* 提交按钮 */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting || isFull}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? '提交中...' : isFull ? '已满员' : '立即报名'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}