-- ========================================
-- 诊断脚本：检查所有表的实际字段
-- ========================================

-- 检查 posts 表字段
SELECT 'posts' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'posts'
ORDER BY ordinal_position;

-- 检查 cases 表字段
SELECT 'cases' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cases'
ORDER BY ordinal_position;

-- 检查 events 表字段
SELECT 'events' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'events'
ORDER BY ordinal_position;

-- 检查 profiles 表字段
SELECT 'profiles' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;