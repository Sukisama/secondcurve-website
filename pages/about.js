import Head from 'next/head'

const team = [
  {
    name: '林子',
    role: '创始人',
    bio: '连续创业者，前AI公司产品负责人，热爱连接有趣的人',
    avatar: '👨‍💼'
  },
  {
    name: '栗子',
    role: '技术负责人',
    bio: '前大厂算法工程师，专注于大模型应用和RAG系统',
    avatar: '👩‍💻'
  },
  {
    name: '阿药',
    role: '运营负责人',
    bio: '社区运营专家，擅长组织线下活动和社群增长',
    avatar: '👨‍🎤'
  },
]

export default function About() {
  return (
    <>
      <Head>
        <title>关于我们 | 第二曲线 · 成都AI创客社区</title>
        <meta name="description" content="了解第二曲线的故事、价值观和核心团队。我们是成都AI创客的聚集地，致力于帮助每一位成员在AI时代找到属于自己的第二增长曲线。" />
      </Head>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-12 sm:mb-16 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">关于第二曲线</h1>
          <p className="text-base sm:text-lg text-gray-500">成都AI创客的聚集地</p>
        </div>

        {/* Story */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">我们的故事</h2>
          <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-600">
            <p>
              2026年初，AI一人公司的浪潮席卷全球。我们几个在成都的AI爱好者，
              每周聚在一起讨论技术、分享想法。
            </p>
            <p>
              渐渐地，参与的人越来越多。我们意识到，成都需要一个真正属于AI创客的社区——
              一个不仅能学习技术，更能链接人脉、落地项目的地方。
            </p>
            <p>
              于是，「第二曲线」诞生了。我们希望帮助每一位成员，
              在AI时代找到属于自己的第二增长曲线。
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 sm:mb-8">我们的价值观</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-4 sm:p-6">
              <div className="text-3xl mb-3 sm:mb-4">🤝</div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">开放共享</h3>
              <p className="text-gray-500 text-xs sm:text-sm">知识和资源应该被分享</p>
            </div>
            <div className="text-center p-4 sm:p-6">
              <div className="text-3xl mb-3 sm:mb-4">🛠️</div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">实践出真知</h3>
              <p className="text-gray-500 text-xs sm:text-sm">动手做项目比空谈更重要</p>
            </div>
            <div className="text-center p-4 sm:p-6 sm:col-span-2 md:col-span-1">
              <div className="text-3xl mb-3 sm:mb-4">💛</div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">真诚连接</h3>
              <p className="text-gray-500 text-xs sm:text-sm">人与人之间最珍贵的是真实</p>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 sm:mb-8">核心团队</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {team.map((member, index) => (
              <div key={index} className="text-center p-4 sm:p-6 border border-gray-200 rounded-2xl">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{member.avatar}</div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">{member.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">{member.role}</p>
                <p className="text-xs sm:text-sm text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <div className="bg-gray-50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">联系我们</h2>
            <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">有任何问题或合作意向，欢迎联系我们</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              <div>
                <div className="text-2xl mb-2">💬</div>
                <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">微信公众号</h3>
                <p className="text-gray-500 text-xs sm:text-sm">第二曲线AI社区</p>
              </div>
              <div>
                <div className="text-2xl mb-2">📧</div>
                <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">邮箱</h3>
                <p className="text-gray-500 text-xs sm:text-sm">hello@secondcurve.ai</p>
              </div>
              <div>
                <div className="text-2xl mb-2">📍</div>
                <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">地址</h3>
                <p className="text-gray-500 text-xs sm:text-sm">成都·天府三街</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
