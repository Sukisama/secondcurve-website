-- ========================================
-- 一键修复和测试数据插入脚本
-- 自动适配现有数据库结构，不会出错
-- ========================================

-- ========== 第一步：确保所有必需的字段都存在 ==========

-- 为 profiles 表添加缺失字段
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'member_code') THEN
    ALTER TABLE profiles ADD COLUMN member_code VARCHAR UNIQUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_points') THEN
    ALTER TABLE profiles ADD COLUMN total_points INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'company') THEN
    ALTER TABLE profiles ADD COLUMN company VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'position') THEN
    ALTER TABLE profiles ADD COLUMN position VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location') THEN
    ALTER TABLE profiles ADD COLUMN location VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website') THEN
    ALTER TABLE profiles ADD COLUMN website VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'wechat') THEN
    ALTER TABLE profiles ADD COLUMN wechat VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'weibo') THEN
    ALTER TABLE profiles ADD COLUMN weibo VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'twitter') THEN
    ALTER TABLE profiles ADD COLUMN twitter VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'github') THEN
    ALTER TABLE profiles ADD COLUMN github VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'linkedin') THEN
    ALTER TABLE profiles ADD COLUMN linkedin VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'skills') THEN
    ALTER TABLE profiles ADD COLUMN skills TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'interests') THEN
    ALTER TABLE profiles ADD COLUMN interests TEXT[];
  END IF;
END $$;

-- 为 posts 表添加缺失字段
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'user_id') THEN
    ALTER TABLE posts ADD COLUMN user_id UUID REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_id') THEN
    ALTER TABLE posts ADD COLUMN author_id UUID REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'likes_count') THEN
    ALTER TABLE posts ADD COLUMN likes_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'favorites_count') THEN
    ALTER TABLE posts ADD COLUMN favorites_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'is_elite') THEN
    ALTER TABLE posts ADD COLUMN is_elite BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'elite_at') THEN
    ALTER TABLE posts ADD COLUMN elite_at TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'elite_by') THEN
    ALTER TABLE posts ADD COLUMN elite_by UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'category') THEN
    ALTER TABLE posts ADD COLUMN category VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'tags') THEN
    ALTER TABLE posts ADD COLUMN tags TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'views') THEN
    ALTER TABLE posts ADD COLUMN views INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'created_at') THEN
    ALTER TABLE posts ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'updated_at') THEN
    ALTER TABLE posts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- 为 cases 表添加缺失字段
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'author_id') THEN
    ALTER TABLE cases ADD COLUMN author_id UUID REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'author_name') THEN
    ALTER TABLE cases ADD COLUMN author_name VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'category') THEN
    ALTER TABLE cases ADD COLUMN category VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'tags') THEN
    ALTER TABLE cases ADD COLUMN tags TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'cover_image') THEN
    ALTER TABLE cases ADD COLUMN cover_image VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'company') THEN
    ALTER TABLE cases ADD COLUMN company VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'industry') THEN
    ALTER TABLE cases ADD COLUMN industry VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'website') THEN
    ALTER TABLE cases ADD COLUMN website VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'overview') THEN
    ALTER TABLE cases ADD COLUMN overview TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'content') THEN
    ALTER TABLE cases ADD COLUMN content TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'views') THEN
    ALTER TABLE cases ADD COLUMN views INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'created_at') THEN
    ALTER TABLE cases ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'updated_at') THEN
    ALTER TABLE cases ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- 为 events 表添加缺失字段
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'status') THEN
    ALTER TABLE events ADD COLUMN status VARCHAR DEFAULT 'upcoming';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'tags') THEN
    ALTER TABLE events ADD COLUMN tags TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'cover_image') THEN
    ALTER TABLE events ADD COLUMN cover_image VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'start_time') THEN
    ALTER TABLE events ADD COLUMN start_time VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'end_time') THEN
    ALTER TABLE events ADD COLUMN end_time VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'price_non_vip') THEN
    ALTER TABLE events ADD COLUMN price_non_vip INTEGER DEFAULT 68;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'price_vip') THEN
    ALTER TABLE events ADD COLUMN price_vip INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'max_participants') THEN
    ALTER TABLE events ADD COLUMN max_participants INTEGER DEFAULT 50;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'current_participants') THEN
    ALTER TABLE events ADD COLUMN current_participants INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'created_at') THEN
    ALTER TABLE events ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'updated_at') THEN
    ALTER TABLE events ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- 为 point_records 表添加缺失字段
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_records' AND column_name = 'user_id') THEN
    ALTER TABLE point_records ADD COLUMN user_id UUID REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_records' AND column_name = 'points') THEN
    ALTER TABLE point_records ADD COLUMN points INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_records' AND column_name = 'action_key') THEN
    ALTER TABLE point_records ADD COLUMN action_key VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_records' AND column_name = 'action_name') THEN
    ALTER TABLE point_records ADD COLUMN action_name VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_records' AND column_name = 'description') THEN
    ALTER TABLE point_records ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_records' AND column_name = 'admin_user_id') THEN
    ALTER TABLE point_records ADD COLUMN admin_user_id UUID REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_records' AND column_name = 'created_at') THEN
    ALTER TABLE point_records ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- 为 point_settings 表添加缺失字段
