-- ========================================
-- 一键修复和测试数据插入脚本
-- 自动适配现有数据库结构，不会出错
-- ========================================

-- ========== 第一步：确保所有必需的字段都存在 ==========

-- 为 profiles 表添加缺失字段
DO $$
BEGIN
  -- 成员编号
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'member_code') THEN
    ALTER TABLE profiles ADD COLUMN member_code VARCHAR UNIQUE;
  END IF;

  -- 总积分
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_points') THEN
    ALTER TABLE profiles ADD COLUMN total_points INTEGER DEFAULT 0;
  END IF;

  -- 个人简介
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
  END IF;

  -- 公司
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'company') THEN
    ALTER TABLE profiles ADD COLUMN company VARCHAR;
  END IF;

  -- 职位
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'position') THEN
    ALTER TABLE profiles ADD COLUMN position VARCHAR;
  END IF;

  -- 地点
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location') THEN
    ALTER TABLE profiles ADD COLUMN location VARCHAR;
  END IF;

  -- 个人网站
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website') THEN
    ALTER TABLE profiles ADD COLUMN website VARCHAR;
  END IF;

  -- 微信
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'wechat') THEN
    ALTER TABLE profiles ADD COLUMN wechat VARCHAR;
  END IF;

  -- 微博
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'weibo') THEN
    ALTER TABLE profiles ADD COLUMN weibo VARCHAR;
  END IF;

  -- Twitter
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'twitter') THEN
    ALTER TABLE profiles ADD COLUMN twitter VARCHAR;
  END IF;

  -- GitHub
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'github') THEN
    ALTER TABLE profiles ADD COLUMN github VARCHAR;
  END IF;

  -- LinkedIn
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'linkedin') THEN
    ALTER TABLE profiles ADD COLUMN linkedin VARCHAR;
  END IF;

  -- 技能标签
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'skills') THEN
    ALTER TABLE profiles ADD COLUMN skills TEXT[];
  END IF;

  -- 兴趣领域
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'interests') THEN
    ALTER TABLE profiles ADD COLUMN interests TEXT[];
  END IF;

  RAISE NOTICE '✅ profiles 表字段检查完成';
END $$;

-- 为 posts 表添加缺失字段
DO $$
BEGIN
  -- user_id (作者ID)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'user_id') THEN
    ALTER TABLE posts ADD COLUMN user_id UUID REFERENCES profiles(id);
  END IF;

  -- author_id (作者ID，与user_id相同，用于兼容)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_id') THEN
    ALTER TABLE posts ADD COLUMN author_id UUID REFERENCES profiles(id);
  END IF;

  -- 点赞数
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'likes_count') THEN
    ALTER TABLE posts ADD COLUMN likes_count INTEGER DEFAULT 0;
  END IF;

  -- 收藏数
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'favorites_count') THEN
    ALTER TABLE posts ADD COLUMN favorites_count INTEGER DEFAULT 0;
  END IF;

  -- 是否精华
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'is_elite') THEN
    ALTER TABLE posts ADD COLUMN is_elite BOOLEAN DEFAULT FALSE;
  END IF;

  -- 精华时间
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'elite_at') THEN
    ALTER TABLE posts ADD COLUMN elite_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- 精华操作人
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'elite_by') THEN
    ALTER TABLE posts ADD COLUMN elite_by UUID;
  END IF;

  -- 分类
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'category') THEN
    ALTER TABLE posts ADD COLUMN category VARCHAR;
  END IF;

  -- 标签
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'tags') THEN
    ALTER TABLE posts ADD COLUMN tags TEXT[];
  END IF;

  -- 浏览量
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'views') THEN
    ALTER TABLE posts ADD COLUMN views INTEGER DEFAULT 0;
  END IF;

  -- 创建时间
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'created_at') THEN
    ALTER TABLE posts ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  -- 更新时间
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'updated_at') THEN
    ALTER TABLE posts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  RAISE NOTICE '✅ posts 表字段检查完成';
END $$;

