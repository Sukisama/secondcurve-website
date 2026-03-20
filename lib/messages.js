import { supabase } from './supabase/client'

/**
 * 站内信工具函数
 * 用于管理站内消息系统
 */

/**
 * 发送私信
 * @param {string} senderId - 发送者ID
 * @param {string} receiverId - 接收者ID
 * @param {string} title - 消息标题
 * @param {string} content - 消息内容
 * @returns {Promise<{success: boolean, error?: string, data?: object}>}
 */
export async function sendMessage(senderId, receiverId, title, content) {
  try {
    // 不能给自己发送消息
    if (senderId === receiverId) {
      return { success: false, error: '不能给自己发送消息' }
    }

    // 检查接收者是否存在
    const { data: receiver, error: receiverError } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('id', receiverId)
      .single()

    if (receiverError || !receiver) {
      return { success: false, error: '接收者不存在' }
    }

    // 创建消息
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        sender_id: senderId,
        receiver_id: receiverId,
        title,
        content,
        is_read: false
      }])
      .select()
      .single()

    if (error) {
      console.error('Error sending message:', error)
      return { success: false, error: '发送消息失败' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending message:', error)
    return { success: false, error: '发送消息失败' }
  }
}

/**
 * 发送系统通知
 * @param {string} receiverId - 接收者ID
 * @param {string} title - 消息标题
 * @param {string} content - 消息内容
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendSystemNotification(receiverId, title, content) {
  try {
    const { error } = await supabase
      .from('messages')
      .insert([{
        sender_id: null, // 系统消息没有发送者
        receiver_id: receiverId,
        title,
        content,
        is_read: false,
        is_system: true
      }])

    if (error) {
      console.error('Error sending system notification:', error)
      return { success: false, error: '发送系统通知失败' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending system notification:', error)
    return { success: false, error: '发送系统通知失败' }
  }
}

/**
 * 获取用户收到的消息列表
 * @param {string} userId - 用户ID
 * @param {object} options - 可选配置
 * @param {boolean} options.unreadOnly - 仅未读消息
 * @param {number} options.limit - 限制数量
 * @param {number} options.offset - 偏移量
 * @returns {Promise<{data: array, error?: string}>}
 */
export async function getMessages(userId, options = {}) {
  try {
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey (id, name, avatar_url)
      `)
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false })

    if (options.unreadOnly) {
      query = query.eq('is_read', false)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching messages:', error)
      return { data: [], error: '获取消息失败' }
    }

    return { data: data || [] }
  } catch (error) {
    console.error('Error getting messages:', error)
    return { data: [], error: '获取消息失败' }
  }
}

/**
 * 获取消息详情
 * @param {string} messageId - 消息ID
 * @param {string} userId - 用户ID（验证权限）
 * @returns {Promise<{data: object, error?: string}>}
 */
export async function getMessage(messageId, userId) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey (id, name, avatar_url, email)
      `)
      .eq('id', messageId)
      .eq('receiver_id', userId)
      .single()

    if (error) {
      console.error('Error fetching message:', error)
      return { data: null, error: '获取消息详情失败' }
    }

    return { data }
  } catch (error) {
    console.error('Error getting message:', error)
    return { data: null, error: '获取消息详情失败' }
  }
}

/**
 * 标记消息为已读
 * @param {string} messageId - 消息ID
 * @param {string} userId - 用户ID（验证权限）
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function markMessageAsRead(messageId, userId) {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', messageId)
      .eq('receiver_id', userId)

    if (error) {
      console.error('Error marking message as read:', error)
      return { success: false, error: '标记已读失败' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error marking message as read:', error)
    return { success: false, error: '标记已读失败' }
  }
}

/**
 * 标记所有消息为已读
 * @param {string} userId - 用户ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function markAllMessagesAsRead(userId) {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('receiver_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Error marking all messages as read:', error)
      return { success: false, error: '标记已读失败' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error marking all messages as read:', error)
    return { success: false, error: '标记已读失败' }
  }
}

/**
 * 删除消息
 * @param {string} messageId - 消息ID
 * @param {string} userId - 用户ID（验证权限）
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteMessage(messageId, userId) {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('receiver_id', userId)

    if (error) {
      console.error('Error deleting message:', error)
      return { success: false, error: '删除消息失败' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting message:', error)
    return { success: false, error: '删除消息失败' }
  }
}

/**
 * 获取未读消息数量
 * @param {string} userId - 用户ID
 * @returns {Promise<{count: number, error?: string}>}
 */
export async function getUnreadMessageCount(userId) {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Error getting unread count:', error)
      return { count: 0, error: '获取未读数量失败' }
    }

    return { count: count || 0 }
  } catch (error) {
    console.error('Error getting unread message count:', error)
    return { count: 0, error: '获取未读数量失败' }
  }
}

/**
 * 搜索用户（用于发送私信时选择收件人）
 * @param {string} query - 搜索关键词
 * @param {string} currentUserId - 当前用户ID
 * @param {number} limit - 限制数量
 * @returns {Promise<{data: array, error?: string}>}
 */
export async function searchUsers(query, currentUserId, limit = 10) {
  try {
    if (!query || query.trim().length === 0) {
      return { data: [] }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, email')
      .neq('id', currentUserId)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(limit)

    if (error) {
      console.error('Error searching users:', error)
      return { data: [], error: '搜索用户失败' }
    }

    return { data: data || [] }
  } catch (error) {
    console.error('Error searching users:', error)
    return { data: [], error: '搜索用户失败' }
  }
}

/**
 * 便捷方法：精华帖通知
 * @param {string} userId - 用户ID
 * @param {string} postTitle - 帖子标题
 */
export async function notifyFeaturedPost(userId, postTitle) {
  return await sendSystemNotification(
    userId,
    '恭喜！您的帖子被评为精华帖',
    `您的帖子《${postTitle}》被评为精华帖，获得 50 积分奖励！感谢您的优质贡献。`
  )
}

/**
 * 便捷方法：积分变动通知
 * @param {string} userId - 用户ID
 * @param {number} points - 积分数量
 * @param {string} reason - 变动原因
 */
export async function notifyPointsChange(userId, points, reason) {
  const action = points > 0 ? '获得' : '扣除'
  return await sendSystemNotification(
    userId,
    `积分变动通知`,
    `您${action}了 ${Math.abs(points)} 积分。原因：${reason}`
  )
}

/**
 * 便捷方法：VIP到期提醒
 * @param {string} userId - 用户ID
 * @param {number} days - 剩余天数
 */
export async function notifyVIPExpiring(userId, days) {
  return await sendSystemNotification(
    userId,
    'VIP会员即将到期',
    `您的VIP会员将在 ${days} 天后到期，续费可继续享受VIP特权。`
  )
}