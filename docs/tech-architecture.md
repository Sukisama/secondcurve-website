# 第二曲线 · 成都AI创客社区 - 技术架构文档

> 版本：v1.0
> 最后更新：2026-03-19

---

## 1. 技术栈选型

### 1.1 前端技术栈

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| Next.js | 14.x | React框架 | 支持SSR/SSG，SEO友好，部署简单 |
| React | 18.x | UI框架 | 生态成熟，组件化开发 |
| Tailwind CSS | 3.x | CSS框架 | 原子化CSS，开发效率高 |
| JavaScript | ES6+ | 开发语言 | 团队熟悉，生态好 |

### 1.2 后端技术栈（v1.1规划）

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| PocketBase | latest | 后端服务 | 单文件，开箱即用，支持Auth |
| PostgreSQL | 15+ | 数据库 | PocketBase内置，无需额外部署 |
| Redis | 7.x | 缓存（可选）| 提升性能，存储Session |

### 1.3 部署与运维

| 技术 | 用途 | 说明 |
|------|------|------|
| Vercel | 前端托管 | 免费版够用，自动部署 |
| PocketHost | 后端托管 | PocketBase专属托管，免费版可用 |
| Cloudflare | DNS/CDN | 可选，加速和安全防护 |
| GitHub | 代码托管 | 版本控制，协作开发 |

---

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         用户层                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │   PC端   │  │  移动端   │  │  平板    │  │  管理后台 │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      CDN / 边缘层                           │
│                    (Cloudflare / Vercel)                     │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌───────────────────────────┐    ┌───────────────────────────┐
│      前端层 (Vercel)      │    │    后端层 (PocketHost)   │
│                           │    │                           │
│  - Next.js SSG/SSR       │    │  - PocketBase API        │
│  - 静态资源托管           │    │  - Auth认证              │
│  - ISR增量更新            │    │  - 文件存储              │
└───────────────────────────┘    └───────────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────┐
                              │        数据层             │
                              │  - PostgreSQL (内置)      │
                              │  - SQLite (开发环境)      │
                              └───────────────────────────┘
```

### 2.2 目录结构

```
secondcurve-website/
├── pages/                    # Next.js页面
│   ├── index.js             # 首页
│   ├── knowledge.js         # 知识库
│   ├── cases.js             # 案例列表
│   ├── cases/[id].js        # 案例详情
│   ├── resources.js         # 资源对接
│   ├── about.js             # 关于我们
│   ├── admin.js             # 后台管理
│   ├── login.js             # 登录页（待开发）
│   ├── register.js          # 注册页（待开发）
│   └── _app.js              # 全局布局
├── components/              # React组件（待创建）
│   ├── Layout/
│   │   ├── Header.js
│   │   └── Footer.js
│   ├── Case/
│   │   ├── CaseCard.js
│   │   └── CaseList.js
│   ├── User/
│   │   ├── UserCard.js
│   │   └── LoginForm.js
│   └── Common/
│       ├── Button.js
│       └── Input.js
├── lib/                     # 工具库
│   ├── data.js              # 数据管理（当前localStorage）
│   ├── api.js               # API请求封装（待开发）
│   ├── auth.js              # 认证相关（待开发）
│   └── pocketbase.js        # PocketBase客户端（待开发）
├── styles/                  # 样式文件
│   └── globals.css
├── public/                  # 静态资源
│   ├── logo-full.png
│   └── logo-icon.jpg
├── docs/                    # 文档
│   ├── prd.md               # 产品需求文档
│   ├── tech-architecture.md # 本文档
│   ├── api.md               # API文档（待创建）
│   └── deployment.md        # 部署文档（待创建）
├── pb_hooks/                # PocketBase钩子（待创建）
│   └── *.pb.js
├── pb_migrations/           # PocketBase迁移（待创建）
│   └── *.sql
├── package.json
├── next.config.js
├── tailwind.config.js
├── .gitignore
└── README.md
```

---

## 3. 数据架构

### 3.1 当前方案（v1.0）

**存储方式：** localStorage（浏览器本地存储）

**数据结构：**
```javascript
{
  cases: [...],      // 案例数组
  members: [...],    // 成员数组
  events: [...]      // 活动数组
}
```

**优点：**
- 无需后端服务
- 开发快速
- 零运维成本

**缺点：**
- 数据无法跨设备同步
- 多用户数据不一致
- 无权限控制
- 数据易丢失

---

### 3.2 目标方案（v1.1）

**存储方式：** PocketBase + PostgreSQL

**集合设计：**

#### users（用户集合）
```javascript
{
  "id": "relation",
  "email": "email",
  "emailVisibility": "bool",
  "verified": "bool",
  "name": "text",
  "avatar": "file",
  "role": "select:guest|member|core|admin",
  "status": "select:active|disabled",
  "bio": "text",
  "skills": "json",
  "lookingFor": "text",
  "wechat": "text",
  "website": "url",
  "created": "autodate",
  "updated": "autodate"
}
```

#### cases（案例集合）
```javascript
{
  "id": "relation",
  "title": "text",
  "category": "select:智能产品|技术探索|商业落地",
  "description": "text",
  "content": "editor",
  "author": "relation:users",
  "tags": "json",
  "isPublished": "bool",
  "cover": "file",
  "created": "autodate",
  "updated": "autodate"
}
```

#### members（成员集合）
```javascript
{
  "id": "relation",
  "user": "relation:users",
  "name": "text",
  "role": "text",
  "skills": "json",
  "looking": "text",
  "avatar": "file",
  "isPublic": "bool",
  "created": "autodate"
}
```

#### events（活动集合）
```javascript
{
  "id": "relation",
  "title": "text",
  "date": "text",
  "location": "text",
  "description": "text",
  "maxAttendees": "number",
  "cover": "file",
  "created": "autodate"
}
```

---

## 4. 用户认证与权限设计

### 4.1 认证方案

**技术选型：** PocketBase Auth

**支持的登录方式：**
- 邮箱密码登录
- 微信OAuth（需配置）
- 手机号验证码（需配置）

**认证流程：**

```
用户输入凭证
     │
     ▼
  前端调用API
     │
     ▼