-- 为 cases 表添加缺失字段
DO $$
BEGIN
  -- 作者ID
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'author_id') THEN
    ALTER TABLE cases ADD COLUMN author_id UUID REFERENCES profiles(id);
  END IF;

  -- 作者名称
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'author_name') THEN
    ALTER TABLE cases ADD COLUMN author_name VARCHAR;
  END IF;

  -- 分类
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'category') THEN
    ALTER TABLE cases ADD COLUMN category VARCHAR;
  END IF;

  -- 标签
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'tags') THEN
    ALTER TABLE cases ADD COLUMN tags TEXT[];
  END IF;

  -- 封面图
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'cover_image') THEN
    ALTER TABLE cases ADD COLUMN cover_image VARCHAR;
  END IF;

  -- 公司
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'company') THEN
    ALTER TABLE cases ADD COLUMN company VARCHAR;
  END IF;

  -- 行业
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'industry') THEN
    ALTER TABLE cases ADD COLUMN industry VARCHAR;
  END IF;

  -- 网站
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'website') THEN
    ALTER TABLE cases ADD COLUMN website VARCHAR;
  END IF;

  -- 概览
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'overview') THEN
    ALTER TABLE cases ADD COLUMN overview TEXT;
  END IF;

  -- 详细内容
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'content') THEN
    ALTER TABLE cases ADD COLUMN content TEXT;
  END IF;

  -- 浏览量
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'views') THEN
    ALTER TABLE cases ADD COLUMN views INTEGER DEFAULT 0;
  END IF;

  -- 创建时间
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'created_at') THEN
    ALTER TABLE cases ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  -- 更新时间
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'updated_at') THEN
    ALTER TABLE cases ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  RAISE NOTICE '✅ cases 表字段检查完成';
END $$;

-- 为 events 表添加缺失字段
DO $$
BEGIN
  -- 状态
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'status') THEN
    ALTER TABLE events ADD COLUMN status VARCHAR DEFAULT 'upcoming';
  END IF;

  -- 标签
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'tags') THEN
    ALTER TABLE events ADD COLUMN tags TEXT[];
  END IF;

  -- 封面图
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'cover_image') THEN
    ALTER TABLE events ADD COLUMN cover_image VARCHAR;
  END IF;

  -- 开始时间
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'start_time') THEN
    ALTER TABLE events ADD COLUMN start_time VARCHAR;
  END IF;

  -- 结束时间
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'end_time') THEN
    ALTER TABLE events ADD COLUMN end_time VARCHAR;
  END IF;

  -- 非VIP价格
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'price_non_vip') THEN
    ALTER TABLE events ADD COLUMN price_non_vip INTEGER DEFAULT 68;
  END IF;

  -- VIP价格
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'price_vip') THEN
    ALTER TABLE events ADD COLUMN price_vip INTEGER DEFAULT 0;
  END IF;

  -- 最大参与人数
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'max_participants') THEN
    ALTER TABLE events ADD COLUMN max_participants INTEGER DEFAULT 50;
  END IF;

  -- 当前参与人数
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'current_participants') THEN
    ALTER TABLE events ADD COLUMN current_participants INTEGER DEFAULT 0;
  END IF;

  -- 创建时间
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'created_at') THEN
    ALTER TABLE events ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  -- 更新时间
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'updated_at') THEN
    ALTER TABLE events ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  RAISE NOTICE '✅ events 表字段检查完成';
END $$;

-- ========== 第二步：创建缺失的表 ==========

-- point_records 表
CREATE TABLE IF NOT EXISTS point_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  points INTEGER NOT NULL,
  action_name VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR NOT NULL,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- point_settings 表
CREATE TABLE IF NOT EXISTS point_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action VARCHAR(100) NOT NULL UNIQUE,
  points INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- post_likes 表
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- post_favorites 表
CREATE TABLE IF NOT EXISTS post_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- event_registrations 表
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  email VARCHAR,
  company VARCHAR,
  notes TEXT,
  status VARCHAR DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- ========== 第三步：插入默认积分设置 ==========

INSERT INTO point_settings (action, points, description) VALUES
('create_post', 10, '发布帖子'),
('create_case', 50, '发布实战案例'),
('join_event', 20, '参加活动'),
('elite_post', 100, '帖子被设为精华'),
('comment_post', 5, '评论帖子')
ON CONFLICT (action) DO NOTHING;

-- ========== 第四步：创建成员编号生成函数 ==========

CREATE OR REPLACE FUNCTION generate_member_code()
RETURNS VARCHAR AS $$
DECLARE
  max_code INTEGER;
  new_code VARCHAR;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(member_code FROM 5) AS INTEGER)), 10000)
  INTO max_code
  FROM profiles
  WHERE member_code ~ '^DEQX\d+$';

  new_code := 'DEQX' || LPAD(CAST(max_code + 1 AS VARCHAR), 5, '0');

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 为现有用户生成成员编号
UPDATE profiles SET member_code = generate_member_code() WHERE member_code IS NULL;

