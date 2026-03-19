import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>第二曲线 · 成都AI创客社区</title>
        <meta name="description" content="成都AI创客的聚集地" />
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

  const isActive = (path) => router.pathname === path

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

          <nav className="hidden md:flex items-center space-x-1">
            <NavLink href="/" active={isActive('/')}>首页</NavLink>
            <NavLink href="/knowledge" active={isActive('/knowledge')}>知识库</NavLink>
            <NavLink href="/cases" active={isActive('/cases')}>实战案例</NavLink>
            <NavLink href="/resources" active={isActive('/resources')}>资源对接</NavLink>
            <NavLink href="/about" active={isActive('/about')}>关于</NavLink>
            <NavLink href="/admin" active={isActive('/admin')}>管理</NavLink>
          </nav>

          <div className="flex items-center space-x-3">
            <button className="bg-gray-900 text-white px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition">
              加入社区
            </button>
          </div>
        </div>
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
