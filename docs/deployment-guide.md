# 第二曲线网站部署指南

## 方式一：通过Vercel网站自动部署（推荐）⭐

### 步骤1: 访问Vercel
1. 打开 https://vercel.com
2. 点击 "Sign Up" 或 "Log In"
3. 选择 "Continue with GitHub"

### 步骤2: 导入项目
1. 登录后，点击 "Add New..." → "Project"
2. 在 "Import Git Repository" 部分，找到 `Sukisama/secondcurve-website`
3. 点击 "Import"

### 步骤3: 配置环境变量
在部署前，需要添加环境变量：

**环境变量列表**:
```
NEXT_PUBLIC_SUPABASE_URL=https://kzaelebbujxhsonsrtzu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YWVsZWJidWp4aHNvbnNydHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzIyNzksImV4cCI6MjA4OTUwODI3OX0.Mrahkk9mEqdl1GWAcuFrwirKfvj43K8m94KXbjvW-9Q
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YWVsZWJidWp4aHNvbnNydHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMjI3OSwiZXhwIjoyMDg5NTA4Mjc5fQ.4uS8Rqos2pb2xsCMo2n-U_oewanMvW_izSbjI__MVhw
```

**操作步骤**:
1. 在项目配置页面，找到 "Environment Variables" 部分
2. 点击 "Add Environment Variable"
3. 逐个添加上述3个环境变量
4. 确保 "Production", "Preview", "Development" 都勾选

### 步骤4: 部署
1. 确认配置无误后，点击 "Deploy"
2. 等待部署完成（约2-3分钟）
3. 部署成功后会显示 🎉 庆祝动画

### 步骤5: 查看部署结果
1. 部署完成后，Vercel会提供一个域名（如：`https://secondcurve-website.vercel.app`）
2. 点击域名即可访问网站
3. 可以在 "Deployments" 标签页查看部署历史

### 自动部署设置
✅ Vercel会自动监听GitHub仓库的 `main` 分支
✅ 每次push代码到main分支，Vercel会自动重新部署
✅ Pull Request会自动创建预览环境

---

## 方式二：通过命令行部署

### 前提条件
需要在本地终端登录Vercel：

```bash
# 1. 登录Vercel
vercel login

# 2. 按照提示在浏览器中完成登录

# 3. 部署到生产环境
vercel --prod

# 或分步部署
vercel          # 先部署预览环境
vercel --prod   # 然后部署生产环境
```

### 命令行部署优势
- 更快的部署流程
- 可以在CI/CD中使用
- 更好的控制部署过程

---

## 方式三：GitHub Actions自动部署

### 创建GitHub Actions工作流

创建文件 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 需要在GitHub仓库设置中添加Secrets:
- `VERCEL_TOKEN`: 从Vercel账户设置中生成
- `VERCEL_ORG_ID`: Vercel组织ID
- `VERCEL_PROJECT_ID`: Vercel项目ID

---

## 部署后检查清单

### 功能检查
- [ ] 首页正常加载
- [ ] 用户注册/登录功能正常
- [ ] 论坛功能正常（需要Supabase配置）
- [ ] 图片和静态资源正常显示
- [ ] 移动端响应式正常

### 性能检查
- [ ] 页面加载速度 < 3秒
- [ ] 图片已优化
- [ ] 无console错误

### SEO检查
- [ ] Meta标签正确
- [ ] Open Graph标签存在
- [ ] Favicon正常显示

---

## 自定义域名（可选）

### 在Vercel中添加自定义域名
1. 进入项目 "Settings" → "Domains"
2. 添加你的域名（如：`secondcurve.ai`）
3. 按照提示配置DNS记录
4. 等待SSL证书自动配置完成

### DNS配置示例
```
类型: A
名称: @
值: 76.76.21.21

类型: CNAME
名称: www
值: cname.vercel-dns.com
```

---

## 环境变量管理

### Production环境变量
- 在Vercel项目设置中配置
- 用于生产环境
- 每次部署都会使用

### Preview环境变量
- 用于Pull Request预览
- 可以使用不同的配置

### Development环境变量
- 本地开发时使用
- 通过 `.env.local` 文件配置

---

## 常见问题

### Q: 部署失败怎么办？
A: 检查以下项：
1. 环境变量是否正确配置
2. 构建日志中的错误信息
3. Supabase配置是否正确

### Q: 如何回滚到之前的版本？
A: 在Vercel的 "Deployments" 页面，找到之前的成功部署，点击 "Promote to Production"

### Q: 如何查看部署日志？
A: 在Vercel的 "Deployments" 页面，点击具体的部署，可以查看完整日志

### Q: 部署后样式不正常？
A: 确保：
1. Tailwind CSS配置正确
2. 没有CSS文件缺失
3. 清除浏览器缓存重试

---

## 下一步

部署成功后，建议：
1. 配置自定义域名
2. 设置通知（Slack/邮件）
3. 启用Vercel Analytics
4. 配置备份策略

---

**部署时间**: 2026-03-20
**文档版本**: 1.0