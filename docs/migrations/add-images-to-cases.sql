-- ========================================
-- 为 cases 表添加图片字段
-- 请在 Supabase SQL Editor 中执行此脚本
-- ========================================

-- 添加 images 字段（存储多张图片URL）
ALTER TABLE cases ADD COLUMN IF NOT EXISTS images TEXT[];

-- 添加 thumbnail 字段（存储缩略图URL）
ALTER TABLE cases ADD COLUMN IF NOT EXISTS thumbnail TEXT;

-- 将 author_name 重命名为 author（如果需要）
-- 注意：如果字段已存在，此语句可能会报错，可以忽略
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cases' AND column_name = 'author_name'
  ) THEN
    ALTER TABLE cases RENAME COLUMN author_name TO author;
  END IF;
END $$;

-- 添加注释
COMMENT ON COLUMN cases.images IS '案例图片URL数组';
COMMENT ON COLUMN cases.thumbnail IS '案例缩略图URL（通常是第一张图片）';
COMMENT ON COLUMN cases.author IS '案例作者名称';

-- ========================================
-- 迁移完成！
-- ========================================