PocketBase验证
     │
     ├── 成功 → 返回Token和用户信息
     │            │
     │            ▼
     │        存储Token到Cookie
     │            │
     │            ▼
     │        跳转至首页/原页面
     │
     └── 失败 → 返回错误信息
                  │
                  ▼
              前端展示错误
```

### 4.2 权限体系设计

| 权限 | 游客 | 普通成员 | 核心成员 | 管理员 |
|------|------|----------|----------|--------|
| 浏览公开内容 | ✓ | ✓ | ✓ | ✓ |
| 浏览会员内容 | ✗ | ✓ | ✓ | ✓ |
| 发布需求 | ✗ | ✓ | ✓ | ✓ |
| 评论案例 | ✗ | ✓ | ✓ | ✓ |
| 发布案例 | ✗ | ✗ | ✓ | ✓ |
| 编辑自己内容 | ✗ | ✓ | ✓ | ✓ |
| 编辑任意内容 | ✗ | ✗ | ✗ | ✓ |
| 用户管理 | ✗ | ✗ | ✗ | ✓ |
| 系统配置 | ✗ | ✗ | ✗ | ✓ |

### 4.3 API鉴权

**方式：** Bearer Token

**请求示例：**
```javascript
// lib/pocketbase.js
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://your-pocketbase.pockethost.io');

// 设置Auth Token
pb.authStore.save(token, user);

// 自动添加Auth Header
const record = await pb.collection('cases').getList(1, 20);
```

---

## 5. API设计

### 5.1 PocketBase自动生成的API

PocketBase会为每个集合自动生成CRUD API：

#### 案例API
```
GET    /api/collections/cases/records          # 获取列表
POST   /api/collections/cases/records          # 创建
GET    /api/collections/cases/records/{id}     # 获取单个
PATCH  /api/collections/cases/records/{id}     # 更新
DELETE /api/collections/cases/records/{id}     # 删除
```

#### 用户认证API
```
POST   /api/collections/users/auth-with-password  # 密码登录
POST   /api/collections/users/records            # 注册
POST   /api/collections/users/auth-refresh       # 刷新Token
POST   /api/collections/users/request-password-reset  # 请求重置密码
```

### 5.2 前端API封装

```javascript
// lib/api.js
import { pb } from './pocketbase';

