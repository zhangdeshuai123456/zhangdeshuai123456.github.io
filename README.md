# 个人网站静态页面 Demo

这是一个现代化的个人网站静态页面demo，设计用于部署到GitHub Pages，并与阿里云函数计算FC进行后端集成。

## 🚀 项目特点

- **响应式设计**: 完美适配桌面、平板和移动设备
- **现代化UI**: 使用渐变色彩、毛玻璃效果和流畅动画
- **交互体验**: 平滑滚动、技能条动画、表单验证
- **云服务集成**: 与阿里云函数计算FC的API调用示例
- **SEO友好**: 语义化HTML结构和meta标签

## 📁 项目结构

```
RAG-example/
├── index.html          # 主页面
├── css/
│   └── style.css      # 样式文件
├── js/
│   └── script.js      # JavaScript交互逻辑
└── README.md          # 项目说明
```

## 🎨 功能模块

### 1. 导航栏
- 固定顶部导航
- 响应式汉堡菜单
- 平滑滚动导航
- 滚动时动态样式变化

### 2. 首页展示
- 渐变背景英雄区域
- 个人介绍卡片
- 行动按钮

### 3. 关于我
- 个人介绍文字
- 统计数据展示
- 响应式布局

### 4. 技能展示
- 技能卡片网格布局
- 动态技能条动画
- 图标和描述

### 5. 项目展示
- 项目卡片设计
- 技术标签
- 链接到GitHub和演示

### 6. 联系表单
- 表单验证
- 与阿里云函数计算集成
- 实时通知反馈

## 🛠️ 部署步骤

### 1. 部署到GitHub Pages

1. 将代码推送到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择分支和目录（通常是根目录）
4. 访问生成的URL

### 2. 配置阿里云函数计算

1. **创建函数计算服务**:
   ```bash
   # 使用阿里云CLI创建服务
   aliyun fc create-service --service-name personal-website-api
   ```

2. **创建函数**:
   ```javascript
   // 示例函数代码 (contact-handler.js)
   exports.handler = async (event, context) => {
       const { action, data } = JSON.parse(event.body);
       
       if (action === 'sendContactMessage') {
           // 处理联系表单数据
           const { name, email, message } = data;
           
           // 这里可以添加邮件发送、数据库存储等逻辑
           console.log('收到联系消息:', { name, email, message });
           
           return {
               statusCode: 200,
               headers: {
                   'Content-Type': 'application/json',
                   'Access-Control-Allow-Origin': '*'
               },
               body: JSON.stringify({
                   success: true,
                   message: '消息已接收'
               })
           };
       }
       
       return {
           statusCode: 400,
           body: JSON.stringify({ error: '无效的请求' })
       };
   };
   ```

3. **部署函数**:
   ```bash
   aliyun fc create-function \
     --service-name personal-website-api \
     --function-name contact-handler \
     --runtime nodejs16 \
     --handler index.handler \
     --code contact-handler.js
   ```

4. **配置触发器**:
   ```bash
   aliyun fc create-trigger \
     --service-name personal-website-api \
     --function-name contact-handler \
     --trigger-name http-trigger \
     --trigger-type http
   ```

### 3. 更新前端配置

在 `js/script.js` 中更新阿里云函数计算的端点URL：

```javascript
const FC_ENDPOINT = 'https://your-service.your-region.fc.aliyuncs.com/2016-08-15/proxy/personal-website-api/contact-handler';
```

## 🔧 自定义配置

### 修改个人信息

1. **更新HTML内容**:
   - 修改 `index.html` 中的个人信息
   - 更新项目描述和链接
   - 调整联系信息

2. **自定义样式**:
   - 修改 `css/style.css` 中的颜色变量
   - 调整字体和间距
   - 添加自定义动画

3. **调整功能**:
   - 在 `js/script.js` 中添加新的交互功能
   - 修改表单验证逻辑
   - 扩展API调用

### 颜色主题

主要颜色变量：
```css
--primary-color: #2563eb;
--secondary-color: #1d4ed8;
--gradient-primary: linear-gradient(135deg, #2563eb, #1d4ed8);
--gradient-hero: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## 📱 响应式断点

- **桌面**: > 768px
- **平板**: 768px - 480px
- **移动**: < 480px

## 🔒 安全考虑

1. **CORS配置**: 确保阿里云函数计算正确配置CORS
2. **API密钥**: 在生产环境中使用适当的认证机制
3. **输入验证**: 前后端都要进行数据验证
4. **HTTPS**: 确保所有通信都通过HTTPS进行

## 🚀 性能优化

1. **图片优化**: 使用WebP格式和适当的尺寸
2. **代码分割**: 考虑将CSS和JS文件拆分
3. **缓存策略**: 设置适当的缓存头
4. **CDN**: 使用CDN加速静态资源

## 📊 分析工具

可以集成以下分析工具：
- Google Analytics
- 百度统计
- 阿里云日志服务

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License

## 📞 支持

如果您在使用过程中遇到问题，请：
1. 查看GitHub Issues
2. 提交新的Issue
3. 联系开发者

---

**注意**: 这是一个演示项目，在实际部署时请确保：
- 更新所有示例URL和邮箱地址
- 配置正确的阿里云函数计算端点
- 添加适当的安全措施
- 测试所有功能在不同设备上的表现 