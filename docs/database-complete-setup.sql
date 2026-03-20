-- ========================================
-- 完整数据库初始化脚本（包含所有表）
-- 执行时间：约10秒
-- ========================================

-- 步骤 1: 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 步骤 2: 创建 members 表（成员墙）
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  skills TEXT[],
  looking TEXT,
  avatar VARCHAR(10) DEFAULT '👤',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 步骤 3: 创建 knowledge_items 表（知识库）
CREATE TABLE IF NOT EXISTS knowledge_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  link TEXT,
  cover_image TEXT,
  author_id UUID REFERENCES profiles(id),
  is_vip_only BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 步骤 4: 扩展现有表
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE cases
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS thumbnail TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE members
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 步骤 5: 添加触发器
DROP TRIGGER IF EXISTS update_knowledge_items_updated_at ON knowledge_items;
CREATE TRIGGER update_knowledge_items_updated_at
  BEFORE UPDATE ON knowledge_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 步骤 6: 启用 RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;

-- 步骤 7: members RLS 策略
DROP POLICY IF EXISTS "Members are viewable by everyone" ON members;
CREATE POLICY "Members are viewable by everyone"
  ON members FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create members" ON members;
CREATE POLICY "Authenticated users can create members"
  ON members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete own member profile" ON members;
CREATE POLICY "Users can delete own member profile"
  ON members FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- 步骤 8: knowledge_items RLS 策略
DROP POLICY IF EXISTS "Knowledge items are viewable by everyone" ON knowledge_items;
CREATE POLICY "Knowledge items are viewable by everyone"
  ON knowledge_items FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Members can create knowledge items" ON knowledge_items;
CREATE POLICY "Members can create knowledge items"
  ON knowledge_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('member', 'vip', 'admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Authors and admins can update knowledge items" ON knowledge_items;
CREATE POLICY "Authors and admins can update knowledge items"
  ON knowledge_items FOR UPDATE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Authors and admins can delete knowledge items" ON knowledge_items;
CREATE POLICY "Authors and admins can delete knowledge items"
  ON knowledge_items FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- 步骤 9: cases 删除权限策略
DROP POLICY IF EXISTS "Authors and admins can delete cases" ON cases;
CREATE POLICY "Authors and admins can delete cases"
  ON cases FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- ========================================
-- 完成！
-- ========================================