-- ========================================
-- 为 posts 表添加图片字段
-- ========================================

-- 添加图片字段
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url VARCHAR;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- 创建评论计数触发器
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_comments_count ON comments;
CREATE TRIGGER trigger_update_comments_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_count();

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_posts_image_url ON posts(image_url);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);

SELECT '✅ posts 表图片字段添加完成' AS status;