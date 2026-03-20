import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function EditCard() {
  const router = useRouter()

  useEffect(() => {
    // 重定向到统一的编辑页面
    router.replace('/profile/edit')
  }, [router])

  return (
    <div className="min-h-[calc(100vh-3.5rem-8rem)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">正在跳转...</p>
      </div>
    </div>
  )
}