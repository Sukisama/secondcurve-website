/**
 * 内容卡片骨架屏
 */
export function CardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-100 rounded w-5/6 mb-4"></div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="h-3 bg-gray-100 rounded w-24"></div>
          </div>
        </div>
      ))}
    </>
  )
}

/**
 * 列表项骨架屏
 */
export function ListItemSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border-b border-gray-100 p-6 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-5/6 mb-3"></div>
              <div className="flex items-center gap-4">
                <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                <div className="h-3 bg-gray-100 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

/**
 * 事件卡片骨架屏
 */
export function EventSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-full"></div>
            </div>
            <div className="w-32 h-32 bg-gray-200 rounded-xl ml-4"></div>
          </div>
          <div className="grid grid-cols-4 gap-4 py-4 border-t border-gray-100">
            <div className="h-4 bg-gray-100 rounded"></div>
            <div className="h-4 bg-gray-100 rounded"></div>
            <div className="h-4 bg-gray-100 rounded"></div>
            <div className="h-4 bg-gray-100 rounded"></div>
          </div>
        </div>
      ))}
    </>
  )
}

/**
 * 论坛帖子骨架屏
 */
export function ForumPostSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-6 border-b border-gray-100 animate-pulse">
          <div className="flex items-start space-x-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-5 bg-gray-200 rounded w-16"></div>
                <div className="h-5 bg-gray-100 rounded w-20"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-5/6 mb-3"></div>
              <div className="flex items-center space-x-4">
                <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-100 rounded w-24"></div>
                <div className="h-4 bg-gray-100 rounded w-16"></div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center space-x-4">
            <div className="h-4 bg-gray-100 rounded w-12"></div>
            <div className="h-4 bg-gray-100 rounded w-12"></div>
            <div className="h-4 bg-gray-100 rounded w-12"></div>
          </div>
        </div>
      ))}
    </>
  )
}

/**
 * 通用加载指示器
 */
export function LoadingSpinner({ size = 'default' }) {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12'
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-b-2 border-gray-900 ${sizeClasses[size]}`}></div>
    </div>
  )
}

/**
 * 页面加载骨架
 */
export function PageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
      <div className="h-4 bg-gray-100 rounded w-96 mb-8"></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardSkeleton count={6} />
      </div>
    </div>
  )
}