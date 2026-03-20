# 第二曲线 · 成都AI创客社区官网

🚀 这是「第二曲线 · 成都AI创客社区」的官方网站，使用 Next.js + Tailwind CSS + Supabase 构建。

## ✨ 功能特性

- 🏠 **首页** - 社区介绍、案例展示、活动预告
- 📚 **知识库** - 体系化的AI学习路径和工具库
- 💼 **实战案例** - 真实项目拆解和经验分享
- 🤝 **资源对接** - 成员墙和需求广场
- 💬 **社区论坛** - 技术交流、经验分享
- 🎫 **线下活动** - 活动报名和VIP会员
- 👤 **用户系统** - 登录注册、个人中心
- ⭐ **VIP会员** - 专属权益和优惠

## 📦 技术栈

- **框架**: Next.js 14 (App Router ready)
- **样式**: Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **部署**: Vercel (免费)
- **响应式**: 移动端优先设计

## 💰 成本说明

- **域名**: 你自己购买 (约 ¥50/年)
- **托管**: Vercel 免费版 (无费用)
- **数据库**: Supabase 免费版 (500MB)
- **开发**: 0元 (已帮你写好)

**总费用: 仅域名钱！**

## 🗂️ 项目结构

```
secondcurve-website/
├── pages/                  # 页面文件
│   ├── index.js           # 首页
│   ├── knowledge.js       # 知识库
│   ├── cases.js           # 实战案例列表
│   ├── cases/[id].js      # 案例详情
│   ├── resources.js       # 资源对接
│   ├── forum/             # 论坛相关
│   │   ├── index.js       # 论坛首页
│   │   ├── [id].js        # 帖子详情
│   │   └── new.js         # 发布帖子
│   ├── events/            # 活动相关
│   ├── vip/               # VIP会员
│   ├── login.js           # 登录
│   ├── register.js        # 注册
│   ├── profile.js         # 个人中心
│   ├── admin.js           # 管理后台
│   ├── about.js           # 关于我们
│   └── _app.js            # 全局布局
├── lib/                    # 工具库
│   ├── data.js            # 数据管理
│   ├── supabase/          # Supabase配置
│   └── auth/              # 认证相关
├── docs/                   # 文档
│   ├── test-cases.md      # 测试用例
│   ├── test-report.md     # 测试报告
│   ├── deployment-guide.md # 部署指南
│   └── supabase-setup.md  # Supabase配置
├── styles/                 # 样式文件
│   └── globals.css        # 全局样式
├── public/                 # 静态资源
├── .env.local             # 环境变量
├── .env.example           # 环境变量示例
└── README.md              # 项目说明
```

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Sukisama/secondcurve-website.git
cd secondcurve-website
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
# 复制环境变量示例
cp .env.example .env.local

# 编辑 .env.local 填入你的Supabase配置
```

需要配置的环境变量：
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase项目URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase服务密钥（可选）

### 4. 本地开发

```bash
npm run dev
```

打开浏览器访问: http://localhost:3000

### 5. 构建生产版本

```bash
npm run build
npm run start
```

## 🌐 部署到 Vercel

详细部署步骤请查看 [部署指南](docs/deployment-guide.md)

### 方法一：Vercel网站自动部署（推荐）⭐

1. 访问 https://vercel.com 并用GitHub登录
2. 点击 "Add New Project"
3. 导入 `Sukisama/secondcurve-website` 仓库
4. 添加环境变量（见部署指南）
5. 点击 Deploy

### 方法二：命令行部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署到生产环境
vercel --prod
```

### 自动部署

✅ Vercel会自动监听main分支
✅ 每次push自动重新部署
✅ PR自动创建预览环境

## 📁 项目结构

```
secondcurve-website/
├── pages/
│   ├── index.js          # 首页
│   ├── knowledge.js      # 知识库
│   ├── cases.js          # 实战案例列表
│   ├── cases/[id].js     # 案例详情
│   ├── resources.js      # 资源对接
│   ├── about.js          # 关于我们
│   └── _app.js           # 全局布局
├── styles/
│   └── globals.css       # 全局样式
├── package.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## 🎨 自定义内容

### 修改网站基本信息

编辑 `pages/_app.js` 中的标题和描述。

### 修改页面内容

直接编辑 `pages/` 目录下对应的文件，使用JSX语法。

### 添加自己的图片

1. 把图片放到 `public/` 目录下
2. 在代码中用 `/图片名.jpg` 引用
3. 使用Next.js Image组件优化加载

### 数据管理

- **本地数据**: 编辑 `lib/data.js` 修改案例、成员、活动数据
- **数据库数据**: 通过Supabase管理论坛、用户等动态数据
- **后台管理**: 访问 `/admin` 页面管理本地数据

## 📊 数据库配置

### Supabase设置

详细配置请查看 [Supabase配置文档](docs/supabase-setup.md)

1. 创建Supabase项目
2. 运行数据库初始化SQL: `docs/init-database.sql`
3. 配置环境变量
4. 启用邮件认证

### 数据表结构

- `profiles` - 用户资料
- `posts` - 论坛帖子
- `comments` - 帖子评论
- `events` - 线下活动
- `registrations` - 活动报名

## 📝 功能状态

### ✅ 已完成
- [x] 首页展示
- [x] 知识库
- [x] 实战案例
- [x] 资源对接
- [x] 社区论坛
- [x] 用户认证
- [x] VIP会员页面
- [x] 线下活动
- [x] 管理后台
- [x] 响应式设计

### 🚧 待完善
- [ ] 微信登录
- [ ] 支付集成
- [ ] 忘记密码
- [ ] 邮件通知
- [ ] 帖子编辑/删除
- [ ] Toast通知组件

## 🔗 绑定域名

1. 在 Vercel 控制台添加你的域名
2. 在域名注册商那里修改 DNS 记录
3. Vercel 会自动给你配 SSL 证书 (https)

详细步骤请查看 [部署指南](docs/deployment-guide.md#自定义域名)

## 📖 文档

- [测试用例](docs/test-cases.md) - 详细的测试用例列表
- [测试报告](docs/test-report.md) - 完整的测试结果报告
- [部署指南](docs/deployment-guide.md) - Vercel部署详细步骤
- [Supabase配置](docs/supabase-setup.md) - 数据库配置说明
- [开发状态](docs/development-status.md) - 项目开发进度

## 💡 需要帮助？

- Next.js 文档: https://nextjs.org/docs
- Tailwind CSS 文档: https://tailwindcss.com/docs
- Supabase 文档: https://supabase.com/docs
- Vercel 文档: https://vercel.com/docs

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT License

---

**祝你使用愉快！🚀**

—— 第二曲线技术团队
