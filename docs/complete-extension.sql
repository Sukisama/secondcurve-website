-- ========================================
-- 完整数据库扩展脚本
-- 包含：积分系统、站内信、精华帖、测试数据
-- ========================================

-- ========== 第一部分：表结构扩展 ==========

-- 1. 扩展 profiles 表，添加积分字段
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- 2. 创建积分记录表
CREATE TABLE IF NOT EXISTS point_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  points INTEGER NOT NULL,
  reason VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'post', 'case', 'event', 'elite_post', 'manual'
  related_id UUID, -- 关联的帖子/案例/活动ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建站内信表
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'private', -- 'private', 'system', 'notification'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 扩展 posts 表，添加精华帖字段
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS is_elite BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS elite_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS elite_by UUID REFERENCES profiles(id);

-- 5. 创建积分设置表
CREATE TABLE IF NOT EXISTS point_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action VARCHAR(100) NOT NULL UNIQUE,
  points INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 插入默认积分设置
INSERT INTO point_settings (action, points, description) VALUES
('create_post', 10, '发布帖子'),
('create_case', 50, '发布实战案例'),
('join_event', 20, '参加活动'),
('elite_post', 100, '帖子被设为精华'),
('comment_post', 5, '评论帖子')
ON CONFLICT (action) DO NOTHING;

-- ========== 第二部分：RLS 策略 ==========

-- 启用 RLS
ALTER TABLE point_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_settings ENABLE ROW LEVEL SECURITY;

-- point_records RLS 策略
DROP POLICY IF EXISTS "Users can view own point records" ON point_records;
CREATE POLICY "Users can view own point records"
  ON point_records FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert point records" ON point_records;
CREATE POLICY "System can insert point records"
  ON point_records FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- messages RLS 策略
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (receiver_id = auth.uid() OR sender_id = auth.uid());

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own messages" ON messages;
CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (receiver_id = auth.uid());

-- point_settings RLS 策略（所有人可读，仅管理员可写）
DROP POLICY IF EXISTS "Point settings are viewable by everyone" ON point_settings;
CREATE POLICY "Point settings are viewable by everyone"
  ON point_settings FOR SELECT
  USING (true);

-- ========== 第三部分：索引优化 ==========

CREATE INDEX IF NOT EXISTS idx_point_records_user ON point_records(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_posts_elite ON posts(is_elite);

-- ========== 第四部分：测试用户数据 ==========

-- 注意：这里需要通过 Supabase Auth API 创建用户
-- 以下SQL只是插入 profiles 数据，实际用户需要通过注册页面创建
-- 密码统一为：test1234

-- ========== 完成！ ==========