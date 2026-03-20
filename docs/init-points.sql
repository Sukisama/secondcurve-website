-- ========================================
-- 积分系统数据库表
-- 请在 Supabase SQL Editor 中执行此脚本
-- ========================================

-- 1. 积分设置表 (point_settings)
-- 存储各项操作的积分规则
CREATE TABLE IF NOT EXISTS point_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action_key VARCHAR(100) UNIQUE NOT NULL,
  action_name VARCHAR(200) NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 积分记录表 (point_records)
-- 记录每次积分变化
CREATE TABLE IF NOT EXISTS point_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  action_key VARCHAR(100) NOT NULL,
  action_name VARCHAR(200) NOT NULL,
  description TEXT,
  admin_user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 在 profiles 表中添加积分字段
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;

-- 4. 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_point_records_user_id ON point_records(user_id);
CREATE INDEX IF NOT EXISTS idx_point_records_created_at ON point_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_total_points ON profiles(total_points DESC);

-- 5. 触发器：自动更新 updated_at
DROP TRIGGER IF EXISTS update_point_settings_updated_at ON point_settings;
CREATE TRIGGER update_point_settings_updated_at
  BEFORE UPDATE ON point_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. 启用 Row Level Security
ALTER TABLE point_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_records ENABLE ROW LEVEL SECURITY;

-- 7. point_settings 表 RLS 策略
DROP POLICY IF EXISTS "Point settings are viewable by everyone" ON point_settings;
CREATE POLICY "Point settings are viewable by everyone"
  ON point_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage point settings" ON point_settings;
CREATE POLICY "Admins can manage point settings"
  ON point_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- 8. point_records 表 RLS 策略
DROP POLICY IF EXISTS "Users can view own point records" ON point_records;
CREATE POLICY "Users can view own point records"
  ON point_records FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can create point records" ON point_records;
CREATE POLICY "System can create point records"
  ON point_records FOR INSERT
  WITH CHECK (true);

-- 9. 插入默认积分规则
INSERT INTO point_settings (action_key, action_name, points, description) VALUES
  ('register', '注册账号', 100, '新用户注册成功获得初始积分'),
  ('create_post', '发布帖子', 10, '发布一篇新帖子'),
  ('create_case', '发布案例', 50, '发布一个新案例'),
  ('join_event', '参加活动', 20, '报名参加线下活动'),
  ('create_comment', '发表评论', 5, '对帖子或案例发表评论'),
  ('post_featured', '帖子被设为精华', 100, '发布的帖子被管理员设为精华'),
  ('daily_login', '每日登录', 5, '每日首次登录获得积分'),
  ('share_content', '分享内容', 10, '分享社区内容到社交媒体')
ON CONFLICT (action_key) DO NOTHING;

-- ========================================
-- 积分系统表创建完成！
-- ========================================