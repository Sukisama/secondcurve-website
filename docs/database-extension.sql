-- ========================================
-- 第二曲线网站数据库扩展脚本
-- 支持新功能：图片上传、成员墙发布、案例发布、知识库优化
-- ========================================

-- 1. 扩展 profiles 表，添加头像字段
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. 扩展 cases 表，添加作者和图片字段
ALTER TABLE cases
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS thumbnail TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. 扩展 members 表（资源对接成员墙），添加用户关联
ALTER TABLE members
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. 创建知识库表
CREATE TABLE IF NOT EXISTS knowledge_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'learning_material', 'tool', 'topic_series'
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

-- 5. 为 knowledge_items 添加触发器
DROP TRIGGER IF EXISTS update_knowledge_items_updated_at ON knowledge_items;
CREATE TRIGGER update_knowledge_items_updated_at
  BEFORE UPDATE ON knowledge_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. 启用 knowledge_items 的 RLS
ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;

-- 7. knowledge_items RLS 策略
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

-- 8. 创建图片存储桶（需要通过 Supabase Dashboard 操作，这里只是注释说明）
-- 在 Supabase Dashboard 中创建名为 'images' 的存储桶
-- 设置为 public，允许用户上传图片

-- 9. 为案例删除权限添加策略（更新现有策略）
-- 作者和管理员可以删除案例
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

-- 10. 为成员墙删除权限添加策略
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

-- 11. 创建成员墙更新触发器
DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 数据库扩展完成！
-- ========================================