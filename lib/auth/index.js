import { supabase } from '../supabase/client'

// 用户角色枚举
export const USER_ROLES = {
  GUEST: 'guest',
  MEMBER: 'member',
  VIP: 'vip',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
}

// 角色权限级别（数字越大权限越高）
export const ROLE_LEVELS = {
  guest: 0,
  member: 1,
  vip: 2,
  admin: 3,
  super_admin: 4
}

/**
 * 注册新用户
 */
export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name
      }
    }
  })

  if (error) throw error
  return data
}

/**
 * 登录
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

/**
 * 登出
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * 获取当前用户
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * 获取用户资料（包含角色信息）
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

/**
 * 获取当前用户的完整资料
 */
export async function getCurrentProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  return await getProfile(user.id)
}

/**
 * 检查用户是否有指定角色或更高权限
 */
export function hasRole(userRole, requiredRole) {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole]
}

/**
 * 检查用户是否为 VIP
 */
export function isVIP(profile) {
  if (!profile || profile.role !== 'vip') return false

  // 检查 VIP 是否过期
  if (profile.vip_expires_at) {
    const expiresAt = new Date(profile.vip_expires_at)
    return expiresAt > new Date()
  }

  return false
}

/**
 * 更新用户资料
 */
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * 修改密码
 */
export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) throw error
  return data
}

/**
 * 发送密码重置邮件
 */
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
}

/**
 * 监听认证状态变化
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}