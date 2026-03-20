# 实战案例功能更新说明

## 更新日期
2026-03-21

## 更新内容

### 1. 案例发布功能
- 集成 CasePublishModal 组件
- 仅登录用户可见"发布案例"按钮
- 支持 member、vip、admin、super_admin 角色发布案例
- 支持上传最多5张图片（JPG、PNG格式，单张不超过5MB）
- 第一张图片自动设为缩略图

### 2. 案例删除功能
- 作者可以删除自己发布的案例
- 管理员可以删除所有案例
- 删除前需要确认
- 使用 Toast 通知替代 alert

### 3. 数据加载优化
- 从 Supabase cases 表加载真实数据
- 关联 profiles 表获取作者信息
- 按创建时间倒序排列
- 支持按分类筛选

### 4. 界面优化
- 显示案例缩略图（如果有图片）
- 显示作者头像和名称
- 优化响应式布局
- 保持原有设计风格

### 5. 权限控制
- 发布权限：member 及以上角色
- 删除权限：案例作者或管理员
- 所有用户可查看案例

## 数据库变更

### cases 表新增字段
```sql
-- 添加图片字段
ALTER TABLE cases ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE cases ADD COLUMN IF NOT EXISTS thumbnail TEXT;
```

### RLS 策略新增
```sql
-- 作者和管理员可以更新案例
CREATE POLICY "Authors and admins can update cases"
  ON cases FOR UPDATE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- 作者和管理员可以删除案例
CREATE POLICY "Authors and admins can delete cases"
  ON cases FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
```

## 文件变更

### 新增文件
- `/docs/migrations/add-images-to-cases.sql` - 数据库迁移脚本

### 修改文件
- `/pages/cases.js` - 主页面逻辑
- `/docs/init-database.sql` - 数据库初始化脚本
- `/docs/supabase-setup.md` - 数据库设置文档

## 部署步骤

1. 在 Supabase SQL Editor 中执行迁移脚本：
   - 执行 `/docs/migrations/add-images-to-cases.sql`
   - 或执行更新后的 `/docs/init-database.sql`

2. 部署前端代码

3. 测试功能：
   - 登录后测试发布案例
   - 测试上传图片
   - 测试删除案例（作者和管理员）
   - 测试分类筛选

## 注意事项

1. 图片存储使用 Supabase Storage，需要确保 storage bucket 已创建
2. 图片上传使用 `uploadMultipleImages` 函数（见 `/lib/upload.js`）
3. Toast 通知需要在 `_app.js` 中使用 ToastProvider 包裹（已配置）
4. 用户信息通过 App 组件传递给每个页面组件

## 后续优化建议

1. 添加案例编辑功能
2. 添加案例点赞功能
3. 添加案例评论功能
4. 优化图片加载性能（使用 Next.js Image 组件）
5. 添加图片压缩功能
6. 添加案例搜索功能