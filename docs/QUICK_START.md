# 🚀 数据库脚本执行指南（简化版）

## 🎯 推荐方式：一键执行

### 步骤1：打开 Supabase SQL Editor

1. 登录你的 Supabase 控制台
2. 选择你的项目
3. 点击左侧菜单的 **SQL Editor**

### 步骤2：执行完整脚本

**复制并执行这个文件：**

```
docs/complete-database-setup.sql
```

这个脚本包含所有功能：
- ✅ 基础表结构
- ✅ 名片功能
- ✅ 积分系统
- ✅ 站内信
- ✅ 点赞收藏
- ✅ 成员编号
- ✅ 活动报名
- ✅ RLS 策略
- ✅ 索引优化

### 步骤3：验证成功

执行以下 SQL 检查：

```sql
-- 检查表数量
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public';

-- 应该显示至少 13 个表
```

---

## ⚠️ 如果遇到问题

### 情况1：表已存在

**解决：** 可以忽略错误，脚本使用了 `IF NOT EXISTS`

### 情况2：想重新开始

**删除所有表（危险操作）：**

```sql
-- 仅在开发环境使用！
DROP TABLE IF EXISTS post_favorites CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS point_records CASCADE;
DROP TABLE IF EXISTS point_settings CASCADE;
DROP TABLE IF EXISTS card_views CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS knowledge_items CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 然后重新执行 complete-database-setup.sql
```

---

## 📝 分步执行（可选）

如果一键执行有问题，可以分步执行：

### 方案A：按功能模块

```sql
-- 1. 基础表（必须）
执行：docs/init-database.sql

-- 2. 名片功能
执行：docs/card-feature-extension.sql

-- 3. 积分系统
执行：docs/complete-extension.sql

-- 4. 站内信
执行：docs/add-messages-table.sql

-- 5. 点赞收藏
执行：docs/add-post-likes-favorites.sql

-- 6. 成员编号
执行：docs/add-member-code.sql
```

---

## ✅ 执行成功标志

当你看到以下内容时，说明执行成功：

1. SQL Editor 底部显示 "Success"
2. 没有红色错误提示
3. 执行验证 SQL 返回 13+ 个表

---

## 🔍 快速验证清单

复制以下 SQL 到 SQL Editor 执行：

```sql
-- 一键验证所有功能
SELECT
  'Tables' as type,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) >= 13 THEN '✅ OK'
    ELSE '❌ Missing tables'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'

UNION ALL

SELECT
  'Point Settings' as type,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) = 5 THEN '✅ OK'
    ELSE '❌ Missing settings'
  END as status
FROM point_settings

UNION ALL

SELECT
  'Profile Fields' as type,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) >= 3 THEN '✅ OK'
    ELSE '❌ Missing fields'
  END as status
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('member_code', 'total_points', 'bio');
```

**预期结果：** 所有行都显示 ✅ OK

---

## 📞 需要帮助？

如果执行时遇到错误：

1. **复制完整错误信息**
2. **检查是否在 Supabase SQL Editor 中执行**
3. **确认项目是否正确**

常见错误：
- `relation already exists` → 可以忽略
- `permission denied` → 检查 Supabase 权限
- `syntax error` → 复制完整脚本，不要修改

---

## 🎉 完成！

执行成功后，你的网站就拥有所有功能了：

- ✅ 用户系统和权限
- ✅ 名片功能
- ✅ 积分系统和排行榜
- ✅ 站内信系统
- ✅ 论坛点赞收藏
- ✅ 活动报名
- ✅ 成员编号
- ✅ VIP权限控制

现在可以开始使用网站了！🚀

---

**最后更新：** 2026-03-21