// IndexedDB 数据库管理类
class IndexedDBManager {
    constructor() {
        this.dbName = 'UserDatabase';
        this.dbVersion = 1;
        this.storeName = 'users';
        this.db = null;
    }

    // 初始化数据库
    async init() {
        return new Promise((resolve, reject) => {
            // 检查浏览器是否支持 IndexedDB
            if (!window.indexedDB) {
                const error = new Error('浏览器不支持 IndexedDB');
                this.log('浏览器不支持 IndexedDB', 'error');
                reject(error);
                return;
            }

            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                this.log('数据库打开失败', 'error');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.log('数据库连接成功', 'success');
                
                // 监听数据库连接关闭
                this.db.onclose = () => {
                    this.log('数据库连接已关闭', 'info');
                    this.db = null;
                };
                
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 创建对象存储
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    
                    // 创建索引
                    store.createIndex('name', 'name', { unique: false });
                    store.createIndex('email', 'email', { unique: false });
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                    
                    this.log('数据库结构创建成功', 'success');
                }
            };
        });
    }

    // 添加用户
    async addUser(userData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            const user = {
                ...userData,
                createdAt: new Date().toISOString()
            };

            const request = store.add(user);

            request.onsuccess = () => {
                this.log(`用户 "${userData.name}" 添加成功`, 'success');
                resolve(request.result);
            };

            request.onerror = () => {
                this.log('添加用户失败', 'error');
                reject(request.error);
            };
        });
    }

    // 获取所有用户
    async getAllUsers() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                this.log('获取用户列表失败', 'error');
                reject(request.error);
            };
        });
    }

    // 搜索用户
    async searchUsers(query) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                const users = request.result;
                const filtered = users.filter(user => 
                    user.name.toLowerCase().includes(query.toLowerCase()) ||
                    user.email.toLowerCase().includes(query.toLowerCase()) ||
                    (user.notes && user.notes.toLowerCase().includes(query.toLowerCase()))
                );
                resolve(filtered);
            };

            request.onerror = () => {
                this.log('搜索用户失败', 'error');
                reject(request.error);
            };
        });
    }

    // 删除用户
    async deleteUser(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => {
                this.log(`用户 ID: ${id} 删除成功`, 'success');
                resolve();
            };

            request.onerror = () => {
                this.log('删除用户失败', 'error');
                reject(request.error);
            };
        });
    }

    // 更新用户
    async updateUser(id, userData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const user = getRequest.result;
                if (user) {
                    const updatedUser = {
                        ...user,
                        ...userData,
                        updatedAt: new Date().toISOString()
                    };

                    const putRequest = store.put(updatedUser);
                    putRequest.onsuccess = () => {
                        this.log(`用户 "${userData.name}" 更新成功`, 'success');
                        resolve(putRequest.result);
                    };
                    putRequest.onerror = () => {
                        this.log('更新用户失败', 'error');
                        reject(putRequest.error);
                    };
                } else {
                    reject(new Error('用户不存在'));
                }
            };

            getRequest.onerror = () => {
                this.log('获取用户失败', 'error');
                reject(getRequest.error);
            };
        });
    }

    // 清空所有数据
    async clearAll() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => {
                this.log('所有数据已清空', 'success');
                resolve();
            };

            request.onerror = () => {
                this.log('清空数据失败', 'error');
                reject(request.error);
            };
        });
    }

    // 获取数据库大小
    async getDatabaseSize() {
        return new Promise((resolve) => {
            if (!this.db) {
                resolve(0);
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                const users = request.result;
                const size = JSON.stringify(users).length;
                resolve(size);
            };

            request.onerror = () => {
                resolve(0);
            };
        });
    }

    // 导出数据
    async exportData() {
        try {
            const users = await this.getAllUsers();
            const dataStr = JSON.stringify(users, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `indexeddb_export_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.log('数据导出成功', 'success');
        } catch (error) {
            this.log('数据导出失败', 'error');
        }
    }

    // 导入数据
    async importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const users = JSON.parse(e.target.result);
                    
                    if (!Array.isArray(users)) {
                        throw new Error('无效的数据格式');
                    }

                    // 清空现有数据
                    await this.clearAll();

                    // 导入新数据
                    for (const user of users) {
                        const { id, ...userData } = user;
                        await this.addUser(userData);
                    }

                    this.log(`成功导入 ${users.length} 条记录`, 'success');
                    resolve(users.length);
                } catch (error) {
                    this.log('数据导入失败: ' + error.message, 'error');
                    reject(error);
                }
            };

            reader.onerror = () => {
                this.log('文件读取失败', 'error');
                reject(new Error('文件读取失败'));
            };

            reader.readAsText(file);
        });
    }

    // 记录日志
    log(message, type = 'info') {
        const logContainer = document.getElementById('logContainer');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        
        const time = new Date().toLocaleTimeString();
        logEntry.innerHTML = `<span class="log-time">[${time}]</span>${message}`;
        
        logContainer.insertBefore(logEntry, logContainer.firstChild);
        
        // 限制日志数量
        if (logContainer.children.length > 50) {
            logContainer.removeChild(logContainer.lastChild);
        }
    }
}

// 应用主类
class IndexedDBDemo {
    constructor() {
        this.dbManager = new IndexedDBManager();
        this.currentUsers = [];
        this.init();
    }

    async init() {
        try {
            await this.dbManager.init();
            this.bindEvents();
            await this.loadUsers();
            this.updateStats();
        } catch (error) {
            console.error('初始化失败:', error);
            this.dbManager.log('应用初始化失败', 'error');
        }
    }

    bindEvents() {
        // 添加用户 - 保存引用以便后续移除
        this.addUserHandler = () => this.addUser();
        document.getElementById('addBtn').addEventListener('click', this.addUserHandler);

        // 清空数据
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearAll();
        });

        // 导出数据
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.dbManager.exportData();
        });

        // 导入数据
        document.getElementById('importBtn').addEventListener('click', () => {
            this.triggerFileImport();
        });

        // 搜索功能
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchUsers(e.target.value);
        });

        // 表单回车提交
        document.getElementById('name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addUser();
        });
    }

    async addUser() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const age = document.getElementById('age').value.trim();
        const notes = document.getElementById('notes').value.trim();

        // 输入验证
        if (!name) {
            this.dbManager.log('请填写姓名', 'error');
            document.getElementById('name').focus();
            return;
        }

        if (!email) {
            this.dbManager.log('请填写邮箱', 'error');
            document.getElementById('email').focus();
            return;
        }

        // 简单的邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.dbManager.log('邮箱格式不正确', 'error');
            document.getElementById('email').focus();
            return;
        }

        // 年龄验证
        if (age && (isNaN(age) || parseInt(age) < 0 || parseInt(age) > 150)) {
            this.dbManager.log('年龄必须是0-150之间的数字', 'error');
            document.getElementById('age').focus();
            return;
        }

        try {
            await this.dbManager.addUser({
                name,
                email,
                age: age ? parseInt(age) : null,
                notes
            });

            // 清空表单
            document.getElementById('name').value = '';
            document.getElementById('email').value = '';
            document.getElementById('age').value = '';
            document.getElementById('notes').value = '';

            await this.loadUsers();
            this.updateStats();
        } catch (error) {
            console.error('添加用户失败:', error);
            this.dbManager.log('添加用户失败: ' + error.message, 'error');
        }
    }

    async loadUsers() {
        try {
            this.showLoading();
            this.currentUsers = await this.dbManager.getAllUsers();
            this.renderUsers(this.currentUsers);
        } catch (error) {
            console.error('加载用户失败:', error);
            this.showError('加载数据失败: ' + error.message);
            this.dbManager.log('加载用户失败: ' + error.message, 'error');
        }
    }

    async searchUsers(query) {
        // 清除之前的定时器
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // 设置防抖
        this.searchTimeout = setTimeout(async () => {
            if (!query.trim()) {
                this.renderUsers(this.currentUsers);
                return;
            }

            try {
                const results = await this.dbManager.searchUsers(query);
                this.renderUsers(results);
            } catch (error) {
                console.error('搜索失败:', error);
                this.dbManager.log('搜索失败: ' + error.message, 'error');
            }
        }, 300); // 300ms 防抖延迟
    }

    renderUsers(users) {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #64748b;">暂无数据</td></tr>';
            return;
        }

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${this.escapeHtml(user.name)}</td>
                <td>${this.escapeHtml(user.email)}</td>
                <td>${user.age || '-'}</td>
                <td>${this.escapeHtml(user.notes || '-')}</td>
                <td>${new Date(user.createdAt).toLocaleString()}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="app.editUser(${user.id})">编辑</button>
                    <button class="action-btn delete-btn" onclick="app.deleteUser(${user.id})">删除</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // 显示加载状态
    showLoading() {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #64748b;">⏳ 加载中...</td></tr>';
    }

    // 显示错误状态
    showError(message) {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #ff6b6b;">❌ ${message}</td></tr>`;
    }

    async deleteUser(id) {
        if (confirm('确定要删除这条记录吗？')) {
            try {
                await this.dbManager.deleteUser(id);
                await this.loadUsers();
                this.updateStats();
            } catch (error) {
                console.error('删除用户失败:', error);
            }
        }
    }

    editUser(id) {
        const user = this.currentUsers.find(u => u.id === id);
        if (!user) return;

        document.getElementById('name').value = user.name;
        document.getElementById('email').value = user.email;
        document.getElementById('age').value = user.age || '';
        document.getElementById('notes').value = user.notes || '';

        // 修改按钮行为
        const addBtn = document.getElementById('addBtn');
        addBtn.textContent = '💾 更新记录';
        
        // 移除之前的事件监听器
        addBtn.removeEventListener('click', this.addUserHandler);
        
        // 添加更新事件监听器
        this.updateUserHandler = async () => {
            try {
                await this.dbManager.updateUser(id, {
                    name: document.getElementById('name').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    age: document.getElementById('age').value.trim() ? parseInt(document.getElementById('age').value) : null,
                    notes: document.getElementById('notes').value.trim()
                });

                // 重置表单和按钮
                this.resetForm();
                await this.loadUsers();
                this.updateStats();
            } catch (error) {
                console.error('更新用户失败:', error);
            }
        };
        
        addBtn.addEventListener('click', this.updateUserHandler);
    }

    resetForm() {
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('age').value = '';
        document.getElementById('notes').value = '';

        const addBtn = document.getElementById('addBtn');
        addBtn.textContent = '➕ 添加记录';
        
        // 移除更新事件监听器
        if (this.updateUserHandler) {
            addBtn.removeEventListener('click', this.updateUserHandler);
        }
        
        // 重新添加添加用户事件监听器
        addBtn.addEventListener('click', this.addUserHandler);
    }

    async clearAll() {
        if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
            try {
                await this.dbManager.clearAll();
                await this.loadUsers();
                this.updateStats();
            } catch (error) {
                console.error('清空数据失败:', error);
            }
        }
    }

    async updateStats() {
        const totalCount = this.currentUsers.length;
        const dbSize = await this.dbManager.getDatabaseSize();
        
        document.getElementById('totalCount').textContent = totalCount;
        document.getElementById('dbSize').textContent = `${(dbSize / 1024).toFixed(2)} KB`;
    }

    triggerFileImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    await this.dbManager.importData(file);
                    await this.loadUsers();
                    this.updateStats();
                } catch (error) {
                    console.error('导入失败:', error);
                }
            }
        };
        input.click();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 启动应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new IndexedDBDemo();
});
