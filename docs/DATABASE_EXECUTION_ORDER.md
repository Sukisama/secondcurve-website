# 🗄️ 数据库脚本完整执行指南

## 重要说明

⚠️ **请严格按照以下顺序执行脚本**，否则可能会导致功能异常。

---

## 📋 执行顺序（推荐）

### 方案一：一键执行（推荐）✨

如果你想重新开始，可以直接执行这个综合脚本，它会包含所有内容：

```sql
-- 在 Supabase SQL Editor 中执行
-- 这个脚本包含所有功能所需的数据库结构
```

**文件位置：** 待创建 `docs/complete-database-setup.sql`

---

### 方案二：分步执行（详细）

如果需要分步执行或只执行特定功能，请按以下顺序：

#### 第一步：基础表结构（必须）✅

```sql
-- 1. 基础表和触发器
执行：docs/init-database.sql
```

**包含内容：**
- profiles 表（用户资料）
- posts 表（帖子）
- cases 表（案例）
- events 表（活动）
- knowledge_items 表（知识库）
- 基础触发器

---

#### 第二步：名片功能扩展 ✅

```sql
-- 2. 名片功能字段
执行：docs/card-feature-extension.sql
```

**包含内容：**
- profiles 表添加名片相关字段（bio, company, position等）
- card_views 表（名片浏览记录）

---

#### 第三步：积分系统 ✅

```sql
-- 3. 积分系统
执行：docs/complete-extension.sql
```

**包含内容：**
- point_records 表（积分记录）
- point_settings 表（积分设置）
- profiles 表添加 total_points 字段
- posts 表添加精华帖字段

---

#### 第四步：站内信系统 ✅

```sql
-- 4. 站内信系统
执行：docs/add-messages-table.sql
```

**包含内容：**
- messages 表（站内信）

---

#### 第五步：点赞收藏功能 ✅

```sql
-- 5. 点赞收藏功能
执行：docs/add-post-likes-favorites.sql
```

**包含内容：**
- post_likes 表（点赞记录）
- post_favorites 表（收藏记录）
- 统计触发器

---

#### 第六步：成员编号系统 ✅

```sql
-- 6. 成员编号系统
执行：docs/add-member-code.sql
```

**包含内容：**
- profiles 表添加 member_code 字段
- 自动生成编号的函数

---

#### 第七步：测试数据（可选）📊

```sql
-- 7. 测试数据（开发环境使用）
执行：docs/test-data.sql
```

**包含内容：**
- 测试帖子
- 测试案例
- 测试活动
- 测试积分记录

---

## 🎯 快速检查清单

执行完脚本后，检查以下内容：

### 表结构检查
```sql
-- 检查所有表是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**应该包含的表：**
- ✅ profiles
- ✅ posts
- ✅ cases
- ✅ events
- ✅ knowledge_items
- ✅ card_views
- ✅ point_records
- ✅ point_settings
- ✅ messages
- ✅ post_likes
- ✅ post_favorites
- ✅ event_registrations

### 字段检查
```sql
-- 检查 profiles 表字段
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

**应该包含的关键字段：**
- ✅ member_code (varchar)
- ✅ total_points (integer)
- ✅ bio (text)
- ✅ company (varchar)
- ✅ position (varchar)
- ✅ skills (array)
- ✅ show_on_member_wall (boolean)
- ✅ show_on_needs (boolean)

---

## ⚠️ 常见问题

### 问题1：表已存在错误

**原因：** 之前已经执行过部分脚本

**解决：**
```sql
-- 如果需要重建表，先删除（谨慎操作！）
DROP TABLE IF EXISTS table_name CASCADE;
```

### 问题2：字段已存在错误

**原因：** 字段已经添加过

**解决：** 脚本中已使用 `IF NOT EXISTS`，应该不会报错

### 问题3：外键约束错误

**原因：** 执行顺序不对

**解决：** 严格按照上述顺序执行

### 问题4：函数已存在错误

**原因：** 函数已创建

**解决：** 使用 `CREATE OR REPLACE FUNCTION`

---

## 🔄 重置数据库（谨慎操作）

如果需要完全重置数据库：

```sql
-- ⚠️ 危险操作：删除所有数据
-- 仅在开发环境使用！

DROP TABLE IF EXISTS post_favorites CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS point_records CASCADE;
DROP TABLE IF EXISTS point_settings CASCADE;
DROP TABLE IF EXISTS card_views CASCADE;
DROP TABLE IF EXISTS knowledge_items CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 然后按顺序重新执行所有脚本
```

---

## 📝 推荐执行方式

### 新项目（从零开始）

```bash
1. 执行 docs/init-database.sql
2. 执行 docs/card-feature-extension.sql
3. 执行 docs/complete-extension.sql
4. 执行 docs/add-messages-table.sql
5. 执行 docs/add-post-likes-favorites.sql
6. 执行 docs/add-member-code.sql
7. （可选）执行 docs/test-data.sql
```

### 已有项目（更新功能）

```bash
# 检查缺失的功能，执行对应的脚本：

# 如果缺少名片功能
执行：docs/card-feature-extension.sql

# 如果缺少积分系统
执行：docs/complete-extension.sql

# 如果缺少站内信
执行：docs/add-messages-table.sql

# 如果缺少点赞收藏
执行：docs/add-post-likes-favorites.sql

# 如果缺少成员编号
执行：docs/add-member-code.sql
```

---

## ✅ 验证脚本执行成功

执行以下SQL验证：

```sql
-- 1. 检查表数量
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public';

-- 预期结果：至少12个表

-- 2. 检查积分设置
SELECT * FROM point_settings;

-- 预期结果：有5条默认记录

-- 3. 检查 profiles 表字段
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name IN ('member_code', 'total_points', 'bio');

-- 预期结果：3行
```

---

## 📞 需要帮助？

如果执行过程中遇到错误：

1. 复制完整的错误信息
2. 检查是否按顺序执行
3. 确认是否在 Supabase SQL Editor 中执行
4. 检查表是否已存在

---

**最后更新：** 2026-03-21
**版本：** v1.0