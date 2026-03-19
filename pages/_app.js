import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>第二曲线 · 成都AI创客社区</title>
        <meta name="description" content="成都AI创客的聚集地 —— 链接技术人、产品经理、创业者，一起把AI想法变成现实" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo-icon.jpg" />
      </Head>
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </>
  )
}

function Header() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path) => router.pathname === path

  const navItems = [
    { href: '/', label: '首页' },
    { href: '/knowledge', label: '知识库' },
    { href: '/cases', label: '实战案例' },
    { href: '/resources', label: '资源对接' },
    { href: '/about', label: '关于' },
  ]

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
            <button
              onClick={() => alert('💬 请关注微信公众号「第二曲线AI社区」加入我们！')}
              className="hidden sm:block bg-gray-900 text-white px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
            >
              加入社区
            </button>

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
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                alert('💬 请关注微信公众号「第二曲线AI社区」加入我们！')
              }}
              className="w-full mt-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
            >
              加入社区
            </button>
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
