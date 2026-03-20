# 🎯 第二曲线网站 - Vercel快速部署（网站操作版）

由于命令行需要交互认证，最简单的方式是直接在Vercel网站上操作。

---

## 🚀 5分钟快速部署步骤

### ✅ 第一步：打开Vercel（已完成）
浏览器应该已经打开了 Vercel 登录页面。

### ✅ 第二步：登录（1分钟）
1. 在打开的页面中，点击 **"Continue with GitHub"**
2. 授权Vercel访问你的GitHub账号
3. 登录成功后自动跳转到控制台

### ✅ 第三步：检查项目（1分钟）
登录后，查看你的项目列表：
- **如果看到 `secondcurve-website` 项目**：跳到第四步
- **如果没有看到项目**：继续下面的"导入项目"步骤

#### 导入项目（如果需要）：
1. 点击 **"Add New..." → "Project"**
2. 找到 `Sukisama/secondcurve-website`
3. 点击 **"Import"**

### ✅ 第四步：配置环境变量（2分钟）⚠️ 最关键！

1. 在项目页面，点击 **"Settings"**
2. 左侧选择 **"Environment Variables"**
3. 点击 **"Add Environment Variable"**，添加以下3个变量：

#### 变量 1:
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://kzaelebbujxhsonsrtzu.supabase.co
Environment: 全选 (Production, Preview, Development)
```

#### 变量 2:
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YWVsZWJidWp4aHNvbnNydHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzIyNzksImV4cCI6MjA4OTUwODI3OX0.Mrahkk9mEqdl1GWAcuFrwirKfvj43K8m94KXbjvW-9Q
Environment: 全选 (Production, Preview, Development)
```

#### 变量 3:
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YWVsZWJidWp4aHNvbnNydHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMjI3OSwiZXhwIjoyMDg5NTA4Mjc5fQ.4uS8Rqos2pb2xsCMo2n-U_oewanMvW_izSbjI__MVhw
Environment: 全选 (Production, Preview, Development)
```

**注意**：每个变量都要勾选 Production, Preview, Development 三个环境！

### ✅ 第五步：部署（1分钟）
1. 点击 **"Deployments"** 标签
2. 点击右上角 **"Redeploy"** 按钮
3. 等待2-3分钟，看到 🎉 庆祝动画

### ✅ 第六步：访问网站
- 部署成功后，点击页面顶部的域名链接
- 格式：`https://secondcurve-website-xxx.vercel.app`
- 开始使用你的网站！

---

## 🤖 自动部署设置

部署完成后，自动部署默认已经启用！

**验证方法**：
1. 点击 **"Settings"** → **"Git"**
2. 确认 **"Production Branch"** 是 `main`
3. 确认 **"Automatically deploy new commits"** 已启用

**这样设置后**：
- ✅ 每次 `git push` 到main分支，Vercel自动部署
- ✅ Pull Request自动创建预览环境
- ✅ 无需任何手动操作！

---

## 📝 环境变量快速复制

为了方便复制，这里是所有环境变量：

```bash
# 变量1
NEXT_PUBLIC_SUPABASE_URL=https://kzaelebbujxhsonsrtzu.supabase.co

# 变量2
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YWVsZWJidWp4aHNvbnNydHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzIyNzksImV4cCI6MjA4OTUwODI3OX0.Mrahkk9mEqdl1GWAcuFrwirKfvj43K8m94KXbjvW-9Q

# 变量3
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YWVsZWJidWp4aHNvbnNydHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMjI3OSwiZXhwIjoyMDg5NTA4Mjc5fQ.4uS8Rqos2pb2xsCMo2n-U_oewanMvW_izSbjI__MVhw
```

---

## ✅ 完成检查清单

部署完成后，确认：
- [ ] 网站可以正常访问
- [ ] 用户注册/登录功能正常
- [ ] 论坛页面加载正常
- [ ] 自动部署已启用

---

## 🎉 完成！

现在你的网站已经部署并启用了自动部署！

**工作流程**：
```bash
# 1. 本地开发
npm run dev

# 2. 提交代码
git add .
git commit -m "更新功能"
git push origin main

# 3. 自动部署 🚀
# Vercel会自动检测并部署！
```

---

**如果浏览器没有自动打开，请手动访问：**
https://vercel.com/login