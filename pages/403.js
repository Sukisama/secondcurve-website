import Link from 'next/link'

export default function Forbidden() {
  return (
    <div className="min-h-[calc(100vh-3.5rem-8rem)] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-9xl font-bold text-gray-200 mb-4">403</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">权限不足</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          抱歉，您没有权限访问此页面。如果您认为这是一个错误，请联系管理员。
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Link
            href="/"
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition"
          >
            返回首页
          </Link>
          <Link
            href="/vip"
            className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            升级VIP
          </Link>
        </div>
      </div>
    </div>
  )
}