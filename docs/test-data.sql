-- ========================================
-- 测试数据完整脚本
-- 包含：测试用户、帖子、案例、活动等
-- 密码统一为：test1234
-- ========================================

-- 注意：用户账号需要通过 Supabase Auth 创建
-- 以下是测试用户的 profiles 数据
-- 在创建用户后，使用这些SQL更新profiles

-- 测试用户1：李明 - AI工程师
-- email: liming@test.com
INSERT INTO profiles (id, email, name, role, bio, company, position, location, skills, points, show_on_member_wall)
VALUES
('user-liming-id', 'liming@test.com', '李明', 'member', '热爱AI技术，专注于大模型应用开发', '字节跳动', 'AI工程师', '成都', ARRAY['Python', 'PyTorch', 'LLM', 'RAG'], 350, true)
ON CONFLICT (id) DO NOTHING;

-- 测试用户2：王芳 - 产品经理
-- email: wangfang@test.com
INSERT INTO profiles (id, email, name, role, bio, company, position, location, skills, points, show_on_member_wall)
VALUES
('user-wangfang-id', 'wangfang@test.com', '王芳', 'vip', '产品经理，擅长AI产品设计和用户增长', '腾讯', '高级产品经理', '成都', ARRAY['产品设计', '用户研究', '数据分析'], 520, true)
ON CONFLICT (id) DO NOTHING;

-- 测试用户3：张伟 - 创业者
-- email: zhangwei@test.com
INSERT INTO profiles (id, email, name, role, bio, company, position, location, skills, points, show_on_member_wall)
VALUES
('user-zhangwei-id', 'zhangwei@test.com', '张伟', 'member', '连续创业者，正在探索AI在教育领域的应用', '智学科技', '创始人&CEO', '成都', ARRAY['创业', '教育AI', '团队管理'], 280, true)
ON CONFLICT (id) DO NOTHING;

-- 测试用户4：刘洋 - 全栈开发者
-- email: liuyang@test.com
INSERT INTO profiles (id, email, name, role, bio, company, position, location, skills, points, show_on_member_wall)
VALUES
('user-liuyang-id', 'liuyang@test.com', '刘洋', 'vip', '全栈工程师，热爱开源和技术分享', '美团', '高级开发工程师', '成都', ARRAY['React', 'Node.js', 'Python', 'Go'], 410, true)
ON CONFLICT (id) DO NOTHING;

-- 测试用户5：陈静 - UI设计师
-- email: chenjing@test.com
INSERT INTO profiles (id, email, name, role, bio, company, position, location, skills, points, show_on_member_wall)
VALUES
('user-chenjing-id', 'chenjing@test.com', '陈静', 'member', 'UI/UX设计师，专注AI产品的交互设计', '阿里巴巴', '高级UI设计师', '成都', ARRAY['UI设计', 'UX设计', 'Figma', 'AI产品'], 320, true)
ON CONFLICT (id) DO NOTHING;

-- 测试用户6：赵磊 - 数据科学家
-- email: zhaolei@test.com
INSERT INTO profiles (id, email, name, role, bio, company, position, location, skills, points, show_on_member_wall)
VALUES
('user-zhaolei-id', 'zhaolei@test.com', '赵磊', 'member', '数据科学家，擅长机器学习和数据挖掘', '华为', '数据科学家', '成都', ARRAY['机器学习', '数据分析', 'Python', 'TensorFlow'], 390, true)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 测试帖子数据
-- ========================================

INSERT INTO posts (id, title, content, author_id, category, is_elite, created_at) VALUES
('post-1', '分享：如何使用LangChain构建RAG系统', '最近在做一个基于LangChain的RAG系统，分享一些经验和踩过的坑。RAG（Retrieval-Augmented Generation）是一种结合检索和生成的技术...',
 'user-liming-id', '技术分享', true, NOW() - INTERVAL '5 days'),

('post-2', '求助：产品经理如何快速上手AI产品？', '作为一名传统产品经理，最近接到任务要设计一款AI教育产品。想请教一下大家，AI产品设计和传统产品设计有什么区别？有哪些需要注意的地方？',
 'user-wangfang-id', '求助', false, NOW() - INTERVAL '3 days'),

('post-3', '【招募】AI教育项目寻找技术合伙人', '我们正在做一个AI+教育的项目，已经完成了MVP，现在寻找一位懂技术的合伙人。项目主要用到了GPT-4和知识图谱技术...',
 'user-zhangwei-id', '项目合作', true, NOW() - INTERVAL '7 days'),

('post-4', '技术分享：Next.js 14新特性实战', 'Next.js 14发布了很多新特性，包括Server Actions、Partial Prerendering等。这篇文章分享我在实际项目中如何使用这些新特性...',
 'user-liuyang-id', '技术分享', true, NOW() - INTERVAL '2 days'),

('post-5', '讨论：AI时代，设计师会被取代吗？', '随着AI设计工具越来越多，很多人担心设计师会被AI取代。作为UI设计师，我有一些想法想和大家讨论...',
 'user-chenjing-id', '讨论', false, NOW() - INTERVAL '1 day'),

('post-6', '分享：数据科学家的一天', '很多人对数据科学家的工作很好奇，今天分享一下我作为数据科学家的日常工作流程和使用的工具...',
 'user-zhaolei-id', '经验分享', false, NOW() - INTERVAL '4 days');

-- ========================================
-- 测试案例数据
-- ========================================

