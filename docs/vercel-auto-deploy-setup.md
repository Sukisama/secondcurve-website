# 🚀 更新Vercel部署并设置自动部署

## 📋 当前状态
- ✅ 代码已推送到GitHub：最新commit `307f1d2`
- ✅ 本地构建测试通过
- ⏳ 需要在Vercel更新部署

---

## 🎯 步骤一：访问Vercel控制台

### 1.1 登录Vercel
1. 打开浏览器，访问：**https://vercel.com**
2. 使用GitHub账号登录

### 1.2 找到你的项目
1. 登录后，你会看到项目列表
2. 找到 **`secondcurve-website`** 项目
3. 点击进入项目

---

## 🔄 步骤二：更新到最新版本

### 2.1 检查部署状态
进入项目后，你会看到：
- **Deployments** 标签页
- 最新的部署记录（应该自动触发了）

### 2.2 如果自动部署未触发
1. 点击右上角的 **"Redeploy"** 按钮
2. 或者：
   - 点击 **"Settings"** → **"Git"**
   - 检查是否连接到正确的GitHub仓库
   - 确认分支是 `main`

### 2.3 查看部署进度
1. 点击最新的部署记录
2. 查看实时构建日志
3. 等待2-3分钟直到显示 "Ready"

---

## ⚙️ 步骤三：配置环境变量（重要！）

### 3.1 进入环境变量设置
1. 在项目页面，点击 **"Settings"**
2. 左侧菜单选择 **"Environment Variables"**

### 3.2 检查并添加环境变量
确认以下3个环境变量都存在：

#### ✅ 变量 1: NEXT_PUBLIC_SUPABASE_URL
```
Value: https://kzaelebbujxhsonsrtzu.supabase.co
Environment: Production, Preview, Development (全选)
```

#### ✅ 变量 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YWVsZWJidWp4aHNvbnNydHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzIyNzksImV4cCI6MjA4OTUwODI3OX0.Mrahkk9mEqdl1GWAcuFrwirKfvj43K8m94KXbjvW-9Q
Environment: Production, Preview, Development (全选)
```

#### ✅ 变量 3: SUPABASE_SERVICE_ROLE_KEY
```
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YWVsZWJidWp4aHNvbnNydHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMjI3OSwiZXhwIjoyMDg5NTA4Mjc5fQ.4uS8Rqos2pb2xsCMo2n-U_oewanMvW_izSbjI__MVhw
Environment: Production, Preview, Development (全选)
```

### 3.3 如果缺少变量
1. 点击 **"Add Environment Variable"**
2. 输入变量名和值
3. 勾选所有环境（Production, Preview, Development）
4. 点击 **"Save"**

### 3.4 更新环境变量后
- 点击 **"Deployments"** 标签
- 点击最新部署的 **"Redeploy"**
- 选择 **"Redeploy"**（确保使用新的环境变量）

---

## 🤖 步骤四：设置自动部署

### 4.1 检查Git集成
1. 在项目设置中，点击 **"Settings"**
2. 左侧选择 **"Git"**
3. 确认设置：

#### Production Branch（生产分支）
```
✅ Branch Name: main
✅ Automatically deploy new commits: Yes
```

### 4.2 配置自动部署规则
在 **"Git"** 设置页面，找到 **"Production Branch"** 部分：

**确保以下设置已启用**：
- ✅ **Branch Name**: `main`
- ✅ **Automatically deploy new commits**: 已启用
- ✅ **Ignored Build Step**: 保持默认或留空

### 4.3 Preview部署设置
在同一个页面，找到 **"Preview Branches"** 部分：

**推荐设置**：
- ✅ **Automatically deploy Pull Requests**: 已启用
- ✅ **Preview Comments**: 已启用（在PR中自动评论预览链接）

---

## ✅ 步骤五：验证自动部署

### 5.1 测试自动部署
1. 在本地修改一个小文件（如README.md）
2. 提交并推送到GitHub：
   ```bash
   git add README.md
   git commit -m "test: 测试自动部署"
   git push origin main
   ```
3. 回到Vercel控制台
4. 几秒钟后应该能看到新的部署开始

### 5.2 查看部署日志
1. 点击最新开始的部署
2. 查看 **"Building"** 日志
3. 确认构建成功并显示 "Ready"

### 5.3 访问更新后的网站
- 点击部署记录顶部的域名链接
- 或点击 **"Visit"** 按钮
- 确认更改已生效

---

## 🎯 步骤六：最终检查清单

完成以上步骤后，确认以下项：

### 部署设置
- [ ] Vercel项目已连接到GitHub仓库 `Sukisama/secondcurve-website`
- [ ] Production分支设置为 `main`
- [ ] 自动部署已启用

### 环境变量
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 已配置
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 已配置
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 已配置
- [ ] 所有环境变量应用于 Production, Preview, Development

### 功能测试
- [ ] 首页正常加载
- [ ] 用户登录/注册功能正常
- [ ] 论坛功能正常
- [ ] 无控制台错误

---

## 🚀 自动部署工作流程

设置完成后，你的工作流程将变得非常简单：

### 本地开发 → 自动部署
```bash
# 1. 本地开发
npm run dev

