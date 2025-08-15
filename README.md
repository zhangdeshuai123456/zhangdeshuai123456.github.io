# 旅行助手 - 专业旅行计划管理应用

一个功能完整的渐进式Web应用(PWA)，帮助您规划完美的旅行计划、管理预算和整理行李清单。

## ✨ 主要功能

### 🗺️ 旅行计划管理
- 创建和管理旅行计划
- 设置目的地、日期和预算
- 旅行状态跟踪（计划中/进行中/已完成）
- 旅行详情查看和编辑

### 💰 支出管理
- 记录旅行支出
- 按类别分类（交通、住宿、餐饮、购物、娱乐等）
- 支出统计和分析
- 预算超支提醒

### 🧳 行李清单
- 创建行李打包清单
- 按类别组织物品（衣物、电子设备、洗漱用品等）
- 打包进度跟踪
- 物品状态管理（已打包/未打包）

### 📱 PWA特性
- 离线使用支持
- 可安装到手机桌面
- 推送通知
- 后台同步
- 响应式设计

## 🚀 快速开始

### 环境要求
- Node.js 14.0 或更高版本
- 现代浏览器（支持PWA）

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd travel_pro
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动应用**

   **Windows用户：**
   ```bash
   start.bat
   ```

   **Linux/Mac用户：**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

   **手动启动：**
   ```bash
   npm start
   ```

4. **访问应用**
   - 本地访问：http://localhost:3000
   - 手机访问：确保手机和电脑在同一网络，访问电脑IP地址:3000

## 📱 安装到手机

### Android用户
1. 使用Chrome浏览器访问应用
2. 点击地址栏右侧的"安装"按钮
3. 或点击菜单中的"添加到主屏幕"

### iOS用户
1. 使用Safari浏览器访问应用
2. 点击分享按钮
3. 选择"添加到主屏幕"

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **数据库**: IndexedDB (浏览器本地存储)
- **PWA**: Service Worker, Web App Manifest
- **服务器**: Node.js, Express
- **样式**: 现代CSS变量和Flexbox/Grid布局

## 📁 项目结构

```
travel_pro/
├── index.html          # 主页面
├── script.js           # 主要JavaScript逻辑
├── styles.css          # 样式文件
├── manifest.json       # PWA配置文件
├── sw.js              # Service Worker
├── server.js          # 服务器文件
├── package.json       # 项目配置
├── start.bat          # Windows启动脚本
├── start.sh           # Linux/Mac启动脚本
└── README.md          # 项目说明
```

## 🎯 核心功能详解

### 数据库管理
- 使用IndexedDB进行本地数据存储
- 支持旅行计划、支出记录、行李物品的CRUD操作
- 数据持久化，刷新页面不丢失

### 用户界面
- 现代化移动端优先设计
- 流畅的页面切换动画
- 直观的卡片式布局
- 深色模式支持

### 离线功能
- Service Worker缓存策略
- 静态资源缓存优先
- API请求网络优先
- 离线数据同步

## 🔧 自定义配置

### 修改主题色
在`styles.css`中修改CSS变量：
```css
:root {
  --primary-500: #3b82f6; /* 主色调 */
  --primary-600: #2563eb; /* 深色调 */
}
```

### 添加新的支出类别
在`script.js`中的`getAddExpenseForm()`方法中添加：
```javascript
<option value="新类别">新类别</option>
```

### 修改缓存策略
在`sw.js`中调整缓存配置：
```javascript
const STATIC_ASSETS = [
  // 添加需要缓存的资源
];
```

## 📊 数据导出/导入

### 导出数据
1. 点击浮动操作按钮
2. 选择"导出数据"
3. 自动下载JSON格式的数据文件

### 导入数据
1. 点击浮动操作按钮
2. 选择"导入数据"
3. 选择之前导出的JSON文件

## 🔔 推送通知

应用支持以下类型的推送通知：
- 旅行开始提醒
- 预算超支警告
- 打包进度提醒
- 应用更新通知

## 🌐 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11.1+
- Edge 79+

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 常见问题

### Q: 为什么无法安装到手机？
A: 确保：
- 使用HTTPS或localhost访问
- 浏览器支持PWA
- manifest.json配置正确

### Q: 数据会丢失吗？
A: 不会，数据存储在浏览器的IndexedDB中，除非清除浏览器数据

### Q: 支持多设备同步吗？
A: 目前是本地存储，可以通过导出/导入功能手动同步

### Q: 如何备份数据？
A: 使用应用内的导出功能，定期导出数据文件

## 📞 联系支持

如有问题或建议，请通过以下方式联系：
- 提交Issue
- 发送邮件
- 项目讨论区

---

**享受您的旅行！** ✈️🌍
