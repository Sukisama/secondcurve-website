import { useEffect } from 'react'
import { useRouter } from 'next/router'

/**
 * 权限级别定义
 */
export const ROLE_LEVELS = {
  guest: 0,
  member: 1,
  vip: 2,
  admin: 3,
  super_admin: 4
}

/**
 * 检查用户是否具有指定角色或更高权限
 */
export function hasPermission(userRole, requiredRole) {
  if (!userRole || !requiredRole) return false
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole]
}

/**
 * 检查用户是否为VIP（且未过期）
 */
export function isVIP(profile) {
  if (!profile || profile.role !== 'vip') return false

  if (profile.vip_expires_at) {
    const expiresAt = new Date(profile.vip_expires_at)
    return expiresAt > new Date()
  }

  return false
}

/**
 * 检查用户是否可以发布内容
 */
export function canPostContent(profile) {
  if (!profile) return false
  return hasPermission(profile.role, 'member')
}

/**
 * 检查用户是否可以参加免费活动
 */
export function canJoinFreeEvent(profile) {
  if (!profile) return false
  return isVIP(profile)
}

/**
 * 检查用户是否可以访问后台
 */
export function canAccessAdmin(profile) {
  if (!profile) return false
  return hasPermission(profile.role, 'admin')
}

/**
 * 检查用户是否为超级管理员
 */
export function isSuperAdmin(profile) {
  if (!profile) return false
  return profile.role === 'super_admin'
}

/**
 * 高阶组件：保护需要权限的页面
 */
export function withAuth(Component, requiredRole = 'member') {
  return function AuthenticatedComponent(props) {
    const router = useRouter()
    const { user, profile } = props

    useEffect(() => {
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`)
      } else if (!hasPermission(profile?.role, requiredRole)) {
        router.push('/403')
      }
    }, [user, profile, router])

    if (!user || !hasPermission(profile?.role, requiredRole)) {
      return (
        <div className="min-h-[calc(100vh-3.5rem-8rem)] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">验证权限中...</p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}

/**
 * Hook: 在组件中检查权限
 */
export function usePermission(profile, requiredRole) {
  const router = useRouter()

  useEffect(() => {
    if (profile && !hasPermission(profile.role, requiredRole)) {
      router.push('/403')
    }
  }, [profile, requiredRole, router])

  return profile ? hasPermission(profile.role, requiredRole) : false
}