# 2. 测试通过后提交
git add .
git commit -m "feat: 新功能描述"
git push origin main

# 3. Vercel自动检测并部署
# 无需手动操作！✨
```

### Pull Request → 预览环境
```bash
# 1. 创建新分支
git checkout -b feature/new-feature

# 2. 开发并提交
git add .
git commit -m "feat: 开发新功能"
git push origin feature/new-feature

# 3. 在GitHub创建Pull Request
# Vercel自动创建预览环境！✨
```

---

## 🔧 高级设置（可选）

### 构建钩子（Build Hooks）
如果需要在特定时间自动部署：
1. Settings → Git → Build Hooks
2. 点击 **"Create Hook"**
3. 可以用于定时任务或外部触发

### 部署保护（Deployment Protection）
如果需要保护预览环境：
1. Settings → Deployment Protection
2. 可以设置密码保护或限制访问

### 域名设置
1. Settings → Domains
2. 添加自定义域名
3. 配置DNS记录

---

## 📊 监控部署状态

### 部署历史
- 点击 **"Deployments"** 标签查看所有部署记录
- 可以回滚到任意历史版本
- 查看每次部署的详细日志

### 部署通知
1. Settings → Notifications
2. 可以配置：
   - Slack通知
   - 邮件通知
   - Discord通知

---

## ❓ 常见问题

### Q1: 推送代码后没有自动部署？
**A**: 检查以下项：
1. Settings → Git → Production Branch 是否设置为 `main`
2. 是否正确推送到main分支
3. 检查Vercel控制台是否有错误提示

### Q2: 部署失败怎么办？
**A**: 查看部署日志：
1. 点击失败的部署
2. 查看 "Building" 日志中的错误信息
3. 常见原因：环境变量缺失、代码错误

### Q3: 如何强制重新部署？
**A**: 两种方式：
1. 在部署记录中点击 "Redeploy"
2. 或推送新的commit到GitHub

### Q4: 如何关闭自动部署？
**A**:
1. Settings → Git
2. 取消勾选 "Automatically deploy new commits"
3. 但不推荐这样做

---

## 🎉 完成！

现在你的设置已经完成：

✅ **Vercel已更新到最新版本**
✅ **环境变量已正确配置**
✅ **自动部署已启用**
✅ **每次push到GitHub都会自动更新**

**你的工作流程**：
1. 本地开发代码
2. 测试通过
3. `git push`
4. ☕ 喝杯咖啡，Vercel自动部署！🚀

---

**需要帮助？**
- 查看 [Vercel文档](https://vercel.com/docs)
- 查看 [项目部署指南](deployment-guide.md)
- 在GitHub创建Issue

**祝你使用愉快！🎉**

—— 第二曲线技术团队