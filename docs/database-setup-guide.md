# 🗄️ 数据库配置完整指南

按照以下步骤完成数据库配置，让所有新功能正常运行。

---

## 📋 配置清单

- [ ] 第一步：执行数据库迁移脚本
- [ ] 第二步：创建图片存储桶
- [ ] 第三步：验证配置是否成功

---

## 第一步：执行数据库迁移脚本

### 1. 打开 Supabase SQL Editor

1. 访问：https://supabase.com/dashboard
2. 选择你的项目：`kzaelebbujxhsonsrtzu`
3. 点击左侧菜单的 **SQL Editor**
4. 点击 **New Query** 创建新查询

### 2. 复制并执行脚本

**完整脚本内容：**

```sql
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

-- 8. 为案例删除权限添加策略（更新现有策略）
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

-- 9. 为成员墙删除权限添加策略
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

-- 10. 创建成员墙更新触发器
DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 数据库扩展完成！
-- ========================================
```

### 3. 执行步骤

1. 复制上面的完整脚本
2. 粘贴到 SQL Editor 中
3. 点击右下角的 **Run** 按钮
4. 等待执行成功（应该显示 "Success. No rows returned"）

### 4. 预期结果

如果成功，你会看到类似这样的输出：
```
Success. No rows returned
```

如果出现错误，请截图发给我。

---

## 第二步：创建图片存储桶

### 1. 进入 Storage 页面

1. 在 Supabase 左侧菜单中
2. 点击 **Storage** 图标（像一个文件夹）

### 2. 创建新存储桶

1. 点击右上角的 **New Bucket** 按钮
2. 在弹出的表单中填写：
   - **Name**: `images`
   - **Public bucket**: ✅ 勾选（重要！）
   - **File size limit**: 5242880（5MB，可选）
   - **Allowed MIME types**: `image/jpeg,image/png,image/jpg,image/gif`（可选）

3. 点击 **Create bucket**

### 3. 验证存储桶

创建成功后，你应该在 Storage 列表中看到：
```
images (public)
```

### 4. 配置 CORS（可选但推荐）

如果遇到跨域问题，需要配置 CORS：

1. 点击 `images` bucket
2. 点击 **Configuration** 标签
3. 在 **CORS Configuration** 中添加：

```json
[
  {
    "allowedOrigins": ["*"],
    "allowedMethods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "allowedHeaders": ["*"],
    "maxAgeSeconds": 3600
  }
]
```

4. 点击 **Save**

---

## 第三步：验证配置是否成功

### 1. 验证数据表

在 Supabase 中：

1. 点击左侧 **Table Editor**
2. 检查是否有以下新表：
   - ✅ `knowledge_items` 表已创建
   - ✅ `profiles` 表有 `avatar_url` 字段
   - ✅ `cases` 表有 `author_id`, `images`, `thumbnail` 字段
   - ✅ `members` 表有 `user_id`, `avatar_url` 字段

### 2. 验证 RLS 策略

在 SQL Editor 中运行：

```sql
-- 查看 knowledge_items 的 RLS 策略
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'knowledge_items';
```

应该看到 4 条策略：
- Knowledge items are viewable by everyone
- Members can create knowledge items
- Authors and admins can update knowledge items
- Authors and admins can delete knowledge items

### 3. 测试图片上传

在本地开发环境测试：

```bash
# 启动开发服务器
npm run dev
```

访问 http://localhost:3000，尝试：
1. 登录账户
2. 进入"资源对接"页面
3. 点击"发布到成员墙"
4. 尝试上传一张头像图片

如果能看到上传进度或成功提示，说明配置成功！

---

## 🚨 常见问题

### 问题1: "permission denied for table"

**原因**: RLS 策略未正确设置

**解决**:
```sql
-- 临时禁用 RLS 测试
ALTER TABLE knowledge_items DISABLE ROW LEVEL SECURITY;

-- 测试完成后重新启用
ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;
```

### 问题2: "storage bucket not found"

**原因**: Storage bucket 未创建或名称错误

**解决**:
- 确认 bucket 名称是 `images`（全小写）
- 确认已勾选 Public bucket

### 问题3: 图片上传失败

**可能原因**:
1. Storage bucket 未设置为 public
2. 文件大小超过限制
3. CORS 配置问题

**解决**:
1. 检查 bucket 设置
2. 尝试上传小于 5MB 的图片
3. 配置 CORS（见上文）

---

## ✅ 配置完成检查清单

完成以上步骤后，确认：

- [ ] SQL 脚本执行成功，无错误
- [ ] `knowledge_items` 表已创建
- [ ] `profiles` 表有 `avatar_url` 字段
- [ ] `cases` 表有 `author_id`, `images`, `thumbnail` 字段
- [ ] `members` 表有 `user_id`, `avatar_url` 字段
- [ ] Storage 中创建了 `images` bucket
- [ ] `images` bucket 设置为 public
- [ ] 本地测试图片上传成功

---

## 📸 需要帮助？

如果在配置过程中遇到任何问题：

1. 截图错误信息
2. 告诉我具体的错误消息
3. 我会帮你快速解决

---

## 🎯 下一步

配置完成后：

1. ✅ 网站会自动部署（Vercel）
2. ✅ 所有新功能可以正常使用
3. ✅ 用户可以上传图片、发布内容

配置是**一次性的**，完成后所有功能都可以正常使用！