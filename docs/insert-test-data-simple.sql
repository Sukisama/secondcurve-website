-- ========================================
-- 超级安全的测试数据插入脚本
-- 只插入最基础的必需字段，避免所有字段不匹配问题
-- ========================================

-- 检查是否有现有用户
DO $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;

  IF user_count = 0 THEN
    RAISE EXCEPTION '❌ 没有找到用户，请先在网站上注册一个账号！';
  END IF;

  RAISE NOTICE '✅ 找到 % 个用户，开始插入测试数据...', user_count;
END $$;

-- ============================================
-- 插入测试帖子（只使用最基础字段）
-- ============================================

-- 帖子 1
INSERT INTO posts (user_id, author_id, title, content, created_at, updated_at)
SELECT
  (SELECT id FROM profiles LIMIT 1),
  (SELECT id FROM profiles LIMIT 1),
  '欢迎来到第二曲线社区',
  '# 欢迎来到第二曲线社区

这是一个AI爱好者的交流平台，我们致力于帮助大家更好地学习和应用AI技术。

## 社区特色

- 📚 丰富的学习资源
- 💬 活跃的交流氛围
- 🎯 实战案例分享
- 🤝 资源对接平台

欢迎大家积极参与社区活动！',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE title = '欢迎来到第二曲线社区');

-- 帖子 2
INSERT INTO posts (user_id, author_id, title, content, created_at, updated_at)
SELECT
  (SELECT id FROM profiles LIMIT 1),
  (SELECT id FROM profiles LIMIT 1),
  'AI学习路线分享',
  '# AI学习路线分享

作为一个AI学习者，我想分享一些学习心得：

## 基础知识

1. **数学基础**：线性代数、概率论、微积分
2. **编程基础**：Python、数据处理
3. **机器学习**：监督学习、无监督学习

希望对大家有帮助！',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE title = 'AI学习路线分享');

-- ============================================
-- 插入测试案例（只使用最基础字段）
-- ============================================

-- 案例 1
INSERT INTO cases (title, description, created_at, updated_at)
SELECT
  'AI客服机器人实战案例',
  '使用大模型构建智能客服系统，提升客户服务效率',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
WHERE NOT EXISTS (SELECT 1 FROM cases WHERE title = 'AI客服机器人实战案例');

-- 案例 2
INSERT INTO cases (title, description, created_at, updated_at)
SELECT
  'RAG知识库系统实现',
  '基于向量数据库的知识检索增强生成系统',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
WHERE NOT EXISTS (SELECT 1 FROM cases WHERE title = 'RAG知识库系统实现');

-- ============================================
-- 插入测试活动（只使用最基础字段）
-- ============================================

-- 活动 1
INSERT INTO events (title, description, location, event_date, created_at, updated_at)
SELECT
  'AI技术分享会',
  '探讨最新的AI技术和应用趋势',
  '成都高新区天府软件园',
  NOW() + INTERVAL '7 days',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'AI技术分享会');

-- 活动 2
INSERT INTO events (title, description, location, event_date, created_at, updated_at)
SELECT
  'Prompt Engineering 工作坊',
  '学习如何编写高质量的AI提示词',
  '成都武侯区',
  NOW() + INTERVAL '14 days',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Prompt Engineering 工作坊');

-- ============================================
-- 插入知识库测试数据
-- ============================================

INSERT INTO knowledge_items (type, title, description, content, is_vip_only, created_at)
VALUES
  ('topic_series', '大模型微调实战', '深入讲解如何微调大模型', '# 大模型微调实战

## 课程大纲

1. 微调基础概念
2. 数据准备
3. 模型选择
4. 训练技巧
5. 模型评估

适合有一定基础的开发者学习。', true, NOW() - INTERVAL '5 days'),
  ('topic_series', 'RAG系统开发', '从零构建知识检索增强系统', '# RAG系统开发

## 内容包括

- 向量数据库选型
- 文本嵌入技术
- 检索策略优化
- 生成质量提升

实战项目驱动学习。', true, NOW() - INTERVAL '4 days'),
  ('learning_material', 'Prompt Engineering 指南', '学习如何编写高质量的提示词', '# Prompt Engineering 指南

## 核心原则

1. 明确性：清楚地表达你的需求
2. 具体性：提供详细的上下文
3. 结构化：使用合理的格式
4. 迭代优化：不断改进你的提示

掌握这些原则，让AI更好地为你服务。', false, NOW() - INTERVAL '4 days'),
  ('tool', 'ChatGPT', '强大的AI对话工具', 'https://chat.openai.com', false, NOW() - INTERVAL '3 days'),
  ('tool', 'Claude', 'Anthropic开发的AI助手', 'https://claude.ai', false, NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- ============================================
-- 添加积分记录
-- ============================================

INSERT INTO point_records (user_id, points, action_name, description, type, created_at)
SELECT
  (SELECT id FROM profiles LIMIT 1),
  10,
  '发布帖子',
  '发布测试帖子',
  'create_post',
  NOW() - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM point_records LIMIT 1);

-- 更新用户的总积分
UPDATE profiles
SET total_points = (SELECT COALESCE(SUM(points), 0) FROM point_records WHERE user_id = profiles.id)
WHERE id = (SELECT id FROM profiles LIMIT 1);

-- ============================================
-- 最终统计
-- ============================================

SELECT
  '✅ 测试数据已成功插入！' AS status,
  (SELECT COUNT(*) FROM posts) as posts_count,
  (SELECT COUNT(*) FROM cases) as cases_count,
  (SELECT COUNT(*) FROM events) as events_count,
  (SELECT COUNT(*) FROM knowledge_items) as knowledge_count;