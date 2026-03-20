// ========================================
// 测试用户创建脚本
// 在浏览器控制台运行，或者作为API端点调用
// 密码统一为：test1234
// ========================================

const testUsers = [
  {
    email: 'liming@test.com',
    password: 'test1234',
    name: '李明',
    role: 'member',
    bio: '热爱AI技术，专注于大模型应用开发',
    company: '字节跳动',
    position: 'AI工程师',
    location: '成都',
    skills: ['Python', 'PyTorch', 'LLM', 'RAG'],
    points: 350
  },
  {
    email: 'wangfang@test.com',
    password: 'test1234',
    name: '王芳',
    role: 'vip',
    bio: '产品经理，擅长AI产品设计和用户增长',
    company: '腾讯',
    position: '高级产品经理',
    location: '成都',
    skills: ['产品设计', '用户研究', '数据分析'],
    points: 520
  },
  {
    email: 'zhangwei@test.com',
    password: 'test1234',
    name: '张伟',
    role: 'member',
    bio: '连续创业者，正在探索AI在教育领域的应用',
    company: '智学科技',
    position: '创始人&CEO',
    location: '成都',
    skills: ['创业', '教育AI', '团队管理'],
    points: 280
  },
  {
    email: 'liuyang@test.com',
    password: 'test1234',
    name: '刘洋',
    role: 'vip',
    bio: '全栈工程师，热爱开源和技术分享',
    company: '美团',
    position: '高级开发工程师',
    location: '成都',
    skills: ['React', 'Node.js', 'Python', 'Go'],
    points: 410
  },
  {
    email: 'chenjing@test.com',
    password: 'test1234',
    name: '陈静',
    role: 'member',
    bio: 'UI/UX设计师，专注AI产品的交互设计',
    company: '阿里巴巴',
    position: '高级UI设计师',
    location: '成都',
    skills: ['UI设计', 'UX设计', 'Figma', 'AI产品'],
    points: 320
  },
  {
    email: 'zhaolei@test.com',
    password: 'test1234',
    name: '赵磊',
    role: 'member',
    bio: '数据科学家，擅长机器学习和数据挖掘',
    company: '华为',
    position: '数据科学家',
    location: '成都',
    skills: ['机器学习', '数据分析', 'Python', 'TensorFlow'],
    points: 390
  }
];

// 创建用户的函数
async function createTestUsers() {
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@secondcurve.ai',
    password: 'admin123456',
    options: {
      data: {
        name: '管理员',
        role: 'super_admin'
      }
    }
  });

  for (const user of testUsers) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            name: user.name,
            role: user.role
          }
        }
      });

      if (error) {
        console.error(`创建用户 ${user.name} 失败:`, error);
        continue;
      }

      // 更新profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          bio: user.bio,
          company: user.company,
          position: user.position,
          location: user.location,
          skills: user.skills,
          points: user.points,
          show_on_member_wall: true
        })
        .eq('id', data.user.id);

      if (updateError) {
        console.error(`更新用户 ${user.name} profile失败:`, updateError);
      } else {
        console.log(`✅ 成功创建用户: ${user.name} (${user.email})`);
      }
    } catch (err) {
      console.error(`创建用户 ${user.name} 异常:`, err);
    }
  }
}

// 运行脚本
console.log('开始创建测试用户...');
console.log('请在浏览器控制台中运行此脚本，确保已登录管理员账号');
console.log('或者直接在注册页面手动创建这些用户');

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testUsers, createTestUsers };
}