DO $$
BEGIN
  -- 如果存在 action 列但不存在 action_key，则重命名
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_settings' AND column_name = 'action') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_settings' AND column_name = 'action_key') THEN
      ALTER TABLE point_settings RENAME COLUMN action TO action_key;
    END IF;
  END IF;

  -- 添加 action_key 列（如果不存在）
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_settings' AND column_name = 'action_key') THEN
    ALTER TABLE point_settings ADD COLUMN action_key VARCHAR(100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_settings' AND column_name = 'action_name') THEN
    ALTER TABLE point_settings ADD COLUMN action_name VARCHAR;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_settings' AND column_name = 'points') THEN
    ALTER TABLE point_settings ADD COLUMN points INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_settings' AND column_name = 'description') THEN
    ALTER TABLE point_settings ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_settings' AND column_name = 'is_active') THEN
    ALTER TABLE point_settings ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_settings' AND column_name = 'created_at') THEN
    ALTER TABLE point_settings ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_settings' AND column_name = 'updated_at') THEN
    ALTER TABLE point_settings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- 为 knowledge_items 表添加缺失字段
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_items' AND column_name = 'type') THEN
    ALTER TABLE knowledge_items ADD COLUMN type VARCHAR(50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_items' AND column_name = 'title') THEN
    ALTER TABLE knowledge_items ADD COLUMN title VARCHAR(255);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_items' AND column_name = 'description') THEN
    ALTER TABLE knowledge_items ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_items' AND column_name = 'content') THEN
    ALTER TABLE knowledge_items ADD COLUMN content TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_items' AND column_name = 'link') THEN
    ALTER TABLE knowledge_items ADD COLUMN link TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_items' AND column_name = 'cover_image') THEN
    ALTER TABLE knowledge_items ADD COLUMN cover_image TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_items' AND column_name = 'author_id') THEN
    ALTER TABLE knowledge_items ADD COLUMN author_id UUID REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_items' AND column_name = 'is_vip_only') THEN
    ALTER TABLE knowledge_items ADD COLUMN is_vip_only BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_items' AND column_name = 'created_at') THEN
    ALTER TABLE knowledge_items ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_items' AND column_name = 'updated_at') THEN
    ALTER TABLE knowledge_items ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- ========== 第二步：创建缺失的表 ==========

CREATE TABLE IF NOT EXISTS point_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  points INTEGER NOT NULL,
  action_key VARCHAR NOT NULL,
  action_name VARCHAR NOT NULL,
  description TEXT,
  admin_user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS point_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action_key VARCHAR(100) NOT NULL UNIQUE,
  action_name VARCHAR NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

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

INSERT INTO point_settings (action_key, action_name, points, description) VALUES
('create_post', '发布帖子', 10, '发布帖子'),
('create_case', '发布实战案例', 50, '发布实战案例'),
('join_event', '参加活动', 20, '参加活动'),
('elite_post', '帖子被设为精华', 100, '帖子被设为精华'),
('comment_post', '评论帖子', 5, '评论帖子')
ON CONFLICT (action_key) DO NOTHING;

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
END $$;

-- ========== 第六步：插入测试数据（简化版 - 只使用基本字段） ==========

-- 插入测试帖子（包含必需的 author_id 字段）
INSERT INTO posts (title, content, category, author_id, created_at, updated_at)
SELECT
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
  (SELECT id FROM profiles LIMIT 1),
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE title = '欢迎来到第二曲线社区');

INSERT INTO posts (title, content, category, author_id, created_at, updated_at)
SELECT
  'AI学习路线分享',
  '# AI学习路线分享

作为一个AI学习者，我想分享一些学习心得：

## 基础知识

1. **数学基础**：线性代数、概率论、微积分
2. **编程基础**：Python、数据处理
3. **机器学习**：监督学习、无监督学习

希望对大家有帮助！',
  '分享',
  (SELECT id FROM profiles LIMIT 1),
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE title = 'AI学习路线分享');

-- 插入测试案例
INSERT INTO cases (title, description, category, created_at, updated_at)
SELECT
  'AI客服机器人实战案例',
  '使用大模型构建智能客服系统，提升客户服务效率',
  'AI应用',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
WHERE NOT EXISTS (SELECT 1 FROM cases WHERE title = 'AI客服机器人实战案例');

INSERT INTO cases (title, description, category, created_at, updated_at)
SELECT
  'RAG知识库系统实现',
  '基于向量数据库的知识检索增强生成系统',
  'AI应用',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
WHERE NOT EXISTS (SELECT 1 FROM cases WHERE title = 'RAG知识库系统实现');

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
    INSERT INTO point_records (user_id, points, action_key, action_name, description, created_at)
    VALUES (
      test_user_id,
      10,
      'create_post',
      '发布帖子',
      '发布测试帖子',
      NOW() - INTERVAL '1 day'
    );
  END IF;

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