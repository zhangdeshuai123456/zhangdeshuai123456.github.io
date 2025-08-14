#!/bin/bash

echo ""
echo "========================================"
echo "   IndexedDB 演示服务器启动脚本"
echo "========================================"
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未检测到Node.js"
    echo ""
    echo "请先安装Node.js："
    echo "1. 访问 https://nodejs.org/"
    echo "2. 下载并安装Node.js"
    echo "3. 重新运行此脚本"
    echo ""
    read -p "按回车键退出..."
    exit 1
fi

echo "✅ Node.js 已安装"
echo ""

# 启动服务器
echo "🚀 正在启动服务器..."
echo ""
node server.js
