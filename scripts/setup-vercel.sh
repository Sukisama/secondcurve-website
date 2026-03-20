#!/bin/bash

# 第二曲线网站 - Vercel自动部署配置脚本
# 此脚本将帮助你快速配置Vercel自动部署

echo "🚀 第二曲线网站 - Vercel配置向导"
echo "=================================="
echo ""

# 检查Vercel CLI
if ! command -v vercel &> /dev/null
then
    echo "📦 正在安装 Vercel CLI..."
    npm i -g vercel
fi

echo "✅ Vercel CLI 已安装"
echo ""

# 登录Vercel
echo "🔐 步骤 1/4: 登录Vercel"
echo "即将打开浏览器进行登录..."
echo "请在浏览器中完成GitHub授权"
echo ""
read -p "按Enter键继续..."
vercel login

# 链接项目
echo ""
echo "🔗 步骤 2/4: 链接项目到Vercel"
echo ""
vercel link

# 设置环境变量
echo ""
echo "⚙️  步骤 3/4: 配置环境变量"
echo ""
echo "正在添加环境变量..."

# 添加环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<EOF
https://kzaelebbujxhsonsrtzu.supabase.co
EOF

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YWVsZWJidWp4aHNvbnNydHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzIyNzksImV4cCI6MjA4OTUwODI3OX0.Mrahkk9mEqdl1GWAcuFrwirKfvj43K8m94KXbjvW-9Q
EOF

vercel env add SUPABASE_SERVICE_ROLE_KEY production <<EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YWVsZWJidWp4aHNvbnNydHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMjI3OSwiZXhwIjoyMDg5NTA4Mjc5fQ.4uS8Rqos2pb2xsCMo2n-U_oewanMvW_izSbjI__MVhw
EOF

echo "✅ 环境变量配置完成"
echo ""

# 部署到生产环境
echo "🚀 步骤 4/4: 部署到生产环境"
echo ""
read -p "是否立即部署到生产环境？(y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    vercel --prod
    echo ""
    echo "🎉 部署完成！"
    echo ""
    echo "📱 访问你的网站："
    echo "1. 打开 https://vercel.com"
    echo "2. 进入 secondcurve-website 项目"
    echo "3. 点击域名链接访问网站"
    echo ""
    echo "✅ 自动部署已启用！"
    echo "以后只需 git push，Vercel会自动部署"
fi

echo ""
echo "✨ 配置完成！"
echo ""
echo "📚 下一步："
echo "1. 访问 https://vercel.com 查看部署状态"
echo "2. 在 Settings → Domains 绑定自定义域名"
echo "3. 开始开发，git push 即可自动部署"
echo ""