export const api = {
  // 案例相关
  cases: {
    async getList(page = 1, perPage = 20, filter = '') {
      return await pb.collection('cases').getList(page, perPage, {
        filter,
        sort: '-created',
        expand: 'author'
      });
    },

    async getOne(id) {
      return await pb.collection('cases').getOne(id, {
        expand: 'author'
      });
    },

    async create(data) {
      return await pb.collection('cases').create(data);
    },

    async update(id, data) {
      return await pb.collection('cases').update(id, data);
    },

    async delete(id) {
      return await pb.collection('cases').delete(id);
    }
  },

  // 用户相关
  users: {
    async login(email, password) {
      return await pb.collection('users').authWithPassword(email, password);
    },

    async register(data) {
      return await pb.collection('users').create(data);
    },

    async logout() {
      pb.authStore.clear();
    },

    async getCurrentUser() {
      return pb.authStore.model;
    }
  }
};
```

---

## 6. 部署方案

### 6.1 前端部署（Vercel）

**步骤：**
1. 代码推送到GitHub
2. 在Vercel导入仓库
3. 配置环境变量（如需要）
4. 点击Deploy

**环境变量：**
```
NEXT_PUBLIC_POCKETBASE_URL=https://your-pocketbase.pockethost.io
```

### 6.2 后端部署（PocketHost）

**步骤：**
1. 注册 https://pockethost.io
2. 创建新的PocketBase实例
3. 在后台配置Collections
4. 配置CORS和安全规则

**安全规则示例（PocketBase）：**
```javascript
// cases 集合规则
list:   auth.id != null
view:   auth.id != null
create: @request.auth.role = "core" || @request.auth.role = "admin"
update: @request.auth.role = "admin" || data.author = @request.auth.id
delete: @request.auth.role = "admin" || data.author = @request.auth.id

// users 集合规则
list:   @request.auth.role = "admin"
view:   @request.auth.id = id || @request.auth.role = "admin"
create: true
update: @request.auth.id = id || @request.auth.role = "admin"
delete: @request.auth.role = "admin"
```

### 6.3 域名配置

**前端域名：** `www.secondcurve.ai` → Vercel
**后端域名：** `api.secondcurve.ai` → PocketHost

---

## 7. 迁移计划（v1.0 → v1.1）

### 阶段1：准备工作
- [ ] 注册PocketHost账号
- [ ] 创建PocketBase实例
- [ ] 配置Collections和字段
- [ ] 配置安全规则

### 阶段2：数据迁移
- [ ] 导出localStorage数据
- [ ] 转换数据格式
- [ ] 导入到PocketBase
- [ ] 验证数据完整性

### 阶段3：代码改造
- [ ] 安装pocketbase SDK
- [ ] 创建API封装层
- [ ] 修改数据读取逻辑
- [ ] 添加登录页面
- [ ] 添加注册页面
- [ ] 添加用户中心
- [ ] 实现权限控制

### 阶段4：测试与上线
- [ ] 功能测试
- [ ] 权限测试
- [ ] 性能测试
- [ ] 部署到生产环境
- [ ] DNS切换

---

## 8. 监控与运维

### 8.1 监控指标

- 页面访问量
- 用户活跃度
- API响应时间
- 错误率
- 服务器资源使用

### 8.2 日志收集

- 前端错误日志（Sentry）
- 后端访问日志（PocketBase内置）
- 操作审计日志

### 8.3 备份策略

- PocketBase自动每日备份
- 定期导出数据到本地
- 关键操作前手动备份

---

## 9. 安全考虑

### 9.1 前端安全
- XSS防护（React自动转义）
- CSRF防护（SameSite Cookie）
- 敏感信息不在前端存储
- HTTPS强制跳转

### 9.2 后端安全
- PocketBase内置SQL注入防护
- API访问频率限制
- 文件上传类型限制
- 文件大小限制

### 9.3 数据安全
- 密码bcrypt加密
- Token过期机制
- 敏感操作二次验证
- 定期安全审计

---

## 附录

### 相关资源
- [Next.js文档](https://nextjs.org/docs)
- [Tailwind CSS文档](https://tailwindcss.com/docs)
- [PocketBase文档](https://pocketbase.io/docs)
- [PocketHost文档](https://pockethost.io/docs)

### 技术债务
- [ ] 从localStorage迁移到PocketBase
- [ ] 添加TypeScript类型支持
- [ ] 补充单元测试
- [ ] 添加E2E测试
- [ ] 性能优化
