// 阿里云函数计算 - 联系表单处理器
// 部署到阿里云函数计算FC

const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
    // 设置CORS头
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // 处理预检请求
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: headers,
            body: ''
        };
    }

    try {
        // 解析请求体
        const requestBody = JSON.parse(event.body);
        const { action, data } = requestBody;

        if (action === 'sendContactMessage') {
            const { name, email, message } = data;

            // 验证输入
            if (!name || !email || !message) {
                return {
                    statusCode: 400,
                    headers: headers,
                    body: JSON.stringify({
                        success: false,
                        error: '缺少必要字段'
                    })
                };
            }

            // 验证邮箱格式
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return {
                    statusCode: 400,
                    headers: headers,
                    body: JSON.stringify({
                        success: false,
                        error: '邮箱格式无效'
                    })
                };
            }

            // 记录消息到日志
            console.log('收到联系消息:', {
                name,
                email,
                message,
                timestamp: new Date().toISOString(),
                ip: event.requestContext.identity.sourceIp
            });

            // 发送邮件通知（可选）
            await sendEmailNotification({
                name,
                email,
                message
            });

            // 存储到数据库（可选）
            await saveToDatabase({
                name,
                email,
                message,
                timestamp: new Date().toISOString()
            });

            return {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify({
                    success: true,
                    message: '消息已成功接收，我们会尽快回复您！'
                })
            };
        }

        return {
            statusCode: 400,
            headers: headers,
            body: JSON.stringify({
                success: false,
                error: '无效的操作'
            })
        };

    } catch (error) {
        console.error('处理请求时出错:', error);
        
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({
                success: false,
                error: '服务器内部错误'
            })
        };
    }
};

// 发送邮件通知
async function sendEmailNotification(data) {
    try {
        // 配置邮件发送器
        const transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // 邮件内容
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: process.env.ADMIN_EMAIL,
            subject: '新的网站联系消息',
            html: `
                <h2>新的联系消息</h2>
                <p><strong>姓名:</strong> ${data.name}</p>
                <p><strong>邮箱:</strong> ${data.email}</p>
                <p><strong>消息:</strong></p>
                <p>${data.message}</p>
                <p><strong>时间:</strong> ${new Date().toLocaleString('zh-CN')}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('邮件通知已发送');
    } catch (error) {
        console.error('发送邮件失败:', error);
        // 不抛出错误，避免影响主要功能
    }
}

// 保存到数据库
async function saveToDatabase(data) {
    try {
        // 这里可以集成阿里云RDS、MongoDB等数据库
        // 示例：使用阿里云表格存储
        const TableStore = require('tablestore');
        
        const client = new TableStore.Client({
            accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
            secretAccessKey: process.env.ALIYUN_ACCESS_KEY_SECRET,
            endpoint: process.env.TABLESTORE_ENDPOINT,
            instancename: process.env.TABLESTORE_INSTANCE
        });

        const params = {
            tableName: 'contact_messages',
            condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
            primaryKey: [
                { 'id': data.timestamp },
                { 'name': data.name }
            ],
            attributeColumns: [
                { 'email': data.email },
                { 'message': data.message },
                { 'timestamp': data.timestamp }
            ]
        };

        await client.putRow(params);
        console.log('消息已保存到数据库');
    } catch (error) {
        console.error('保存到数据库失败:', error);
        // 不抛出错误，避免影响主要功能
    }
}

// 环境变量配置示例
/*
需要在阿里云函数计算控制台配置以下环境变量：

SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=your-email@qq.com
SMTP_PASS=your-smtp-password
ADMIN_EMAIL=admin@yourdomain.com

ALIYUN_ACCESS_KEY_ID=your-access-key-id
ALIYUN_ACCESS_KEY_SECRET=your-access-key-secret
TABLESTORE_ENDPOINT=https://your-instance.cn-hangzhou.ots.aliyuncs.com
TABLESTORE_INSTANCE=your-instance-name
*/ 