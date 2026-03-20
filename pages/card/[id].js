import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase/client'

export default function PublicCardPage() {
  const router = useRouter()
  const { id } = router.query
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchProfile()
    }
  }, [id])

  const fetchProfile = async () => {
    try {
      setLoading(true)

      // 获取名片信息
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      if (data) {
        setProfile(data)

        // 记录浏览（如果用户已登录）
        const { data: { user } } = await supabase.auth.getUser()
        if (user && user.id !== id) {
          await supabase
            .from('card_views')
            .insert({
              card_user_id: id,
              viewer_id: user.id
            })
        } else if (!user) {
          // 匿名浏览也记录（viewer_id 为 null）
          await supabase
            .from('card_views')
            .insert({
              card_user_id: id,
              viewer_id: null
            })
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem-8rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <>
        <Head>
          <title>名片未找到 - 第二曲线</title>
        </Head>
        <div className="min-h-[calc(100vh-3.5rem-8rem)] flex items-center justify-center">
          <div className="text-center">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">名片未找到</h1>
            <p className="text-gray-600 mb-6">该名片可能已被删除或不存在</p>
            <a
              href="/"
              className="inline-block px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition"
            >
              返回首页
            </a>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{profile.name}的名片 - 第二曲线</title>
        <meta name="description" content={profile.bio || `${profile.name}的第二曲线名片`} />
        <meta property="og:title" content={`${profile.name}的名片`} />
        <meta property="og:description" content={profile.bio || `查看${profile.name}的第二曲线名片`} />
        {profile.avatar_url && (
          <meta property="og:image" content={profile.avatar_url} />
        )}
      </Head>

      <div className="min-h-[calc(100vh-3.5rem-8rem)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl">
          {/* 名片卡片 */}
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-3xl p-1 shadow-2xl">
            <div className="bg-white rounded-3xl p-8">
              {/* 头部和基本信息 */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold overflow-hidden shadow-lg">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      profile.name?.charAt(0) || '?'
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h1>
                    {profile.bio && (
                      <p className="text-gray-600 text-lg max-w-md">{profile.bio}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 职业信息 */}
              {(profile.company || profile.position || profile.location) && (
                <div className="mb-8 space-y-3">
                  {profile.company && profile.position && (
                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="font-medium">{profile.position}</span>
                      <span className="mx-2 text-gray-300">·</span>
                      <span>{profile.company}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 技能标签 */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">技能</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 rounded-full text-sm font-medium border border-blue-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 兴趣爱好 */}
              {profile.interests && profile.interests.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">兴趣</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 社交链接 */}
              {(profile.wechat || profile.weibo || profile.twitter || profile.github || profile.linkedin || profile.website) && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">联系方式</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {profile.wechat && (
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.03-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                        </svg>
                        <span className="text-sm text-gray-700 truncate">{profile.wechat}</span>
                      </div>
                    )}
                    {profile.github && (
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <span className="text-sm text-gray-700 truncate">{profile.github}</span>
                      </div>
                    )}
                    {profile.twitter && (
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        <span className="text-sm text-gray-700 truncate">@{profile.twitter}</span>
                      </div>
                    )}
                    {profile.weibo && (
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.642 4.318-.341 5.132-2.145.8-1.752-.166-3.664-2.161-4.183zM17.14 14.49c-.235-.074-.393-.127-.271-.457.265-.72.292-1.338.006-1.779-.536-.826-2.006-.783-3.685-.022 0 0-.527.23-.393-.187.26-.82.222-1.507-.186-1.903-.92-.899-3.365.036-5.46 2.09C5.284 14.072 4 16.35 4 18.296c0 3.725 4.78 5.99 9.46 5.99 6.127 0 10.205-3.557 10.205-6.383 0-1.705-1.438-2.671-2.525-3.413zM21.88 9.202c-.906-1.001-2.244-1.389-3.463-1.129-.254.055-.414.305-.359.559.055.253.304.414.558.359.865-.183 1.818.091 2.455.795.636.703.826 1.669.541 2.511-.079.233.046.488.279.567.233.079.488-.047.567-.279.399-1.178.136-2.52-.578-3.383zM19.963 6.259c-1.486-1.539-3.624-2.112-5.589-1.6-.25.066-.4.321-.335.57.066.25.32.4.57.335 1.651-.43 3.442.052 4.69 1.323 1.25 1.273 1.701 3.07 1.241 4.712-.073.26.079.53.339.603.26.073.531-.079.604-.339.564-2.022.01-4.206-1.52-5.604z"/>
                        </svg>
                        <span className="text-sm text-gray-700 truncate">{profile.weibo}</span>
                      </div>
                    )}
                    {profile.linkedin && (
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        <span className="text-sm text-gray-700 truncate">LinkedIn</span>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-700 hover:text-blue-600 truncate"
                        >
                          网站
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 底部品牌 */}
              <div className="pt-6 border-t border-gray-100">
                <div className="text-center text-sm text-gray-500">
                  <a href="/" className="hover:text-gray-700">第二曲线AI社区</a>
                  <span className="mx-2">·</span>
                  <span>连接创造价值</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}