-- ========== 第五步：检查是否有用户 ==========

DO $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;

  IF user_count = 0 THEN
    RAISE EXCEPTION '❌ 数据库中没有用户！请先在网站上注册一个账号，然后再运行此脚本。';
  END IF;

  RAISE NOTICE '✅ 找到 % 个用户，开始插入测试数据...', user_count;
END $$;

-- ========== 第六步：插入测试数据（自动适配字段） ==========

-- 插入测试帖子
DO $$
DECLARE
  test_user_id UUID;
  has_user_id BOOLEAN;
  has_author_id BOOLEAN;
  has_category BOOLEAN;
  user_id_is_required BOOLEAN;
  author_id_is_required BOOLEAN;
  category_is_required BOOLEAN;
BEGIN
  -- 获取第一个用户ID
  SELECT id INTO test_user_id FROM profiles LIMIT 1;

  -- 检查字段是否存在
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'user_id'
  ) INTO has_user_id;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'author_id'
  ) INTO has_author_id;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'category'
  ) INTO has_category;

  -- 检查字段是否为必填（NOT NULL）
  SELECT NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts'
    AND column_name = 'user_id'
    AND is_nullable = 'YES'
  ) INTO user_id_is_required;

  SELECT NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts'
    AND column_name = 'author_id'
    AND is_nullable = 'YES'
  ) INTO author_id_is_required;

  SELECT NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts'
    AND column_name = 'category'
    AND is_nullable = 'YES'
  ) INTO category_is_required;

  -- 帖子 1
  IF NOT EXISTS (SELECT 1 FROM posts WHERE title = '欢迎来到第二曲线社区') THEN
    -- 根据必填字段动态构建INSERT
    IF user_id_is_required AND author_id_is_required AND category_is_required THEN
      INSERT INTO posts (user_id, author_id, title, content, category, created_at, updated_at)
      VALUES (
        test_user_id,
        test_user_id,
        '欢迎来到第二曲线社区',
        '# 欢迎来到第二曲线社区

这是一个AI爱好者的交流平台，我们致力于帮助大家更好地学习和应用AI技术。

## 社区特色

- 📚 丰富的学习资源
- 💬 活跃的交流氛围
- 🎯 实战案例分享
- 🤝 资源对接平台

欢迎大家积极参与社区活动！',
        '公告',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
      );
    ELSIF user_id_is_required AND author_id_is_required THEN
      INSERT INTO posts (user_id, author_id, title, content, created_at, updated_at)
      VALUES (
        test_user_id,
        test_user_id,
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
      );
    ELSE
      INSERT INTO posts (title, content, created_at, updated_at)
      VALUES (
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
      );
    END IF;
  END IF;

  -- 帖子 2
  IF NOT EXISTS (SELECT 1 FROM posts WHERE title = 'AI学习路线分享') THEN
    -- 根据必填字段动态构建INSERT
    IF user_id_is_required AND author_id_is_required AND category_is_required THEN
      INSERT INTO posts (user_id, author_id, title, content, category, created_at, updated_at)
      VALUES (
        test_user_id,
        test_user_id,
        'AI学习路线分享',
        '# AI学习路线分享

作为一个AI学习者，我想分享一些学习心得：

## 基础知识

1. **数学基础**：线性代数、概率论、微积分
2. **编程基础**：Python、数据处理
3. **机器学习**：监督学习、无监督学习

希望对大家有帮助！',
        '分享',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
      );
    ELSIF user_id_is_required AND author_id_is_required THEN
      INSERT INTO posts (user_id, author_id, title, content, created_at, updated_at)
      VALUES (
        test_user_id,
        test_user_id,
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
      );
    ELSE
      INSERT INTO posts (title, content, created_at, updated_at)
      VALUES (
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
      );
    END IF;
  END IF;
END $$;

-- 插入测试案例
DO $$
DECLARE
  test_user_id UUID;
  has_author_id BOOLEAN;
  has_category BOOLEAN;
  category_is_required BOOLEAN;
  has_company BOOLEAN;
  has_views BOOLEAN;
