# 🚀 Vercel 部署详细步骤

## 第一步：访问Vercel并登录

### 1.1 打开Vercel网站
在浏览器中访问：**https://vercel.com**

### 1.2 注册/登录
1. 点击右上角的 **"Sign Up"** 或 **"Log In"**
2. 选择 **"Continue with GitHub"** ⭐ 推荐
3. 在弹出的GitHub授权页面，点击 **"Authorize Vercel"**
4. 登录成功后会自动跳转回Vercel

---

## 第二步：导入GitHub项目

### 2.1 创建新项目
登录后，你会看到Vercel的控制台：
1. 点击右上角的 **"Add New..."** 按钮
2. 选择 **"Project"**

### 2.2 导入仓库
在 "Import Git Repository" 页面：

**如果你看到 `Sukisama/secondcurve-website`：**
- 直接点击右侧的 **"Import"** 按钮

**如果没有看到：**
1. 点击 **"Adjust GitHub App Permissions"**
2. 在弹出的GitHub页面，选择 **"Only select repositories"**
3. 勾选 `secondcurve-website`
4. 点击 **"Save"**
5. 回到Vercel，点击 **"Import"**

---

## 第三步：配置项目（重要！）⚠️

### 3.1 项目设置
在 "Configure Project" 页面：

- **Project Name**: `secondcurve-website` (或你喜欢的名字)
- **Framework Preset**: Next.js (会自动检测)
- **Root Directory**: `./` (保持默认)

### 3.2 添加环境变量 🔴 关键步骤！

**必须在部署前添加环境变量！**

1. 找到 **"Environment Variables"** 区域
2. 点击 **"Add Environment Variable"**
3. 逐个添加以下3个变量：

#### 变量 1:
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://kzaelebbujxhsonsrtzu.supabase.co
```

#### 变量 2:
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YWVsZWJidWp4aHNvbnNydHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzIyNzksImV4cCI6MjA4OTUwODI3OX0.Mrahkk9mEqdl1GWAcuFrwirKfvj43K8m94KXbjvW-9Q
```

#### 变量 3:
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YWVsZWJidWp4aHNvbnNydHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMjI3OSwiZXhwIjoyMDg5NTA4Mjc5fQ.4uS8Rqos2pb2xsCMo2n-U_oewanMvW_izSbjI__MVhw
```

**注意事项**：
- ✅ 确保3个环境变量的 **Production**、**Preview**、**Development** 都勾选
- ✅ 复制Value时不要有多余的空格
- ✅ 变量名要完全一致（包括大小写）

### 3.3 构建设置（保持默认即可）
- Build Command: `next build` (自动)
- Output Directory: `.next` (自动)
- Install Command: `npm install` (自动)

---

## 第四步：开始部署

### 4.1 点击部署
确认所有配置无误后，点击底部的 **"Deploy"** 按钮

### 4.2 等待部署
部署过程大约需要 **2-3分钟**：
1. 首先会显示 "Building" 状态
2. 你可以查看实时日志
3. 看到绿色的 ✓ 表示构建成功
4. 最后会显示 "Ready" 状态

### 4.3 部署成功
当看到 🎉 庆祝动画时，表示部署成功！

---

## 第五步：访问你的网站

### 5.1 获取网站URL
部署成功后，你会看到：
- 一个默认的Vercel域名，格式如：`https://secondcurve-website-xxx.vercel.app`
- 点击 **"Continue to Dashboard"**

### 5.2 访问测试
1. 在控制台顶部，点击你的域名
2. 网站会在新标签页打开
3. 测试以下功能：
   - ✅ 首页是否正常加载
   - ✅ 图片是否显示
   - ✅ 导航是否工作
   - ✅ 登录/注册功能

---

## 第六步：后续配置（可选）

### 6.1 自定义域名
如果你想绑定自己的域名（如：secondcurve.ai）：

1. 在项目控制台，点击 **"Settings"**
2. 左侧菜单选择 **"Domains"**
3. 输入你的域名，点击 **"Add"**
4. 按照提示配置DNS记录
5. 等待SSL证书自动配置（通常几分钟）

### 6.2 查看部署历史
- 点击 **"Deployments"** 标签
- 可以看到所有部署记录
- 点击任意部署可以查看详情
- 可以回滚到之前的版本

### 6.3 设置自动部署
✅ Vercel默认已开启自动部署
- 每次push到main分支，自动重新部署
- Pull Request会自动创建预览环境
- 无需手动操作

---

## 🔧 常见问题排查

### 问题1: 构建失败
**原因**：环境变量未配置或配置错误

**解决方案**：
1. 检查环境变量是否都已添加
2. 检查变量名是否正确
3. 检查值是否完整（没有缺失字符）
4. 重新部署：Deployments → 最新的部署 → Redeploy

### 问题2: 网站打开是白屏
**原因**：JavaScript错误或环境变量缺失

**解决方案**：
1. 打开浏览器开发者工具（F12）
2. 查看Console面板的错误信息
3. 检查环境变量是否正确配置
4. 检查Supabase连接是否正常

### 问题3: 登录功能不工作
**原因**：Supabase配置问题

**解决方案**：
1. 确认NEXT_PUBLIC_SUPABASE_URL和KEY正确
2. 检查Supabase项目是否正常运行
3. 检查Supabase的邮件认证是否启用

### 问题4: 图片不显示
**原因**：图片文件未上传

**解决方案**：
1. 确认图片文件在 `public/` 目录下
2. 检查图片引用路径是否正确
3. 清除浏览器缓存重试

---

## 📱 移动端测试

部署成功后，建议测试移动端：
1. 用手机扫描网站二维码
2. 或在浏览器开发者工具切换到移动模式
3. 测试所有功能是否正常

---

## 🔐 安全提示

**重要**：
- ⚠️ 不要将 `.env.local` 文件提交到GitHub
- ⚠️ 环境变量只在Vercel后台配置
- ⚠️ Service Role Key要保密，不要泄露
- ✅ 使用环境变量管理敏感信息

---

## ✅ 部署检查清单

部署前：
- [ ] 代码已推送到GitHub
- [ ] 本地构建成功 (`npm run build`)
- [ ] 准备好3个环境变量

部署时：
- [ ] 成功导入GitHub仓库
- [ ] 添加所有环境变量
- [ ] 环境变量作用于所有环境
- [ ] 点击Deploy开始部署

部署后：
- [ ] 部署成功，看到庆祝动画
- [ ] 网站可以正常访问
- [ ] 首页加载正常
- [ ] 用户登录/注册功能正常
- [ ] 移动端显示正常

---

## 🎉 恭喜！

如果所有步骤都完成了，你的网站现在应该已经在线运行了！

**下一步建议**：
1. 分享网站链接给团队成员测试
2. 配置自定义域名
3. 添加网站分析（Vercel Analytics）
4. 设置错误监控（Sentry等）

**需要帮助？**
- 查看 [Vercel官方文档](https://vercel.com/docs)
- 查看 [项目部署指南](deployment-guide.md)
- 在GitHub提Issue

---

**祝部署顺利！🚀**

—— 第二曲线技术团队