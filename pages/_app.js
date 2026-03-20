import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase/client'
import { getUnreadMessageCount } from '../lib/messages'
import { ToastProvider } from '../components/Toast'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取初始会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      // 静默处理错误，不影响用户体验
    } finally {
      setLoading(false)
    }
  }

  return (
    <ToastProvider>
      <Head>
        <title>第二曲线 · 成都AI创客社区</title>
        <meta name="description" content="成都AI创客的聚集地 —— 链接技术人、产品经理、创业者，一起把AI想法变成现实" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo-icon.jpg" />
      </Head>
      <div className="min-h-screen bg-white">
        <Header user={user} profile={profile} loading={loading} />
        <main>
          <Component {...pageProps} user={user} profile={profile} />
        </main>
        <Footer />
      </div>
    </ToastProvider>
  )
}

function Header({ user, profile, loading }) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const isActive = (path) => router.pathname === path

  // 获取未读消息数量
  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      // 每30秒刷新一次未读数量
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchUnreadCount = async () => {
    if (user) {
      const { count } = await getUnreadMessageCount(user.id)
      setUnreadCount(count)
    }
  }

  const navItems = [
    { href: '/', label: '首页' },
    { href: '/knowledge', label: '知识库' },
    { href: '/cases', label: '实战案例' },
    { href: '/resources', label: '资源对接' },
    { href: '/forum', label: '论坛' },
    { href: '/events', label: '活动' },
    { href: '/about', label: '关于' },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUserMenuOpen(false)
    router.push('/')
  }

  const getRoleBadge = (role) => {
    const badges = {
      vip: { text: 'VIP', class: 'bg-yellow-100 text-yellow-800' },
      admin: { text: '管理员', class: 'bg-blue-100 text-blue-800' },
      super_admin: { text: '超管', class: 'bg-purple-100 text-purple-800' }
    }
    return badges[role] || null
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center">
            <div className="h-9 w-9 relative flex-shrink-0">
              <Image
                src="/logo-icon.jpg"
                alt="第二曲线"
                width={36}
                height={36}
                className="object-contain rounded-lg"
              />
            </div>
            <span className="ml-2 font-bold text-gray-900">第二曲线</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} active={isActive(item.href)}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            {!loading && (
              <>
                {user ? (
                  <>
                    {/* 消息图标 */}
                    <Link
                      href="/messages"
                      className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
                      title="站内信"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </Link>

                    <div className="relative">
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center space-x-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition"
                      >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                        {profile?.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="hidden sm:block text-left">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {profile?.name || user.email?.split('@')[0]}
                          </span>
                          {profile?.role && getRoleBadge(profile.role) && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadge(profile.role).class}`}>
                              {getRoleBadge(profile.role).text}
                            </span>
                          )}
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          个人中心
                        </Link>
                        {profile?.role === 'vip' && (
                          <Link
                            href="/vip"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            VIP会员
                          </Link>
                        )}
                        {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            后台管理
                          </Link>
                        )}
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                          退出登录
                        </button>
                      </div>
                    )}
                  </div>
                </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-gray-600 hover:text-gray-900 text-sm font-medium transition"
                    >
                      登录
                    </Link>
                    <Link
                      href="/register"
                      className="bg-gray-900 text-white px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
                    >
                      注册
                    </Link>
                  </>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
              aria-label="菜单"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive(item.href)
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <hr className="my-2 border-gray-100" />
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  个人中心
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleSignOut()
                  }}
                  className="block w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-gray-50"
                >
                  退出登录
                </button>
              </>
            ) : (
              <div className="flex space-x-2 px-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-gray-800"
                >
                  注册
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}

function NavLink({ href, children, active }) {
  return (
    <Link href={href} className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${
      active ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
    }`}>
      {children}
    </Link>
  )
}

function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="h-8 w-8 relative flex-shrink-0">
              <Image
                src="/logo-icon.jpg"
                alt="第二曲线"
                width={32}
                height={32}
                className="object-contain rounded-lg"
              />
            </div>
            <span className="ml-2 font-bold text-gray-900">第二曲线</span>
          </div>
          <div className="flex space-x-6 text-sm text-gray-500">
            <Link href="/knowledge" className="hover:text-gray-900 transition">知识库</Link>
            <Link href="/cases" className="hover:text-gray-900 transition">实战案例</Link>
            <Link href="/resources" className="hover:text-gray-900 transition">资源对接</Link>
            <Link href="/about" className="hover:text-gray-900 transition">关于</Link>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-6 pt-6 text-center text-sm text-gray-400">
          <p>© 2026 第二曲线 · 成都AI创客社区</p>
        </div>
      </div>
    </footer>
  )
}
