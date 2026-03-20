# 积分系统和排行榜功能说明

## 完成内容

### 1. 数据库表结构

创建了 `/Users/doris/secondcurve-website/docs/init-points.sql`，包含：

- **point_settings** 表：存储积分规则设置
- **point_records** 表：记录积分变化历史
- **profiles** 表新增字段：`total_points` 存储用户总积分
- 相关索引和 RLS 策略
- 默认积分规则初始化数据

**执行方式：**
在 Supabase SQL Editor 中执行此脚本以创建表结构。

### 2. 积分工具函数

创建了 `/Users/doris/secondcurve-website/lib/points.js`，提供：

- `awardPoints(userId, actionKey, options)` - 通用积分奖励函数
- `deductPoints(userId, points, reason, adminUserId)` - 扣除积分
- `getUserPointRecords(userId, limit)` - 获取用户积分记录
- `getLeaderboard(limit)` - 获取积分排行榜
- `getPointSettings()` - 获取所有积分设置
- `updatePointSetting(settingId, updates)` - 更新积分设置
- `createPointSetting(setting)` - 创建新积分设置
- `deletePointSetting(settingId)` - 删除积分设置
- 便捷方法：
  - `awardPostPoints(userId)` - 发布帖子奖励
  - `awardCasePoints(userId)` - 发布案例奖励
  - `awardEventPoints(userId)` - 参加活动奖励
  - `awardCommentPoints(userId)` - 发表评论奖励
  - `awardFeaturedPostPoints(userId)` - 精华帖奖励

### 3. 后台积分设置页面

创建了 `/Users/doris/secondcurve-website/pages/admin/points.js`，功能包括：

- 显示所有积分规则列表
- 查看规则详情（操作键、名称、积分值、描述）
- 新增积分规则
- 编辑现有积分规则
- 删除积分规则
- 启用/禁用积分规则
- 权限验证（仅管理员可访问）

### 4. 用户积分管理

修改了 `/Users/doris/secondcurve-website/pages/admin.js`，添加：

- 用户列表显示当前积分
- 积分调整按钮
- 积分调整模态框（支持增加/扣除）
- 调整时必须填写原因
- 自动创建 point_records 记录
- 后台管理页面添加"积分设置"链接

### 5. 首页排行榜

修改了 `/Users/doris/secondcurve-website/pages/index.js`，添加：

- 积分排行榜模块（TOP 10）
- 显示排名、头像、姓名、积分
- 前三名特殊标识（金银铜）
- 点击跳转到用户名片页
- 美观的卡片设计
- 响应式布局

### 6. 个人中心积分展示

修改了 `/Users/doris/secondcurve-website/pages/profile.js`，添加：

- 积分展示卡片（带渐变背景）
- 显示当前总积分
- 积分记录列表（最近5条）
- 积分来源分类显示
- 记录时间格式化
- 空状态提示

## 使用方法

### 1. 初始化数据库

```bash
# 在 Supabase SQL Editor 中执行
docs/init-points.sql
```

### 2. 在业务代码中使用积分奖励

```javascript
import { awardPostPoints, awardCasePoints } from '../lib/points'

// 发布帖子时奖励积分
const result = await awardPostPoints(userId)
if (result.success) {
  toast.success(`恭喜获得 ${result.points} 积分！`)
}

// 发布案例时奖励积分
await awardCasePoints(userId)

// 参加活动时奖励积分
await awardEventPoints(userId)

// 发表评论时奖励积分
await awardCommentPoints(userId)

// 设为精华帖时奖励积分
await awardFeaturedPostPoints(userId)
```

### 3. 管理员调整积分

访问 `/admin` → 用户管理 → 点击用户的积分调整按钮 → 填写积分数量和原因

### 4. 管理积分规则

访问 `/admin/points` → 可以查看、新增、编辑、删除、启用/禁用积分规则

## 默认积分规则

| 操作键 | 操作名称 | 积分值 | 说明 |
|--------|---------|--------|------|
| register | 注册账号 | 100 | 新用户注册成功 |
| create_post | 发布帖子 | 10 | 发布一篇新帖子 |
| create_case | 发布案例 | 50 | 发布一个新案例 |
| join_event | 参加活动 | 20 | 报名参加线下活动 |
| create_comment | 发表评论 | 5 | 对帖子或案例发表评论 |
| post_featured | 帖子被设为精华 | 100 | 帖子被管理员设为精华 |
| daily_login | 每日登录 | 5 | 每日首次登录 |
| share_content | 分享内容 | 10 | 分享社区内容到社交媒体 |

## 技术特点

1. **类型安全**：所有函数都有清晰的参数和返回值类型
2. **错误处理**：完善的错误捕获和用户提示
3. **权限控制**：管理员权限验证，普通用户只能查看自己的积分
4. **数据安全**：使用 Supabase RLS 策略保护数据
5. **响应式设计**：适配移动端和桌面端
6. **用户体验**：Toast 通知、加载状态、空状态提示

## 文件清单

### 新建文件
1. `/Users/doris/secondcurve-website/docs/init-points.sql`
2. `/Users/doris/secondcurve-website/lib/points.js`
3. `/Users/doris/secondcurve-website/pages/admin/points.js`

### 修改文件
1. `/Users/doris/secondcurve-website/pages/admin.js`
2. `/Users/doris/secondcurve-website/pages/index.js`
3. `/Users/doris/secondcurve-website/pages/profile.js`

## 后续建议

1. 可以在帖子发布、案例发布、活动报名等功能中集成积分奖励
2. 可以开发积分兑换功能（兑换礼品、VIP 时长等）
3. 可以添加积分明细页面，查看完整的积分历史
4. 可以开发积分等级系统，不同等级享受不同权益
5. 可以添加积分排行榜分页，查看更多用户排名