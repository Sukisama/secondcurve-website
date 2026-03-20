-- ========================================
-- 第二曲线网站 - 功能完善数据库迁移脚本
-- 包含：点赞收藏、成员编号系统
-- 请在 Supabase SQL Editor 中执行此脚本
-- ========================================

-- ==========================================
-- 第一部分：论坛点赞和收藏功能
-- ==========================================

-- 1. 创建帖子点赞表
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 2. 创建帖子收藏表
CREATE TABLE IF NOT EXISTS post_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 3. 为 posts 表添加点赞和收藏计数字段
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS favorites_count INTEGER DEFAULT 0;

-- 4. 启用 RLS
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_favorites ENABLE ROW LEVEL SECURITY;

-- 5. post_likes RLS 策略
DROP POLICY IF EXISTS "Post likes are viewable by everyone" ON post_likes;
CREATE POLICY "Post likes are viewable by everyone"
  ON post_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Members can like posts" ON post_likes;
CREATE POLICY "Members can like posts"
  ON post_likes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('member', 'vip', 'admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Users can unlike own likes" ON post_likes;
CREATE POLICY "Users can unlike own likes"
  ON post_likes FOR DELETE
  USING (user_id = auth.uid());

-- 6. post_favorites RLS 策略
DROP POLICY IF EXISTS "Post favorites are viewable by everyone" ON post_favorites;
CREATE POLICY "Post favorites are viewable by everyone"
  ON post_favorites FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Members can favorite posts" ON post_favorites;
CREATE POLICY "Members can favorite posts"
  ON post_favorites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('member', 'vip', 'admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Users can unfavorite own favorites" ON post_favorites;
CREATE POLICY "Users can unfavorite own favorites"
  ON post_favorites FOR DELETE
  USING (user_id = auth.uid());

-- 7. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_favorites_post ON post_favorites(post_id);
CREATE INDEX IF NOT EXISTS idx_post_favorites_user ON post_favorites(user_id);

-- 8. 创建触发器函数：更新帖子点赞数
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 9. 创建触发器函数：更新帖子收藏数
CREATE OR REPLACE FUNCTION update_post_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET favorites_count = favorites_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET favorites_count = GREATEST(favorites_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 10. 创建触发器
DROP TRIGGER IF EXISTS on_post_like_changed ON post_likes;
CREATE TRIGGER on_post_like_changed
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

DROP TRIGGER IF EXISTS on_post_favorite_changed ON post_favorites;
CREATE TRIGGER on_post_favorite_changed
  AFTER INSERT OR DELETE ON post_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_post_favorites_count();

-- ==========================================
-- 第二部分：成员编号系统
-- ==========================================

-- 1. 为 profiles 表添加成员编号字段
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS member_code VARCHAR(20) UNIQUE;

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_profiles_member_code ON profiles(member_code);

-- 3. 创建生成成员编号的函数
CREATE OR REPLACE FUNCTION generate_member_code()
RETURNS VARCHAR AS $$
DECLARE
  new_code VARCHAR(20);
  max_num INTEGER;
BEGIN
  -- 获取当前最大编号数字
  SELECT COALESCE(MAX(CAST(SUBSTRING(member_code FROM 5) AS INTEGER)), 10000)
  INTO max_num
  FROM profiles
  WHERE member_code ~ '^DEQX[0-9]+$';

  -- 生成新编号（最大编号 + 1）
  new_code := 'DEQX' || (max_num + 1)::TEXT;

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 4. 创建触发器：新用户注册时自动生成成员编号
CREATE OR REPLACE FUNCTION auto_generate_member_code()
RETURNS TRIGGER AS $$
BEGIN
  -- 如果新用户没有成员编号，则自动生成
  IF NEW.member_code IS NULL THEN
    NEW.member_code := generate_member_code();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 删除已存在的触发器（如果有）
DROP TRIGGER IF EXISTS auto_member_code_on_insert ON profiles;

-- 6. 创建触发器
CREATE TRIGGER auto_member_code_on_insert
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_member_code();

-- 7. 为现有用户生成成员编号
UPDATE profiles
SET member_code = generate_member_code()
WHERE member_code IS NULL;

-- ========================================
-- 完成！所有功能已添加
-- ========================================

-- 验证结果
SELECT
  'post_likes 表' as feature,
  COUNT(*) as count
FROM post_likes
UNION ALL
SELECT
  'post_favorites 表' as feature,
  COUNT(*) as count
FROM post_favorites
UNION ALL
SELECT
  '带成员编号的用户数' as feature,
  COUNT(*) as count
FROM profiles
WHERE member_code IS NOT NULL;