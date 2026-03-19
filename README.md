# 第二曲线 · 成都AI创客社区官网

🚀 这是「第二曲线 · 成都AI创客社区」的官方网站，使用 Next.js + Tailwind CSS 构建。

## 📦 技术栈

- **框架**: Next.js 14
- **样式**: Tailwind CSS
- **部署**: Vercel (免费)
- **内容**: Markdown (可选)

## 💰 成本说明

- **域名**: 你自己购买 (约 ¥50/年)
- **托管**: Vercel 免费版 (无费用)
- **开发**: 0元 (已帮你写好)

**总费用: 仅域名钱！**

## 🚀 快速开始

### 1. 安装依赖

```bash
cd secondcurve-website
npm install
```

### 2. 本地开发

```bash
npm run dev
```

打开浏览器访问: http://localhost:3000

### 3. 构建生产版本

```bash
npm run build
```

## 🌐 部署到 Vercel (免费)

### 方法一：一键部署 (推荐)

1. 先把代码推到 GitHub
2. 访问 https://vercel.com/new
3. 导入你的仓库
4. 点击 Deploy！

### 方法二：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

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

直接编辑 `pages/` 目录下对应的文件，内容都是硬编码的，用 JSX 写的，很容易修改。

### 添加自己的图片

1. 把图片放到 `public/` 目录下 (需要自己创建)
2. 在代码中用 `/图片名.jpg` 引用

## 📝 后续更新建议

### 1. 添加真实图片

目前用的是 emoji 占位符，建议换成：
- 真实的社区活动照片
- 成都城市风景
- 成员头像

### 2. 集成 Notion 作为后台 (可选)

如果想更方便地更新内容，可以：
- 用 Notion 写内容
- 用 Notion API 拉取数据
- 或者用 super.so 直接把 Notion 变成网站

### 3. 添加表单功能

目前的表单是假的，可以接：
- Formspree (免费)
- Tally.so
- 金数据
- 飞书多维表格

## 🔗 绑定域名

1. 在 Vercel 控制台添加你的域名
2. 在域名注册商那里修改 DNS 记录
3. Vercel 会自动给你配 SSL 证书 (https)

## 💡 需要帮助？

- Next.js 文档: https://nextjs.org/docs
- Tailwind CSS 文档: https://tailwindcss.com/docs
- Vercel 文档: https://vercel.com/docs

---

**祝你使用愉快！🚀**

—— 第二曲线技术团队
