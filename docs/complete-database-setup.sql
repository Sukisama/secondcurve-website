-- ========================================
-- 第二曲线网站完整数据库设置脚本（安全版）
-- 确保所有基础表存在后再添加关联
-- ========================================

-- ========== 第一步：确保基础表存在 ==========

-- 1. profiles 表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE,
  name VARCHAR,
  avatar_url VARCHAR,
  role VARCHAR DEFAULT 'member',
  vip_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. posts 表（确保包含 user_id）
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR,
  tags TEXT[],
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. cases 表
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  category VARCHAR,
  description TEXT,
  author_name VARCHAR,
  author_id UUID REFERENCES profiles(id),
  tags TEXT[],
  cover_image VARCHAR,
  company VARCHAR,
  industry VARCHAR,
  website VARCHAR,
  overview TEXT,
  content TEXT,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. events 表
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  location VARCHAR,
  event_date TIMESTAMP WITH TIME ZONE,
  start_time VARCHAR,
  end_time VARCHAR,
  price_non_vip INTEGER DEFAULT 68,
  price_vip INTEGER DEFAULT 0,
  max_participants INTEGER DEFAULT 50,
  current_participants INTEGER DEFAULT 0,
  tags TEXT[],
  cover_image VARCHAR,
  status VARCHAR DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. knowledge_items 表
CREATE TABLE IF NOT EXISTS knowledge_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  content TEXT,
  cover_image VARCHAR,
  link VARCHAR,
  is_vip_only BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== 第二步：为现有表添加缺失字段 ==========

-- 为 profiles 表添加字段
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

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'show_on_member_wall') THEN
    ALTER TABLE profiles ADD COLUMN show_on_member_wall BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'show_on_needs') THEN
    ALTER TABLE profiles ADD COLUMN show_on_needs BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'needs') THEN
    ALTER TABLE profiles ADD COLUMN needs TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'can_provide') THEN
    ALTER TABLE profiles ADD COLUMN can_provide TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'looking_for') THEN
    ALTER TABLE profiles ADD COLUMN looking_for TEXT;
  END IF;
END $$;

-- 为 posts 表添加字段
DO $$
BEGIN
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
END $$;

-- ========== 第三步：创建新表 ==========

-- card_views 表
CREATE TABLE IF NOT EXISTS card_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_user_id UUID REFERENCES profiles(id) NOT NULL,
  viewer_id UUID REFERENCES profiles(id),
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- messages 表
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'private',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- post_likes 表（现在 posts 表已存在，可以安全创建）
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

-- ========== 第四步：插入默认数据 ==========

INSERT INTO point_settings (action, points, description) VALUES
('create_post', 10, '发布帖子'),
('create_case', 50, '发布实战案例'),
('join_event', 20, '参加活动'),
('elite_post', 100, '帖子被设为精华'),
('comment_post', 5, '评论帖子')
ON CONFLICT (action) DO NOTHING;

-- ========== 第五步：创建触发器和函数 ==========

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

DROP TRIGGER IF EXISTS update_point_settings_updated_at ON point_settings;
CREATE TRIGGER update_point_settings_updated_at
  BEFORE UPDATE ON point_settings
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

-- ========== 第六步：成员编号系统 ==========

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

-- ========== 第七步：RLS 策略 ==========

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Cases are viewable by everyone" ON cases;
CREATE POLICY "Cases are viewable by everyone" ON cases FOR SELECT USING (true);

DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own point records" ON point_records;
CREATE POLICY "Users can view own point records" ON point_records FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert point records" ON point_records;
CREATE POLICY "System can insert point records" ON point_records FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (receiver_id = auth.uid() OR sender_id = auth.uid());

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own messages" ON messages;
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE USING (receiver_id = auth.uid());

DROP POLICY IF EXISTS "Users can view all likes" ON post_likes;
CREATE POLICY "Users can view all likes" ON post_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can like posts" ON post_likes;
CREATE POLICY "Users can like posts" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike posts" ON post_likes;
CREATE POLICY "Users can unlike posts" ON post_likes FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view all favorites" ON post_favorites;
CREATE POLICY "Users can view all favorites" ON post_favorites FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can favorite posts" ON post_favorites;
CREATE POLICY "Users can favorite posts" ON post_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unfavorite posts" ON post_favorites;
CREATE POLICY "Users can unfavorite posts" ON post_favorites FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own registrations" ON event_registrations;
CREATE POLICY "Users can view own registrations" ON event_registrations FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can register for events" ON event_registrations;
CREATE POLICY "Users can register for events" ON event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========== 第八步：索引优化 ==========

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_likes_count ON posts(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_favorites_count ON posts(favorites_count DESC);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_profiles_member_code ON profiles(member_code);
CREATE INDEX IF NOT EXISTS idx_profiles_total_points ON profiles(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_point_records_user_id ON point_records(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_favorites_user_id ON post_favorites(user_id);

-- ========== 完成！ ==========

SELECT '✅ 数据库设置完成！所有功能已就绪。' AS status;