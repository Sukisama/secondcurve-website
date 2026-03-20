-- ========================================
-- 成员编号系统数据库扩展脚本
-- ========================================

-- 1. 为 profiles 表添加成员编号字段
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS member_code VARCHAR(20) UNIQUE;

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_profiles_member_code ON profiles(member_code);

-- 3. 创建生成成员编号的函数
CREATE OR REPLACE FUNCTION generate_member_code()
RETURNS VARCHAR AS $$
DECLARE
  new_code VARCHAR(20);
  max_num INTEGER;
BEGIN
  -- 获取当前最大编号数字
  SELECT COALESCE(MAX(CAST(SUBSTRING(member_code FROM 5) AS INTEGER)), 10000)
  INTO max_num
  FROM profiles
  WHERE member_code ~ '^DEQX[0-9]+$';

  -- 生成新编号（最大编号 + 1）
  new_code := 'DEQX' || (max_num + 1)::TEXT;

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 4. 创建触发器：新用户注册时自动生成成员编号
CREATE OR REPLACE FUNCTION auto_generate_member_code()
RETURNS TRIGGER AS $$
BEGIN
  -- 如果新用户没有成员编号，则自动生成
  IF NEW.member_code IS NULL THEN
    NEW.member_code := generate_member_code();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 删除已存在的触发器（如果有）
DROP TRIGGER IF EXISTS auto_member_code_on_insert ON profiles;

-- 6. 创建触发器
CREATE TRIGGER auto_member_code_on_insert
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_member_code();

-- 7. 为现有用户生成成员编号
UPDATE profiles
SET member_code = generate_member_code()
WHERE member_code IS NULL;

-- ========================================
-- 完成！
-- ========================================