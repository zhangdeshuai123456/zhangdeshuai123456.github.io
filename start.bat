@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    IndexedDB 演示服务器启动脚本
echo ========================================
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未检测到Node.js
    echo.
    echo 请先安装Node.js：
    echo 1. 访问 https://nodejs.org/
    echo 2. 下载并安装Node.js
    echo 3. 重新运行此脚本
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js 已安装
echo.

REM 启动服务器
echo 🚀 正在启动服务器...
echo.
node server.js

pause
