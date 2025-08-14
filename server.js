const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // 解析URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // 默认页面
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // 获取文件路径
    const filePath = path.join(__dirname, pathname);
    
    // 获取文件扩展名
    const extname = path.extname(filePath).toLowerCase();
    
    // 设置MIME类型
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // 读取文件
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // 文件不存在
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <html>
                        <head>
                            <title>404 - 页面未找到</title>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                                body { 
                                    font-family: Arial, sans-serif; 
                                    text-align: center; 
                                    padding: 50px; 
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: white;
                                    min-height: 100vh;
                                    margin: 0;
                                }
                                .container { 
                                    background: rgba(255,255,255,0.1); 
                                    padding: 30px; 
                                    border-radius: 15px; 
                                    backdrop-filter: blur(10px);
                                }
                                h1 { margin-bottom: 20px; }
                                a { 
                                    color: #fff; 
                                    text-decoration: none; 
                                    background: rgba(255,255,255,0.2); 
                                    padding: 10px 20px; 
                                    border-radius: 5px; 
                                    display: inline-block; 
                                    margin-top: 20px;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1>🚫 404 - 页面未找到</h1>
                                <p>抱歉，您访问的页面不存在。</p>
                                <a href="/">返回首页</a>
                            </div>
                        </body>
                    </html>
                `);
            } else {
                // 服务器错误
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <html>
                        <head>
                            <title>500 - 服务器错误</title>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                                body { 
                                    font-family: Arial, sans-serif; 
                                    text-align: center; 
                                    padding: 50px; 
                                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
                                    color: white;
                                    min-height: 100vh;
                                    margin: 0;
                                }
                                .container { 
                                    background: rgba(255,255,255,0.1); 
                                    padding: 30px; 
                                    border-radius: 15px; 
                                    backdrop-filter: blur(10px);
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1>⚠️ 500 - 服务器错误</h1>
                                <p>服务器内部错误，请稍后重试。</p>
                            </div>
                        </body>
                    </html>
                `);
            }
            return;
        }
        
        // 设置响应头
        res.writeHead(200, { 
            'Content-Type': `${contentType}; charset=utf-8`,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        
        // 发送文件内容
        res.end(data);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 IndexedDB演示服务器已启动！`);
    console.log(`📱 本地访问: http://localhost:${PORT}`);
    console.log(`🌐 网络访问: http://[您的IP地址]:${PORT}`);
    console.log(`📋 请确保手机和电脑在同一WiFi网络下`);
    console.log(`⏹️  按 Ctrl+C 停止服务器`);
    
    // 获取本机IP地址
    const os = require('os');
    const interfaces = os.networkInterfaces();
    let localIP = '';
    
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                localIP = interface.address;
                break;
            }
        }
        if (localIP) break;
    }
    
    if (localIP) {
        console.log(`📱 手机访问地址: http://${localIP}:${PORT}`);
    }
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n👋 服务器正在关闭...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});
