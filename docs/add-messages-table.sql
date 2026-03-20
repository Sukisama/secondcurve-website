-- ========================================
-- 站内信功能数据库迁移脚本
-- 请在 Supabase SQL Editor 中执行此脚本
-- ========================================

-- 1. 创建 messages 表
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_system BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 添加更新时间戳触发器
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3. 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_is_read_idx ON messages(is_read);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at DESC);

-- 4. 启用 Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 5. messages 表 RLS 策略
-- 用户可以查看发给自己的消息
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (receiver_id = auth.uid());

-- 登录用户可以发送消息
DROP POLICY IF EXISTS "Authenticated users can create messages" ON messages;
CREATE POLICY "Authenticated users can create messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 接收者可以更新自己的消息（标记已读）
DROP POLICY IF EXISTS "Receivers can update own messages" ON messages;
CREATE POLICY "Receivers can update own messages"
  ON messages FOR UPDATE
  USING (receiver_id = auth.uid());

-- 接收者可以删除自己的消息
DROP POLICY IF EXISTS "Receivers can delete own messages" ON messages;
CREATE POLICY "Receivers can delete own messages"
  ON messages FOR DELETE
  USING (receiver_id = auth.uid());

-- 6. 添加外键约束说明
COMMENT ON TABLE messages IS '站内信表';
COMMENT ON COLUMN messages.sender_id IS '发送者ID，系统消息为NULL';
COMMENT ON COLUMN messages.receiver_id IS '接收者ID';
COMMENT ON COLUMN messages.is_read IS '是否已读';
COMMENT ON COLUMN messages.is_system IS '是否为系统消息';
COMMENT ON COLUMN messages.read_at IS '阅读时间';

-- ========================================
-- 迁移完成！
-- ========================================