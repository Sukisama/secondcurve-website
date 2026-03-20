import { supabase } from './supabase/client'

/**
 * 点赞帖子
 */
export async function likePost(postId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '请先登录' }
  }

  try {
    // 检查是否已点赞
    const { data: existing } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return { error: '已经点赞过了' }
    }

    // 添加点赞
    const { error } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: user.id
      })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error liking post:', error)
    return { error: '点赞失败' }
  }
}

/**
 * 取消点赞
 */
export async function unlikePost(postId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '请先登录' }
  }

  try {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error unliking post:', error)
    return { error: '取消点赞失败' }
  }
}

/**
 * 收藏帖子
 */
export async function favoritePost(postId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '请先登录' }
  }

  try {
    // 检查是否已收藏
    const { data: existing } = await supabase
      .from('post_favorites')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return { error: '已经收藏过了' }
    }

    // 添加收藏
    const { error } = await supabase
      .from('post_favorites')
      .insert({
        post_id: postId,
        user_id: user.id
      })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error favoriting post:', error)
    return { error: '收藏失败' }
  }
}

/**
 * 取消收藏
 */
export async function unfavoritePost(postId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '请先登录' }
  }

  try {
    const { error } = await supabase
      .from('post_favorites')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error unfavoriting post:', error)
    return { error: '取消收藏失败' }
  }
}

/**
 * 检查用户是否点赞了帖子
 */
export async function checkPostLiked(postId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { liked: false }
  }

  try {
    const { data } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    return { liked: !!data }
  } catch (error) {
    return { liked: false }
  }
}

/**
 * 检查用户是否收藏了帖子
 */
export async function checkPostFavorited(postId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { favorited: false }
  }

  try {
    const { data } = await supabase
      .from('post_favorites')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    return { favorited: !!data }
  } catch (error) {
    return { favorited: false }
  }
}

/**
 * 获取用户点赞的帖子列表
 */
export async function getUserLikedPosts(userId, limit = 20, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('post_likes')
      .select(`
        created_at,
        posts (
          id,
          title,
          content,
          category,
          likes_count,
          favorites_count,
          views,
          created_at,
          profiles:author_id(name, avatar_url, role)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return { data: data?.map(item => ({
      ...item.posts,
      liked_at: item.created_at
    })) || [] }
  } catch (error) {
    console.error('Error fetching liked posts:', error)
    return { data: [], error: '获取失败' }
  }
}

/**
 * 获取用户收藏的帖子列表
 */
export async function getUserFavoritePosts(userId, limit = 20, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('post_favorites')
      .select(`
        created_at,
        posts (
          id,
          title,
          content,
          category,
          likes_count,
          favorites_count,
          views,
          created_at,
          profiles:author_id(name, avatar_url, role)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return { data: data?.map(item => ({
      ...item.posts,
      favorited_at: item.created_at
    })) || [] }
  } catch (error) {
    console.error('Error fetching favorite posts:', error)
    return { data: [], error: '获取失败' }
  }
}