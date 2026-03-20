@echo off
REM 第二曲线网站 - Vercel自动部署配置脚本 (Windows版本)
REM 此脚本将帮助你快速配置Vercel自动部署

echo 🚀 第二曲线网站 - Vercel配置向导
echo ==================================
echo.

REM 检查Vercel CLI
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo 📦 正在安装 Vercel CLI...
    npm i -g vercel
)

echo ✅ Vercel CLI 已安装
echo.

REM 登录Vercel
echo 🔐 步骤 1/4: 登录Vercel
echo 即将打开浏览器进行登录...
echo 请在浏览器中完成GitHub授权
echo.
pause
vercel login

REM 链接项目
echo.
echo 🔗 步骤 2/4: 链接项目到Vercel
echo.
vercel link

REM 设置环境变量
echo.
echo ⚙️ 步骤 3/4: 配置环境变量
echo.
echo 正在添加环境变量...
echo 请按照提示输入以下值：
echo.

set /p add_env="是否添加环境变量？(y/n): "
if /i "%add_env%"=="y" (
    echo.
    echo 添加 NEXT_PUBLIC_SUPABASE_URL...
    vercel env add NEXT_PUBLIC_SUPABASE_URL production

    echo.
    echo 添加 NEXT_PUBLIC_SUPABASE_ANON_KEY...
    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

    echo.
    echo 添加 SUPABASE_SERVICE_ROLE_KEY...
    vercel env add SUPABASE_SERVICE_ROLE_KEY production

    echo ✅ 环境变量配置完成
)

REM 部署到生产环境
echo.
echo 🚀 步骤 4/4: 部署到生产环境
echo.
set /p deploy="是否立即部署到生产环境？(y/n): "
if /i "%deploy%"=="y" (
    vercel --prod
    echo.
    echo 🎉 部署完成！
    echo.
    echo 📱 访问你的网站：
    echo 1. 打开 https://vercel.com
    echo 2. 进入 secondcurve-website 项目
    echo 3. 点击域名链接访问网站
    echo.
    echo ✅ 自动部署已启用！
    echo 以后只需 git push，Vercel会自动部署
)

echo.
echo ✨ 配置完成！
echo.
echo 📚 下一步：
echo 1. 访问 https://vercel.com 查看部署状态
echo 2. 在 Settings → Domains 绑定自定义域名
echo 3. 开始开发，git push 即可自动部署
echo.
pause