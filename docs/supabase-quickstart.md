# Supabase 配置完成指南

## 项目信息

- **项目名称**: secondcurve-website
- **项目 URL**: https://kzaelebbujxhsonsrtzu.supabase.co
- **数据库密码**: pjCzmCwzNwuefUNV (请妥善保管)

## 获取 API Keys

### 步骤 1: 访问 API 设置页面

1. 打开浏览器访问: https://supabase.com/dashboard/project/kzaelebbujxhsonsrtzu
2. 点击左侧菜单的 **"Project Settings"** (齿轮图标)
3. 点击 **"API"** 选项

### 步骤 2: 复制 API Keys

在 API 页面你会看到两个重要的 key：

1. **anon public** (客户端使用)
   - 这是公开的 key，可以在前端代码中使用
   - 复制这个值替换 `.env.local` 中的 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **service_role** (服务端使用，保密！)
   - 这是管理员 key，只能在服务端使用
   - ⚠️ **绝对不要**在前端代码中使用！
   - 复制这个值替换 `.env.local` 中的 `SUPABASE_SERVICE_ROLE_KEY`

## 初始化数据库

### 方法 1: 使用 SQL Editor (推荐)

1. 在 Supabase Dashboard，点击左侧 **"SQL Editor"**
2. 点击 **"New query"**
3. 复制 `docs/supabase-setup.md` 文件中的所有 SQL 语句
4. 点击 **"Run"** 执行

### 方法 2: 分步执行

先创建基础表：

```sql
-- 用户表
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(100),
  avatar VARCHAR(500),
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('guest', 'member', 'vip', 'admin', 'super_admin')),
  vip_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

然后逐个创建其他表（详见 `docs/supabase-setup.md`）

## 下一步

配置完成后，运行项目：

```bash
npm run dev
```

访问 http://localhost:3000 查看效果！

## 需要帮助？

- Supabase 文档: https://supabase.com/docs
- 项目设置文档: `docs/supabase-setup.md`