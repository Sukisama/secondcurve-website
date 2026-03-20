-- ========================================
-- 完整且经过验证的数据库修复脚本
-- ⚠️ 修复所有发现的架构问题
-- ========================================

-- ========== 第一步：创建缺失的关键表 ==========

-- 1. comments 表（论坛评论功能）
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. transactions 表（交易记录功能）
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR NOT NULL, -- 'vip_purchase', 'event_payment', 'refund'
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  description TEXT,
  related_id UUID, -- 关联的活动ID或VIP记录ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== 第二步：修复 profiles 表 ==========

DO $$
BEGIN
  -- 将 avatar_url 重命名为 avatar（如果存在）
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar') THEN
      ALTER TABLE profiles RENAME COLUMN avatar_url TO avatar;
    END IF;
  END IF;

  -- 添加 avatar 列（如果不存在）
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar') THEN
    ALTER TABLE profiles ADD COLUMN avatar VARCHAR;
  END IF;

  -- 其他缺失的字段
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

-- ========== 第三步：修复 posts 表 ==========

DO $$
BEGIN
  -- 添加 author_id（如果不存在）
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_id') THEN
    ALTER TABLE posts ADD COLUMN author_id UUID REFERENCES profiles(id);
  END IF;

  -- 如果只有 user_id 但没有 author_id，复制数据
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'user_id') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_id') THEN
      ALTER TABLE posts ADD COLUMN author_id UUID REFERENCES profiles(id);
      UPDATE posts SET author_id = user_id WHERE author_id IS NULL;
    END IF;
  END IF;

  -- 其他必需字段
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

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'is_pinned') THEN
    ALTER TABLE posts ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
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

-- ========== 第四步：修复 point_records 表 ==========

DO $$
BEGIN
  -- 如果存在 action 列但不存在 action_key，则重命名
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_records' AND column_name = 'action') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_records' AND column_name = 'action_key') THEN
      ALTER TABLE point_records RENAME COLUMN action TO action_key;
    END IF;
  END IF;

  -- 添加 action_key 列（如果不存在）
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_records' AND column_name = 'action_key') THEN
    ALTER TABLE point_records ADD COLUMN action_key VARCHAR;
  END IF;

  -- 添加 action_name 列（如果不存在）
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_records' AND column_name = 'action_name') THEN
    ALTER TABLE point_records ADD COLUMN action_name VARCHAR;
  END IF;

  -- 添加 admin_user_id 列（如果不存在）
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_records' AND column_name = 'admin_user_id') THEN
    ALTER TABLE point_records ADD COLUMN admin_user_id UUID REFERENCES profiles(id);
  END IF;

  -- 移除不再需要的列（type 和 related_id）
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_records' AND column_name = 'type') THEN
    ALTER TABLE point_records DROP COLUMN type;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_records' AND column_name = 'related_id') THEN
    ALTER TABLE point_records DROP COLUMN related_id;
  END IF;
END $$;

-- ========== 第五步：修复 point_settings 表 ==========

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
    ALTER TABLE point_settings ADD COLUMN action_key VARCHAR(100) UNIQUE;
  END IF;

  -- 添加 action_name 列（如果不存在）
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_settings' AND column_name = 'action_name') THEN
    ALTER TABLE point_settings ADD COLUMN action_name VARCHAR;
  END IF;

  -- 确保其他必需列存在
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_settings' AND column_name = 'points') THEN
    ALTER TABLE point_settings ADD COLUMN points INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_settings' AND column_name = 'description') THEN
    ALTER TABLE point_settings ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_settings' AND column_name = 'is_active') THEN
    ALTER TABLE point_settings ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- ========== 第六步：确保其他关键表存在 ==========

-- cases 表必需字段
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

-- events 表必需字段
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

-- knowledge_items 表必需字段
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_items' AND column_name = 'author_id') THEN
    ALTER TABLE knowledge_items ADD COLUMN author_id UUID REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_items' AND column_name = 'created_at') THEN
    ALTER TABLE knowledge_items ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_items' AND column_name = 'updated_at') THEN
    ALTER TABLE knowledge_items ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- ========== 第七步：创建关联表（如果不存在） ==========

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

-- ========== 第八步：插入默认积分设置 ==========

INSERT INTO point_settings (action_key, action_name, points, description, is_active)
VALUES
  ('create_post', '发布帖子', 10, '发布帖子获得积分', true),
  ('create_case', '发布实战案例', 50, '发布实战案例获得积分', true),
  ('join_event', '参加活动', 20, '参加活动获得积分', true),
  ('elite_post', '帖子被设为精华', 100, '帖子被设为精华获得积分', true),
  ('comment_post', '评论帖子', 5, '评论帖子获得积分', true)
ON CONFLICT (action_key) DO NOTHING;

-- ========== 第九步：创建触发器 ==========

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

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
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

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 点赞计数触发器
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

-- 收藏计数触发器
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

-- ========== 第十步：创建索引优化性能 ==========

CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_likes_count ON posts(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_favorites_count ON posts(favorites_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_profiles_member_code ON profiles(member_code);
CREATE INDEX IF NOT EXISTS idx_profiles_total_points ON profiles(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_point_records_user_id ON point_records(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_favorites_user_id ON post_favorites(user_id);

-- ========== 完成！ ==========

SELECT
  '✅ 数据库修复完成！' AS status,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'profiles') as profiles_columns,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'posts') as posts_columns,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'comments') as comments_columns,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'transactions') as transactions_columns,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'point_records') as point_records_columns,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'point_settings') as point_settings_columns;