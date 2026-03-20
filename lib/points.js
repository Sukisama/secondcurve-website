import { supabase } from './supabase/client'
import { notifyPointsChange } from './messages'

/**
 * 积分工具函数
 * 用于自动奖励积分和管理积分记录
 */

/**
 * 奖励积分
 * @param {string} userId - 用户ID
 * @param {string} actionKey - 操作键
 * @param {object} options - 可选配置
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function awardPoints(userId, actionKey, options = {}) {
  try {
    // 1. 获取积分设置
    const { data: setting, error: settingError } = await supabase
      .from('point_settings')
      .select('*')
      .eq('action_key', actionKey)
      .eq('is_active', true)
      .single()

    if (settingError || !setting) {
      console.log(`Point setting not found or inactive: ${actionKey}`)
      return { success: false, error: '积分规则不存在或未启用' }
    }

    const points = options.customPoints || setting.points
    const description = options.description || setting.description

    // 2. 创建积分记录
    const { error: recordError } = await supabase
      .from('point_records')
      .insert([{
        user_id: userId,
        points: points,
        action_key: actionKey,
        action_name: setting.action_name,
        description: description,
        admin_user_id: options.adminUserId || null
      }])

    if (recordError) {
      console.error('Error creating point record:', recordError)
      return { success: false, error: '创建积分记录失败' }
    }

    // 3. 更新用户总积分
    const { error: updateError } = await supabase.rpc('increment_user_points', {
      user_id: userId,
      points_to_add: points
    })

    // 如果 RPC 函数不存在，使用直接更新方式
    if (updateError && updateError.code === 'PGRST202') {
      // 获取当前积分
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        return { success: false, error: '获取用户信息失败' }
      }

      // 更新积分
      const { error: updateError2 } = await supabase
        .from('profiles')
        .update({
          total_points: (profile.total_points || 0) + points
        })
        .eq('id', userId)

      if (updateError2) {
        console.error('Error updating user points:', updateError2)
        return { success: false, error: '更新积分失败' }
      }
    } else if (updateError) {
      console.error('Error updating user points:', updateError)
      return { success: false, error: '更新积分失败' }
    }

    // 发送积分变动通知
    await notifyPointsChange(userId, points, description)

    return { success: true, points }
  } catch (error) {
    console.error('Error awarding points:', error)
    return { success: false, error: '奖励积分失败' }
  }
}

/**
 * 扣除积分
 * @param {string} userId - 用户ID
 * @param {number} points - 扣除的积分数
 * @param {string} reason - 扣除原因
 * @param {string} adminUserId - 管理员ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deductPoints(userId, points, reason, adminUserId) {
  try {
    // 1. 创建积分记录（负数）
    const { error: recordError } = await supabase
      .from('point_records')
      .insert([{
        user_id: userId,
        points: -points,
        action_key: 'admin_deduct',
        action_name: '管理员扣除积分',
        description: reason,
        admin_user_id: adminUserId
      }])

    if (recordError) {
      console.error('Error creating point record:', recordError)
      return { success: false, error: '创建积分记录失败' }
    }

    // 2. 更新用户总积分
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('total_points')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return { success: false, error: '获取用户信息失败' }
    }

    const newPoints = Math.max(0, (profile.total_points || 0) - points)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ total_points: newPoints })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user points:', updateError)
      return { success: false, error: '更新积分失败' }
    }

    // 发送积分变动通知
    await notifyPointsChange(userId, -points, reason)

    return { success: true, points: -points }
  } catch (error) {
    console.error('Error deducting points:', error)
    return { success: false, error: '扣除积分失败' }
  }
}

/**
 * 获取用户积分记录
 * @param {string} userId - 用户ID
 * @param {number} limit - 限制数量
 * @returns {Promise<{data: array, error?: string}>}
 */
export async function getUserPointRecords(userId, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('point_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching point records:', error)
      return { data: [], error: '获取积分记录失败' }
    }

    return { data: data || [] }
  } catch (error) {
    console.error('Error getting user point records:', error)
    return { data: [], error: '获取积分记录失败' }
  }
}

/**
 * 获取积分排行榜
 * @param {number} limit - 限制数量
 * @returns {Promise<{data: array, error?: string}>}
 */
export async function getLeaderboard(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, avatar, total_points, role')
      .order('total_points', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching leaderboard:', error)
      return { data: [], error: '获取排行榜失败' }
    }

    return { data: data || [] }
  } catch (error) {
    console.error('Error getting leaderboard:', error)
    return { data: [], error: '获取排行榜失败' }
  }
}

/**
 * 获取所有积分设置
 * @returns {Promise<{data: array, error?: string}>}
 */
export async function getPointSettings() {
  try {
    const { data, error } = await supabase
      .from('point_settings')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching point settings:', error)
      return { data: [], error: '获取积分设置失败' }
    }

    return { data: data || [] }
  } catch (error) {
    console.error('Error getting point settings:', error)
    return { data: [], error: '获取积分设置失败' }
  }
}

/**
 * 更新积分设置
 * @param {string} settingId - 设置ID
 * @param {object} updates - 更新内容
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updatePointSetting(settingId, updates) {
  try {
    const { error } = await supabase
      .from('point_settings')
      .update(updates)
      .eq('id', settingId)

    if (error) {
      console.error('Error updating point setting:', error)
      return { success: false, error: '更新积分设置失败' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating point setting:', error)
    return { success: false, error: '更新积分设置失败' }
  }
}

/**
 * 创建新的积分设置
 * @param {object} setting - 积分设置
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function createPointSetting(setting) {
  try {
    const { error } = await supabase
      .from('point_settings')
      .insert([setting])

    if (error) {
      console.error('Error creating point setting:', error)
      return { success: false, error: '创建积分设置失败' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error creating point setting:', error)
    return { success: false, error: '创建积分设置失败' }
  }
}

/**
 * 删除积分设置
 * @param {string} settingId - 设置ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deletePointSetting(settingId) {
  try {
    const { error } = await supabase
      .from('point_settings')
      .delete()
      .eq('id', settingId)

    if (error) {
      console.error('Error deleting point setting:', error)
      return { success: false, error: '删除积分设置失败' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting point setting:', error)
    return { success: false, error: '删除积分设置失败' }
  }
}

/**
 * 便捷方法：发布帖子自动奖励积分
 */
export async function awardPostPoints(userId) {
  return await awardPoints(userId, 'create_post')
}

/**
 * 便捷方法：发布案例自动奖励积分
 */
export async function awardCasePoints(userId) {
  return await awardPoints(userId, 'create_case')
}

/**
 * 便捷方法：参加活动自动奖励积分
 */
export async function awardEventPoints(userId) {
  return await awardPoints(userId, 'join_event')
}

/**
 * 便捷方法：发表评论自动奖励积分
 */
export async function awardCommentPoints(userId) {
  return await awardPoints(userId, 'create_comment')
}

/**
 * 便捷方法：精华帖奖励积分
 */
export async function awardFeaturedPostPoints(userId) {
  return await awardPoints(userId, 'post_featured')
}