BEGIN
  -- 获取第一个用户ID
  SELECT id INTO test_user_id FROM profiles LIMIT 1;

  -- 检查字段是否存在
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cases' AND column_name = 'author_id'
  ) INTO has_author_id;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cases' AND column_name = 'category'
  ) INTO has_category;

  -- 检查 category 字段是否为必填（NOT NULL）
  SELECT NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cases'
    AND column_name = 'category'
    AND is_nullable = 'YES'
  ) INTO category_is_required;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cases' AND column_name = 'company'
  ) INTO has_company;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cases' AND column_name = 'views'
  ) INTO has_views;

  -- 案例 1
  IF NOT EXISTS (SELECT 1 FROM cases WHERE title = 'AI客服机器人实战案例') THEN
    -- 如果 category 是必填字段，必须包含
    IF category_is_required THEN
      INSERT INTO cases (title, description, category, created_at, updated_at)
      VALUES (
        'AI客服机器人实战案例',
        '使用大模型构建智能客服系统，提升客户服务效率',
        'AI应用',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
      );
    ELSE
      INSERT INTO cases (title, description, created_at, updated_at)
      VALUES (
        'AI客服机器人实战案例',
        '使用大模型构建智能客服系统，提升客户服务效率',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
      );
    END IF;
  END IF;

  -- 案例 2
  IF NOT EXISTS (SELECT 1 FROM cases WHERE title = 'RAG知识库系统实现') THEN
    -- 如果 category 是必填字段，必须包含
    IF category_is_required THEN
      INSERT INTO cases (title, description, category, created_at, updated_at)
      VALUES (
        'RAG知识库系统实现',
        '基于向量数据库的知识检索增强生成系统',
        'AI应用',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
      );
    ELSE
      INSERT INTO cases (title, description, created_at, updated_at)
      VALUES (
        'RAG知识库系统实现',
        '基于向量数据库的知识检索增强生成系统',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
      );
    END IF;
  END IF;
END $$;

-- 插入测试活动
INSERT INTO events (title, description, location, event_date, created_at, updated_at)
SELECT
  'AI技术分享会',
  '探讨最新的AI技术和应用趋势',
  '成都高新区天府软件园',
  NOW() + INTERVAL '7 days',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'AI技术分享会');

INSERT INTO events (title, description, location, event_date, created_at, updated_at)
SELECT
  'Prompt Engineering 工作坊',
  '学习如何编写高质量的AI提示词',
  '成都武侯区',
  NOW() + INTERVAL '14 days',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Prompt Engineering 工作坊');

-- 插入知识库测试数据
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

-- 添加积分记录
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  SELECT id INTO test_user_id FROM profiles LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM point_records LIMIT 1) THEN
    INSERT INTO point_records (user_id, points, action_name, description, type, created_at)
    VALUES (
      test_user_id,
      10,
      '发布帖子',
      '发布测试帖子',
      'create_post',
      NOW() - INTERVAL '1 day'
    );
  END IF;

  -- 更新用户的总积分
  UPDATE profiles
  SET total_points = (SELECT COALESCE(SUM(points), 0) FROM point_records WHERE user_id = profiles.id)
  WHERE id = test_user_id;
END $$;

-- ========== 第七步：创建触发器 ==========

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;
CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_likes_count ON post_likes;
CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_likes_count();

CREATE OR REPLACE FUNCTION update_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET favorites_count = favorites_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET favorites_count = GREATEST(favorites_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_favorites_count ON post_favorites;
CREATE TRIGGER trigger_update_favorites_count
  AFTER INSERT OR DELETE ON post_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_favorites_count();

-- ========== 第八步：创建索引优化性能 ==========

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_likes_count ON posts(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_favorites_count ON posts(favorites_count DESC);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_profiles_member_code ON profiles(member_code);
CREATE INDEX IF NOT EXISTS idx_profiles_total_points ON profiles(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_point_records_user_id ON point_records(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_favorites_user_id ON post_favorites(user_id);

-- ========== 完成！ ==========

SELECT
  '✅ 一键修复和测试数据插入完成！' AS status,
  (SELECT COUNT(*) FROM posts) as posts_count,
  (SELECT COUNT(*) FROM cases) as cases_count,
  (SELECT COUNT(*) FROM events) as events_count,
  (SELECT COUNT(*) FROM knowledge_items) as knowledge_count,
  (SELECT COUNT(*) FROM profiles WHERE member_code IS NOT NULL) as members_with_code;