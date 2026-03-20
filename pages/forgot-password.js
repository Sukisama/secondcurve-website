import { useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { supabase } from '../lib/supabase/client'

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSuccess(true)
    } catch (error) {
      setError(error.message || '发送重置邮件失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <Head>
          <title>邮件已发送 - 第二曲线</title>
        </Head>
        <div className="min-h-[calc(100vh-3.5rem-8rem)] flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">邮件已发送</h2>
            <p className="text-gray-600 mb-6">
              我们已向 <strong>{email}</strong> 发送了密码重置链接。<br />
              请检查您的收件箱（和垃圾邮件文件夹）。
            </p>
            <Link
              href="/login"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition"
            >
              返回登录
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>忘记密码 - 第二曲线</title>
      </Head>
      <div className="min-h-[calc(100vh-3.5rem-8rem)] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">忘记密码？</h1>
            <p className="text-gray-600">输入您的邮箱地址，我们将发送重置链接</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? '发送中...' : '发送重置链接'}
            </button>

            <p className="text-center text-sm text-gray-600 mt-6">
              想起密码了？{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                返回登录
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  )
}