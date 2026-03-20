-- ========================================
-- 数据库性能优化脚本
-- ========================================

-- 添加更多索引加速查询
CREATE INDEX IF NOT EXISTS idx_cases_created_at_desc ON cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_date_asc ON events(event_date ASC);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_type ON knowledge_items(type);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 优化 RLS 策略（添加更高效的策略）
-- 对于公开内容的查询，使用更宽松的策略

-- 更新统计信息
ANALYZE profiles;
ANALYZE posts;
ANALYZE cases;
ANALYZE events;
ANALYZE knowledge_items;

SELECT '✅ 数据库性能优化完成！' AS status;