INSERT INTO cases (id, title, category, description, author, author_id, tags, content, created_at) VALUES
('case-1', 'AI客服机器人实战：从0到1', 'AI应用', '分享我们如何为公司开发一个智能客服系统，处理80%的常见问题', '李明', 'user-liming-id', ARRAY['AI', 'ChatGPT', '客服', 'RAG'],
 '## 项目背景\n我们的客服团队每天要处理大量重复性问题...\n\n## 技术选型\n- 后端：Python + FastAPI\n- LLM：GPT-4\n- 向量数据库：Pinecone\n\n## 遇到的挑战\n1. 如何提高回答准确率\n2. 如何控制成本\n3. 如何保证响应速度\n\n## 解决方案\n...', NOW() - INTERVAL '10 days'),

('case-2', '教育AI产品从需求到落地', '产品实战', '记录一个AI教育产品从需求分析到上线的完整过程', '王芳', 'user-wangfang-id', ARRAY['产品', '教育', 'AI', '用户增长'],
 '## 项目背景\n随着AI技术的发展，教育行业迎来新机遇...\n\n## 需求调研\n我们访谈了100位家长和学生...\n\n## 产品设计\n核心功能：\n1. 智能题目推荐\n2. AI答疑助手\n3. 学习路径规划\n\n## 上线数据\n- 用户增长：首月10000+注册\n- 留存率：次日40%，七日25%\n\n## 经验总结\n...', NOW() - INTERVAL '15 days'),

('case-3', '创业公司如何用AI降本增效', '创业经验', '作为一家初创公司，我们如何用AI工具提升团队效率50%', '张伟', 'user-zhangwei-id', ARRAY['创业', 'AI', '效率', '团队管理'],
 '## 背景\n我们是一家10人的AI教育初创公司...\n\n## 使用AI工具\n1. **代码开发**：GitHub Copilot\n2. **文档写作**：Claude + Notion AI\n3. **客户服务**：ChatGPT\n4. **数据分析**：GPT-4 + Python\n\n## 效果数据\n- 开发效率提升：60%\n- 文档效率提升：40%\n- 客服效率提升：80%\n\n## 成本分析\n- AI工具成本：每月$200\n- 节省人力成本：每月$3000\n\n## 建议\n...', NOW() - INTERVAL '20 days');

-- ========================================
-- 测试活动数据
-- ========================================

INSERT INTO events (id, title, description, location, date, max_participants, price, status, created_at) VALUES
('event-1', 'AI创客线下交流会 - 第12期', '本期主题：大模型应用落地实践分享', '成都市高新区天府软件园C区', '2026-03-25', 50, 0, 'upcoming', NOW() - INTERVAL '7 days'),
('event-2', 'RAG系统开发工作坊', '手把手教你搭建一个RAG系统，需要自带电脑', '成都市武侯区创客空间', '2026-03-28', 30, 99, 'upcoming', NOW() - INTERVAL '5 days'),
('event-3', 'AI产品设计沙龙', '邀请资深产品经理分享AI产品设计方法论', '成都市锦江区星巴克臻选店', '2026-04-02', 40, 0, 'upcoming', NOW() - INTERVAL '3 days');

-- ========================================
-- 测试积分记录
-- ========================================

INSERT INTO point_records (user_id, points, reason, type, created_at) VALUES
('user-liming-id', 10, '发布帖子', 'post', NOW() - INTERVAL '5 days'),
('user-liming-id', 100, '帖子被设为精华', 'elite_post', NOW() - INTERVAL '4 days'),
('user-wangfang-id', 10, '发布帖子', 'post', NOW() - INTERVAL '3 days'),
('user-zhangwei-id', 10, '发布帖子', 'post', NOW() - INTERVAL '7 days'),
('user-zhangwei-id', 100, '帖子被设为精华', 'elite_post', NOW() - INTERVAL '6 days'),
('user-liuyang-id', 10, '发布帖子', 'post', NOW() - INTERVAL '2 days'),
('user-liuyang-id', 100, '帖子被设为精华', 'elite_post', NOW() - INTERVAL '1 day'),
('user-chenjing-id', 10, '发布帖子', 'post', NOW() - INTERVAL '1 day'),
('user-zhaolei-id', 10, '发布帖子', 'post', NOW() - INTERVAL '4 days'),
('user-liming-id', 50, '发布实战案例', 'case', NOW() - INTERVAL '10 days'),
('user-wangfang-id', 50, '发布实战案例', 'case', NOW() - INTERVAL '15 days'),
('user-zhangwei-id', 50, '发布实战案例', 'case', NOW() - INTERVAL '20 days');

-- ========================================
-- 测试站内信
-- ========================================

INSERT INTO messages (sender_id, receiver_id, title, content, type, created_at) VALUES
(NULL, 'user-liming-id', '恭喜！您的帖子被设为精华', '您的帖子《分享：如何使用LangChain构建RAG系统》被管理员设为精华帖，获得100积分奖励！', 'notification', NOW() - INTERVAL '4 days'),
(NULL, 'user-zhangwei-id', '恭喜！您的帖子被设为精华', '您的帖子《【招募】AI教育项目寻找技术合伙人》被管理员设为精华帖，获得100积分奖励！', 'notification', NOW() - INTERVAL '6 days'),
(NULL, 'user-liuyang-id', '恭喜！您的帖子被设为精华', '您的帖子《技术分享：Next.js 14新特性实战》被管理员设为精华帖，获得100积分奖励！', 'notification', NOW() - INTERVAL '1 day'),
('user-wangfang-id', 'user-liming-id', '关于RAG系统的问题', '李明你好，看了你分享的RAG系统文章，有个问题想请教一下...', 'private', NOW() - INTERVAL '2 days');

-- ========================================
-- 完成！
-- ========================================