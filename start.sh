#!/bin/bash

echo "启动旅行助手应用..."
echo

echo "正在检查Node.js..."
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js，请先安装Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

echo "Node.js已安装"
echo

echo "正在安装依赖..."
npm install

echo
echo "启动服务器..."
echo "应用将在 http://localhost:3000 运行"
echo "按 Ctrl+C 停止服务器"
echo
npm start
