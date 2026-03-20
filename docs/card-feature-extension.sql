-- ========================================
-- 名片功能数据库扩展
-- ========================================

-- 扩展 profiles 表，添加名片相关字段
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS company VARCHAR(255),
ADD COLUMN IF NOT EXISTS position VARCHAR(255),
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS website VARCHAR(500),
ADD COLUMN IF NOT EXISTS wechat VARCHAR(100),
ADD COLUMN IF NOT EXISTS weibo VARCHAR(100),
ADD COLUMN IF NOT EXISTS twitter VARCHAR(100),
ADD COLUMN IF NOT EXISTS github VARCHAR(100),
ADD COLUMN IF NOT EXISTS linkedin VARCHAR(100),
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS show_on_member_wall BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS show_on_needs BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS needs TEXT,
ADD COLUMN IF NOT EXISTS can_provide TEXT,
ADD COLUMN IF NOT EXISTS looking_for TEXT;

-- 创建名片访问记录表
CREATE TABLE IF NOT EXISTS card_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_user_id UUID REFERENCES profiles(id) NOT NULL,
  viewer_id UUID REFERENCES profiles(id),
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE card_views ENABLE ROW LEVEL SECURITY;

-- card_views RLS 策略
DROP POLICY IF EXISTS "Users can view their own card views" ON card_views;
CREATE POLICY "Users can view their own card views"
  ON card_views FOR SELECT
  USING (card_user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create card views" ON card_views;
CREATE POLICY "Users can create card views"
  ON card_views FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_profiles_show_member_wall ON profiles(show_on_member_wall);
CREATE INDEX IF NOT EXISTS idx_profiles_show_needs ON profiles(show_on_needs);
CREATE INDEX IF NOT EXISTS idx_card_views_user ON card_views(card_user_id);

-- ========================================
-- 完成！
-- ========================================