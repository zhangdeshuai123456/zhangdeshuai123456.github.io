// 旅行数据库管理类
class TravelDatabaseManager {
    constructor() {
        this.dbName = 'TravelAssistantDB';
        this.dbVersion = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
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
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 创建旅行计划存储
                if (!db.objectStoreNames.contains('trips')) {
                    const tripsStore = db.createObjectStore('trips', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    tripsStore.createIndex('name', 'name', { unique: false });
                    tripsStore.createIndex('destination', 'destination', { unique: false });
                    tripsStore.createIndex('startDate', 'startDate', { unique: false });
                }

                // 创建支出存储
                if (!db.objectStoreNames.contains('expenses')) {
                    const expensesStore = db.createObjectStore('expenses', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    expensesStore.createIndex('name', 'name', { unique: false });
                    expensesStore.createIndex('category', 'category', { unique: false });
                    expensesStore.createIndex('tripId', 'tripId', { unique: false });
                    expensesStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // 创建行李物品存储
                if (!db.objectStoreNames.contains('items')) {
                    const itemsStore = db.createObjectStore('items', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    itemsStore.createIndex('name', 'name', { unique: false });
                    itemsStore.createIndex('category', 'category', { unique: false });
                    itemsStore.createIndex('tripId', 'tripId', { unique: false });
                    itemsStore.createIndex('packed', 'packed', { unique: false });
                }

                this.log('数据库结构创建成功', 'success');
            };
        });
    }

    // 旅行计划相关方法
    async addTrip(tripData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction(['trips'], 'readwrite');
            const store = transaction.objectStore('trips');

            const trip = {
                ...tripData,
                createdAt: new Date().toISOString()
            };

            const request = store.add(trip);

            request.onsuccess = () => {
                this.log(`旅行计划 "${tripData.name}" 创建成功`, 'success');
                resolve(request.result);
            };

            request.onerror = () => {
                this.log('创建旅行计划失败', 'error');
                reject(request.error);
            };
        });
    }

    async getAllTrips() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction(['trips'], 'readonly');
            const store = transaction.objectStore('trips');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                this.log('获取旅行计划失败', 'error');
                reject(request.error);
            };
        });
    }

    async getTrip(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction(['trips'], 'readonly');
            const store = transaction.objectStore('trips');
            const request = store.get(parseInt(id));

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                this.log('获取旅行计划失败', 'error');
                reject(request.error);
            };
        });
    }

    async updateTrip(id, updateData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction(['trips'], 'readwrite');
            const store = transaction.objectStore('trips');
            const getRequest = store.get(parseInt(id));

            getRequest.onsuccess = () => {
                const trip = getRequest.result;
                if (trip) {
                    const updatedTrip = {
                        ...trip,
                        ...updateData,
                        updatedAt: new Date().toISOString()
                    };

                    const putRequest = store.put(updatedTrip);
                    putRequest.onsuccess = () => {
                        this.log(`旅行计划 "${trip.name}" 更新成功`, 'success');
                        resolve(putRequest.result);
                    };
                    putRequest.onerror = () => {
                        this.log('更新旅行计划失败', 'error');
                        reject(putRequest.error);
                    };
                } else {
                    reject(new Error('旅行计划不存在'));
                }
            };

            getRequest.onerror = () => {
                this.log('获取旅行计划失败', 'error');
                reject(getRequest.error);
            };
        });
    }

    async removeTrip(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction(['trips'], 'readwrite');
            const store = transaction.objectStore('trips');
            const request = store.delete(parseInt(id));

            request.onsuccess = () => {
                this.log(`旅行计划 ID: ${id} 删除成功`, 'success');
                resolve();
            };

            request.onerror = () => {
                this.log('删除旅行计划失败', 'error');
                reject(request.error);
            };
        });
    }

    async clearTrips() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction(['trips'], 'readwrite');
            const store = transaction.objectStore('trips');
            const request = store.clear();

            request.onsuccess = () => {
                this.log('所有旅行计划已清空', 'success');
                resolve();
            };

            request.onerror = () => {
                this.log('清空旅行计划失败', 'error');
                reject(request.error);
            };
        });
    }

    // 支出相关方法
    async addExpense(expenseData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction(['expenses'], 'readwrite');
            const store = transaction.objectStore('expenses');

            const expense = {
                ...expenseData,
                createdAt: new Date().toISOString()
            };

            const request = store.add(expense);

            request.onsuccess = () => {
                this.log(`支出项目 "${expenseData.name}" 添加成功`, 'success');
                resolve(request.result);
            };

            request.onerror = () => {
                this.log('添加支出失败', 'error');
                reject(request.error);
            };
        });
    }

    async getAllExpenses() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction(['expenses'], 'readonly');
            const store = transaction.objectStore('expenses');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                this.log('获取支出数据失败', 'error');
                reject(request.error);
            };
        });
    }

    async getExpense(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction(['expenses'], 'readonly');
            const store = transaction.objectStore('expenses');
            const request = store.get(parseInt(id));

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                this.log('获取支出记录失败', 'error');
                reject(request.error);
            };
        });
    }

    async updateExpense(id, updateData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction(['expenses'], 'readwrite');
            const store = transaction.objectStore('expenses');
            const getRequest = store.get(parseInt(id));

            getRequest.onsuccess = () => {
                const expense = getRequest.result;
                if (expense) {
                    const updatedExpense = {
                        ...expense,
                        ...updateData,
                        updatedAt: new Date().toISOString()
                    };

                    const putRequest = store.put(updatedExpense);
                    putRequest.onsuccess = () => {
                        this.log(`支出记录 "${expense.name}" 更新成功`, 'success');
                        resolve(putRequest.result);
                    };
                    putRequest.onerror = () => {
                        this.log('更新支出记录失败', 'error');
                        reject(putRequest.error);
                    };
                } else {
                    reject(new Error('支出记录不存在'));
                }
            };

            getRequest.onerror = () => {
                this.log('获取支出记录失败', 'error');
                reject(getRequest.error);
            };
        });
    }

    async removeExpense(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction(['expenses'], 'readwrite');
            const store = transaction.objectStore('expenses');
            const request = store.delete(parseInt(id));

            request.onsuccess = () => {
                this.log(`支出记录 ID: ${id} 删除成功`, 'success');
                resolve();
            };

            request.onerror = () => {
                this.log('删除支出记录失败', 'error');
                reject(request.error);
            };
        });
    }

    async clearExpenses() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction(['expenses'], 'readwrite');
            const store = transaction.objectStore('expenses');
            const request = store.clear();

            request.onsuccess = () => {
                this.log('所有支出记录已清空', 'success');
                resolve();
            };

            request.onerror = () => {
                this.log('清空支出记录失败', 'error');
                reject(request.error);
            };
        });
    }

    // 行李物品相关方法
    async addItem(itemData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction(['items'], 'readwrite');
            const store = transaction.objectStore('items');

            const item = {
                ...itemData,
                createdAt: new Date().toISOString()
            };

            const request = store.add(item);

            request.onsuccess = () => {
                this.log(`行李物品 "${itemData.name}" 添加成功`, 'success');
                resolve(request.result);
            };

            request.onerror = () => {
                this.log('添加行李物品失败', 'error');
                reject(request.error);
            };
        });
    }

    async getAllItems() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction(['items'], 'readonly');
            const store = transaction.objectStore('items');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                this.log('获取行李清单失败', 'error');
                reject(request.error);
            };
        });
    }

    async getItem(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction(['items'], 'readonly');
            const store = transaction.objectStore('items');
            const request = store.get(parseInt(id));

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                this.log('获取行李物品失败', 'error');
                reject(request.error);
            };
        });
    }

    async updateItem(id, updateData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction(['items'], 'readwrite');
            const store = transaction.objectStore('items');
            const getRequest = store.get(parseInt(id));

            getRequest.onsuccess = () => {
                const item = getRequest.result;
                if (item) {
                    const updatedItem = {
                        ...item,
                        ...updateData,
                        updatedAt: new Date().toISOString()
                    };

                    const putRequest = store.put(updatedItem);
                    putRequest.onsuccess = () => {
                        this.log(`行李物品 "${item.name}" 更新成功`, 'success');
                        resolve(putRequest.result);
                    };
                    putRequest.onerror = () => {
                        this.log('更新行李物品失败', 'error');
                        reject(putRequest.error);
                    };
                } else {
                    reject(new Error('物品不存在'));
                }
            };

            getRequest.onerror = () => {
                this.log('获取行李物品失败', 'error');
                reject(getRequest.error);
            };
        });
    }

    async removeItem(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction(['items'], 'readwrite');
            const store = transaction.objectStore('items');
            const request = store.delete(parseInt(id));

            request.onsuccess = () => {
                this.log(`行李物品 ID: ${id} 删除成功`, 'success');
                resolve();
            };

            request.onerror = () => {
                this.log('删除行李物品失败', 'error');
                reject(request.error);
            };
        });
    }

    async clearItems() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction(['items'], 'readwrite');
            const store = transaction.objectStore('items');
            const request = store.clear();

            request.onsuccess = () => {
                this.log('所有行李物品已清空', 'success');
                resolve();
            };

            request.onerror = () => {
                this.log('清空行李清单失败', 'error');
                reject(request.error);
            };
        });
    }
}

// 旅行助手应用主类
class TravelAssistant {
    constructor() {
        this.dbManager = new TravelDatabaseManager();
        this.currentTrips = [];
        this.currentExpenses = [];
        this.currentItems = [];
    }

    async init() {
        try {
            await this.dbManager.init();
            this.bindEvents();
            this.bindNavigationEvents();
            await this.loadAllData();
            this.updateAllStats();
            
            // 启动时间更新
            this.updateTime();
            setInterval(() => this.updateTime(), 60000); // 每分钟更新一次
            
            // 加载首页数据
            await this.loadHomeData();
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.dbManager.log('应用初始化失败', 'error');
        }
    }

    // 绑定导航事件
    bindNavigationEvents() {
        // 底部导航栏事件委托
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.addEventListener('click', (e) => {
                const navItem = e.target.closest('.nav-item');
                if (navItem) {
                    const page = navItem.dataset.page;
                    if (page) {
                        this.switchPage(page);
                    }
                }
            });
        }
        
        console.log('导航事件已绑定');
    }

    // 页面切换方法
    switchPage(pageName) {
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // 显示目标页面
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // 更新导航状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`[data-page="${pageName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        
        // 加载页面数据
        this.loadPageData(pageName);
        
        // 更新页面标题
        this.updatePageTitle(pageName);
        
        // 滚动到顶部
        window.scrollTo(0, 0);
    }

    // 获取当前页面
    getCurrentPage() {
        const activePage = document.querySelector('.page.active');
        if (activePage) {
            return activePage.id.replace('-page', '');
        }
        return 'home';
    }

    // 加载页面数据
    async loadPageData(pageName) {
        switch (pageName) {
            case 'home':
                await this.loadHomeData();
                break;
            case 'trips':
                await this.loadTrips();
                break;
            case 'budget':
                await this.loadExpenses();
                break;
            case 'checklist':
                await this.loadItems();
                break;
            case 'stats':
                this.updateAllStats();
                break;
        }
    }

    // 更新页面标题
    updatePageTitle(pageName) {
        const pageTitles = {
            'home': '首页',
            'trips': '旅行计划',
            'budget': '预算管理',
            'checklist': '行李清单',
            'stats': '统计信息'
        };
        
        const title = pageTitles[pageName] || '旅行助手';
        document.title = `${title} - 旅行助手`;
    }

    // 显示模态框
    showModal(title, content) {
        const modalOverlay = document.getElementById('modalOverlay');
        const modal = document.getElementById('modal');
        
        if(!modalOverlay || !modal) return;
        
        modal.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="app.hideModal()">×</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        `;
        
        modalOverlay.style.display = 'flex';
        
        // 添加动画效果
        setTimeout(() => {
            modal.classList.add('modal-show');
        }, 10);
    }

    // 隐藏模态框
    hideModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        const modal = document.getElementById('modal');
        
        if(!modalOverlay || !modal) return;
        
        modal.classList.remove('modal-show');
        
        setTimeout(() => {
            modalOverlay.style.display = 'none';
        }, 300);
    }

    // 切换快速操作菜单
    toggleQuickActions() {
        const quickActions = document.getElementById('quickActionsMenu');
        if (quickActions) {
            if (quickActions.style.display === 'none') {
                quickActions.style.display = 'block';
            } else {
                quickActions.style.display = 'none';
            }
        }
    }

    // 隐藏快速操作菜单
    hideQuickActions() {
        const quickActions = document.getElementById('quickActionsMenu');
        if (quickActions) {
            quickActions.style.display = 'none';
        }
    }

    // 绑定事件
    bindEvents() {
        // 模态框事件
        document.addEventListener('click', (e) => {
            // 关闭模态框
            if (e.target.classList.contains('modal-overlay')) {
                this.hideModal();
            }
            
            // 关闭按钮
            if (e.target.classList.contains('close-btn')) {
                this.hideModal();
            }
        });

        // 搜索功能
        const searchInput = document.getElementById('searchTrips');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // 删除重复的底部导航事件绑定，因为已在bindNavigationEvents中实现

        // 通知铃铛
        const notificationBell = document.querySelector('.notification-bell');
        if (notificationBell) {
            notificationBell.addEventListener('click', () => {
                this.showNotifications();
            });
        }

        // 表单提交事件
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('add-form')) {
                e.preventDefault();
                this.handleFormSubmit(e.target);
            }
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
                this.hideQuickActions();
            }
        });

        // 浮动操作按钮
        const fab = document.getElementById('fab');
        if (fab) {
            fab.addEventListener('click', () => {
                this.showQuickActions();
            });
        }

        // 触摸手势支持
        this.bindTouchEvents();
    }

    // 标签页切换
    switchTab(tabName) {
        // 移除所有活动状态
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // 激活选中的标签页
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // 更新下拉选项
        this.updateTripSelects();
    }

    // 加载首页数据
    async loadHomeData() {
        try {
            // 加载最近的旅行计划
            const recentTrips = this.currentTrips.slice(0, 3);
            this.renderRecentTrips(recentTrips);
            
            // 更新统计信息
            this.updateHomeStats();
        } catch (error) {
            console.error('加载首页数据失败:', error);
        }
    }

    // 渲染最近的旅行计划
    renderRecentTrips(trips) {
        const container = document.getElementById('recentTrips');
        if (!container) return;
        
        if (trips.length === 0) {
            // 保留原始的空状态显示
            return;
        }
        
        // 移除原始的空状态显示
        container.innerHTML = '';
        
        // 创建并添加旅行卡片
        trips.forEach(trip => {
            const tripCard = document.createElement('div');
            tripCard.className = 'trip-card';
            tripCard.innerHTML = `
                <h4>${this.escapeHtml(trip.name)}</h4>
                <p>${this.escapeHtml(trip.destination)}</p>
                <span class="trip-date">${new Date(trip.startDate).toLocaleDateString()}</span>
            `;
            tripCard.onclick = () => this.showTripDetail(trip.id);
            container.appendChild(tripCard);
        });
    }

    // 渲染最近的支出
    renderRecentExpenses(expenses) {
        const container = document.getElementById('recentExpenses');
        if (!container) return;
        
        if (expenses.length === 0) {
            container.innerHTML = '<p class="empty-state">暂无支出记录</p>';
            return;
        }
        
        container.innerHTML = expenses.map(expense => `
            <div class="expense-item">
                <span class="expense-name">${this.escapeHtml(expense.name)}</span>
                <span class="expense-amount">¥${expense.amount.toLocaleString()}</span>
            </div>
        `).join('');
    }

    // 渲染待打包的物品
    renderUnpackedItems(items) {
        const container = document.getElementById('unpackedItems');
        if (!container) return;
        
        if (items.length === 0) {
            container.innerHTML = '<p class="empty-state">所有物品已打包</p>';
            return;
        }
        
        container.innerHTML = items.map(item => `
            <div class="item-card">
                <span class="item-name">${this.escapeHtml(item.name)}</span>
                <span class="item-category">${this.getItemCategoryText(item.category)}</span>
            </div>
        `).join('');
    }

    // 更新首页统计
    updateHomeStats() {
        const totalTrips = this.currentTrips.length;
        const totalBudget = this.currentTrips.reduce((sum, trip) => sum + (parseFloat(trip.budget) || 0), 0);
        const packedItems = this.currentItems.filter(item => item.packed).length;
        
        // 更新统计显示
        const statsElements = {
            'totalTrips': totalTrips,
            'totalBudget': `¥${totalBudget.toLocaleString()}`,
            'packedItems': packedItems
        };
        
        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    // 加载所有数据
    async loadAllData() {
        await Promise.all([
            this.loadTrips(),
            this.loadExpenses(),
            this.loadItems()
        ]);
    }

    // 更新所有统计
    updateAllStats() {
        try {
            this.updateTripStats();
            this.updateExpenseStats();
            this.updateItemStats();
            this.updateOverallStats();
            this.updateHomeStats();
        } catch (error) {
            console.error('更新统计信息失败:', error);
        }
    }

    // ==================== 旅行计划管理 ====================
    async loadTrips() {
        try {
            this.currentTrips = await this.dbManager.getAllTrips();
            this.renderTrips(this.currentTrips);
            this.updateTripSelects();
        } catch (error) {
            console.error('加载旅行计划失败:', error);
            this.dbManager.log('加载旅行计划失败: ' + error.message, 'error');
        }
    }

    async addTrip() {
        const tripName = document.getElementById('tripName').value.trim();
        const destination = document.getElementById('destination').value.trim();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const budget = document.getElementById('budget').value.trim();
        const description = document.getElementById('description').value.trim();

        // 高级表单验证
        const fields = [
            { element: document.getElementById('tripName'), value: tripName, required: true },
            { element: document.getElementById('destination'), value: destination, required: true },
            { element: document.getElementById('startDate'), value: startDate, required: true },
            { element: document.getElementById('endDate'), value: endDate, required: true }
        ];

        for (const field of fields) {
            if (field.required && !field.value) {
                this.showFieldError(field.element, '此字段为必填项');
                field.element.focus();
                this.showNotification('请填写所有必填字段', 'error');
                return;
            }
        }

        if (new Date(startDate) >= new Date(endDate)) {
            this.showFieldError(document.getElementById('endDate'), '结束日期必须晚于开始日期');
            this.showNotification('日期设置不正确', 'error');
            return;
        }

        const addBtn = document.getElementById('addTripBtn');
        const stopLoading = this.showLoading(addBtn, '创建中...');

        try {
            await this.dbManager.addTrip({
                name: tripName,
                destination,
                startDate,
                endDate,
                budget: budget ? parseFloat(budget) : 0,
                description
            });

            // 清空表单
            this.resetTripForm();
            await this.loadTrips();
            this.updateAllStats();
            
            this.showNotification('旅行计划创建成功！', 'success');
        } catch (error) {
            console.error('添加旅行计划失败:', error);
            this.showNotification('创建失败: ' + error.message, 'error');
        } finally {
            stopLoading();
        }
    }

    renderTrips(trips) {
        const tripsList = document.getElementById('tripsList');
        if (!tripsList) {
            console.error('找不到tripsList元素');
            return;
        }
        
        tripsList.innerHTML = '';

        if (trips.length === 0) {
            tripsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">✈️</div>
                    <p>暂无旅行计划</p>
                    <button class="btn btn-primary" onclick="app.showAddTripModal()">创建第一个计划</button>
                </div>
            `;
            return;
        }

        trips.forEach(trip => {
            const status = this.getTripStatus(trip);
            const tripCard = document.createElement('div');
            tripCard.className = 'trip-card';
            tripCard.innerHTML = `
                <div class="trip-header">
                    <h3>${this.escapeHtml(trip.name)}</h3>
                    <span class="trip-status ${status}">${this.getStatusText(status)}</span>
                </div>
                <div class="trip-info">
                    <span>📍 ${this.escapeHtml(trip.destination)}</span>
                    <span>🗓️ ${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}</span>
                </div>
                <div class="trip-budget">预算: ¥${(trip.budget || 0).toLocaleString()}</div>
                <div class="trip-actions">
                    <button class="btn btn-sm btn-secondary" onclick="app.editTrip(${trip.id})">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteTrip(${trip.id})">删除</button>
                </div>
            `;
            tripCard.addEventListener('click', (e) => {
                // 防止点击按钮时触发卡片点击事件
                if (!e.target.closest('button')) {
                    this.showTripDetail(trip.id);
                }
            });
            tripsList.appendChild(tripCard);
        });
    }

    getTripStatus(trip) {
        const now = new Date();
        const startDate = new Date(trip.startDate);
        const endDate = new Date(trip.endDate);

        if (now < startDate) return 'planned';
        if (now >= startDate && now <= endDate) return 'ongoing';
        return 'completed';
    }

    getStatusText(status) {
        const statusMap = {
            'planned': '计划中',
            'ongoing': '进行中',
            'completed': '已完成'
        };
        return statusMap[status] || status;
    }

    getTripStatusText(trip) {
        return this.getStatusText(this.getTripStatus(trip));
    }

    async searchTrips(query) {
        if (!query.trim()) {
            this.renderTrips(this.currentTrips);
            return;
        }

        const results = this.currentTrips.filter(trip => 
            trip.name.toLowerCase().includes(query.toLowerCase()) ||
            trip.destination.toLowerCase().includes(query.toLowerCase()) ||
            (trip.description && trip.description.toLowerCase().includes(query.toLowerCase()))
        );
        this.renderTrips(results);
    }

    async deleteTrip(id) {
        if (confirm('确定要删除这个旅行计划吗？相关的预算和行李清单也会被删除。')) {
            try {
                await this.dbManager.deleteTrip(id);
                await this.loadAllData();
                this.updateAllStats();
            } catch (error) {
                console.error('删除旅行计划失败:', error);
            }
        }
    }

    editTrip(id) {
        const trip = this.currentTrips.find(t => t.id === id);
        if (!trip) return;

        document.getElementById('tripName').value = trip.name;
        document.getElementById('destination').value = trip.destination;
        document.getElementById('startDate').value = trip.startDate;
        document.getElementById('endDate').value = trip.endDate;
        document.getElementById('budget').value = trip.budget;
        document.getElementById('description').value = trip.description || '';

        // 修改按钮行为
        const addBtn = document.getElementById('addTripBtn');
        addBtn.textContent = '💾 更新计划';
        
        // 存储编辑状态
        this.editingTripId = id;
    }

    resetTripForm() {
        document.getElementById('tripName').value = '';
        document.getElementById('destination').value = '';
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        document.getElementById('budget').value = '';
        document.getElementById('description').value = '';

        const addBtn = document.getElementById('addTripBtn');
        addBtn.textContent = '➕ 创建计划';
        this.editingTripId = null;
    }

    async clearTrips() {
        if (confirm('确定要清空所有旅行计划吗？此操作不可恢复！')) {
            try {
                await this.dbManager.clearTrips();
                await this.loadAllData();
                this.updateAllStats();
            } catch (error) {
                console.error('清空旅行计划失败:', error);
            }
        }
    }

    // ==================== 预算管理 ====================
    async loadExpenses() {
        try {
            this.currentExpenses = await this.dbManager.getAllExpenses();
            this.renderExpenses(this.currentExpenses);
        } catch (error) {
            console.error('加载预算数据失败:', error);
            this.dbManager.log('加载预算数据失败: ' + error.message, 'error');
        }
    }

    async addExpense() {
        const name = document.getElementById('expenseName').value.trim();
        const amount = document.getElementById('expenseAmount').value.trim();
        const category = document.getElementById('expenseCategory').value;
        const tripId = document.getElementById('expenseTrip').value;
        const notes = document.getElementById('expenseNotes').value.trim();

        if (!name) {
            this.dbManager.log('请填写项目名称', 'error');
            document.getElementById('expenseName').focus();
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            this.dbManager.log('请填写有效金额', 'error');
            document.getElementById('expenseAmount').focus();
            return;
        }

        try {
            await this.dbManager.addExpense({
                name,
                amount: parseFloat(amount),
                category,
                tripId: tripId || null,
                notes
            });

            // 清空表单
            this.resetExpenseForm();
            await this.loadExpenses();
            this.updateAllStats();
        } catch (error) {
            console.error('添加支出失败:', error);
            this.dbManager.log('添加支出失败: ' + error.message, 'error');
        }
    }

    renderExpenses(expenses) {
        const expensesList = document.getElementById('expensesList');
        if (!expensesList) {
            console.error('找不到expensesList元素');
            return;
        }
        
        expensesList.innerHTML = '';

        if (expenses.length === 0) {
            expensesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💰</div>
                    <p>暂无支出记录</p>
                    <button class="btn btn-primary" onclick="app.showAddExpenseModal()">添加第一笔支出</button>
                </div>
            `;
            return;
        }

        expenses.forEach(expense => {
            const trip = this.currentTrips.find(t => t.id === expense.tripId);
            const expenseCard = document.createElement('div');
            expenseCard.className = 'expense-card';
            expenseCard.innerHTML = `
                <div class="expense-header">
                    <h3>${this.escapeHtml(expense.name)}</h3>
                    <span class="expense-amount">¥${expense.amount.toLocaleString()}</span>
                </div>
                <div class="expense-info">
                    <span class="expense-category">${this.getCategoryText(expense.category)}</span>
                    <span>${expense.date ? new Date(expense.date).toLocaleDateString() : new Date(expense.createdAt).toLocaleDateString()}</span>
                    ${trip ? `<span>旅行: ${this.escapeHtml(trip.name)}</span>` : ''}
                </div>
                ${expense.notes ? `<p class="expense-notes">${this.escapeHtml(expense.notes)}</p>` : ''}
                <div class="expense-actions">
                    <button class="btn btn-sm btn-secondary" onclick="app.editExpense(${expense.id})">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteExpense(${expense.id})">删除</button>
                </div>
            `;
            expensesList.appendChild(expenseCard);
        });
    }

    getCategoryText(category) {
        const categoryMap = {
            'transportation': '交通',
            'accommodation': '住宿',
            'food': '餐饮',
            'entertainment': '娱乐',
            'shopping': '购物',
            'other': '其他'
        };
        return categoryMap[category] || category;
    }

    async searchExpenses(query) {
        if (!query.trim()) {
            this.renderExpenses(this.currentExpenses);
            return;
        }

        const results = this.currentExpenses.filter(expense => 
            expense.name.toLowerCase().includes(query.toLowerCase()) ||
            (expense.notes && expense.notes.toLowerCase().includes(query.toLowerCase()))
        );
        this.renderExpenses(results);
    }

    async deleteExpense(id) {
        if (confirm('确定要删除这个支出记录吗？')) {
            try {
                await this.dbManager.deleteExpense(id);
                await this.loadExpenses();
                this.updateAllStats();
            } catch (error) {
                console.error('删除支出失败:', error);
            }
        }
    }

    resetExpenseForm() {
        document.getElementById('expenseName').value = '';
        document.getElementById('expenseAmount').value = '';
        document.getElementById('expenseCategory').value = 'transportation';
        document.getElementById('expenseTrip').value = '';
        document.getElementById('expenseNotes').value = '';
    }

    async clearExpenses() {
        if (confirm('确定要清空所有支出记录吗？此操作不可恢复！')) {
            try {
                await this.dbManager.clearExpenses();
                await this.loadExpenses();
                this.updateAllStats();
            } catch (error) {
                console.error('清空支出记录失败:', error);
            }
        }
    }

    // ==================== 行李清单管理 ====================
    async loadItems() {
        try {
            this.currentItems = await this.dbManager.getAllItems();
            this.renderItems(this.currentItems);
        } catch (error) {
            console.error('加载行李清单失败:', error);
            this.dbManager.log('加载行李清单失败: ' + error.message, 'error');
        }
    }

    async addItem() {
        const name = document.getElementById('itemName').value.trim();
        const category = document.getElementById('itemCategory').value;
        const tripId = document.getElementById('itemTrip').value;
        const notes = document.getElementById('itemNotes').value.trim();

        if (!name) {
            this.dbManager.log('请填写物品名称', 'error');
            document.getElementById('itemName').focus();
            return;
        }

        try {
            await this.dbManager.addItem({
                name,
                category,
                tripId: tripId || null,
                notes,
                packed: false
            });

            // 清空表单
            this.resetItemForm();
            await this.loadItems();
            this.updateAllStats();
        } catch (error) {
            console.error('添加物品失败:', error);
            this.dbManager.log('添加物品失败: ' + error.message, 'error');
        }
    }

    renderItems(items) {
        const itemsList = document.getElementById('itemsList');
        if (!itemsList) {
            console.error('找不到itemsList元素');
            return;
        }
        
        itemsList.innerHTML = '';

        if (items.length === 0) {
            itemsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💰</div>
                    <p>暂无行李物品</p>
                    <button class="btn btn-primary" onclick="app.showAddItemModal()">添加第一个物品</button>
                </div>
            `;
            return;
        }

        // 更新打包进度
        const packedCount = items.filter(item => item.packed).length;
        const totalCount = items.length;
        const packingPercentage = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;
        
        document.getElementById('packedCount').textContent = packedCount;
        document.getElementById('totalCount').textContent = totalCount;
        document.getElementById('packingPercentage').textContent = `${packingPercentage}%`;
        document.getElementById('packingProgress').style.width = `${packingPercentage}%`;

        // 按分类分组显示物品
        const categories = {};
        items.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });

        // 先显示未打包的物品
        Object.keys(categories).forEach(category => {
            const categoryItems = categories[category];
            const categoryName = this.getItemCategoryText(category);
            
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section';
            categorySection.innerHTML = `<h3 class="category-title">${categoryName}</h3>`;
            
            // 未打包的物品
            const unpackedItems = categoryItems.filter(item => !item.packed);
            if (unpackedItems.length > 0) {
                unpackedItems.forEach(item => {
                    const trip = this.currentTrips.find(t => t.id === item.tripId);
                    const itemCard = document.createElement('div');
                    itemCard.className = 'item-card';
                    itemCard.innerHTML = `
                        <div class="item-checkbox">
                            <input type="checkbox" id="item-${item.id}" ${item.packed ? 'checked' : ''} 
                                onchange="app.toggleItemPacked(${item.id})">
                        </div>
                        <div class="item-info">
                            <h3>${this.escapeHtml(item.name)}</h3>
                            ${trip ? `<span class="item-trip">旅行: ${this.escapeHtml(trip.name)}</span>` : ''}
                            ${item.notes ? `<p class="item-notes">${this.escapeHtml(item.notes)}</p>` : ''}
                        </div>
                        <div class="item-actions">
                            <button class="btn btn-sm btn-secondary" onclick="app.editItem(${item.id})">编辑</button>
                            <button class="btn btn-sm btn-danger" onclick="app.deleteItem(${item.id})">删除</button>
                        </div>
                    `;
                    categorySection.appendChild(itemCard);
                });
            }
            
            // 已打包的物品
            const packedItems = categoryItems.filter(item => item.packed);
            if (packedItems.length > 0) {
                const packedSection = document.createElement('div');
                packedSection.className = 'packed-section';
                packedSection.innerHTML = `<h4 class="packed-title">已打包 (${packedItems.length})</h4>`;
                
                packedItems.forEach(item => {
                    const trip = this.currentTrips.find(t => t.id === item.tripId);
                    const itemCard = document.createElement('div');
                    itemCard.className = 'item-card packed';
                    itemCard.innerHTML = `
                        <div class="item-checkbox">
                            <input type="checkbox" id="item-${item.id}" ${item.packed ? 'checked' : ''} 
                                onchange="app.toggleItemPacked(${item.id})">
                        </div>
                        <div class="item-info">
                            <h3>${this.escapeHtml(item.name)}</h3>
                            ${trip ? `<span class="item-trip">旅行: ${this.escapeHtml(trip.name)}</span>` : ''}
                        </div>
                        <div class="item-actions">
                            <button class="btn btn-sm btn-danger" onclick="app.deleteItem(${item.id})">删除</button>
                        </div>
                    `;
                    packedSection.appendChild(itemCard);
                });
                
                categorySection.appendChild(packedSection);
            }
            
            itemsList.appendChild(categorySection);
        });
    }

    getItemCategoryText(category) {
        const categoryMap = {
            'documents': '证件',
            'electronics': '电子产品',
            'clothing': '衣物',
            'toiletries': '洗漱用品',
            'medicine': '药品',
            'other': '其他'
        };
        return categoryMap[category] || category;
    }

    async toggleItemPacked(id) {
        try {
            const item = this.currentItems.find(i => i.id === parseInt(id));
            if (!item) {
                console.error('找不到物品ID:', id);
                return;
            }
            
            // 更新复选框状态
            const checkbox = document.getElementById(`item-${id}`);
            if (checkbox) {
                checkbox.disabled = true; // 防止重复点击
            }
            
            // 更新数据库
            await this.dbManager.updateItem(parseInt(id), { packed: !item.packed });
            
            // 更新UI显示
            await this.loadItems();
            this.updateAllStats();
            
            // 显示提示
            this.showNotification(item.packed ? `已取消打包：${item.name}` : `已打包：${item.name}`, 'success');
        } catch (error) {
            console.error('更新物品状态失败:', error);
            this.showNotification('更新物品状态失败', 'error');
        }
    }

    async searchItems(query) {
        if (!query.trim()) {
            this.renderItems(this.currentItems);
            return;
        }

        const results = this.currentItems.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            (item.notes && item.notes.toLowerCase().includes(query.toLowerCase()))
        );
        this.renderItems(results);
    }

    async deleteItem(id) {
        if (confirm('确定要删除这个物品吗？')) {
            try {
                await this.dbManager.deleteItem(id);
                await this.loadItems();
                this.updateAllStats();
            } catch (error) {
                console.error('删除物品失败:', error);
            }
        }
    }

    resetItemForm() {
        document.getElementById('itemName').value = '';
        document.getElementById('itemCategory').value = 'documents';
        document.getElementById('itemTrip').value = '';
        document.getElementById('itemNotes').value = '';
    }

    async clearItems() {
        if (confirm('确定要清空所有行李物品吗？此操作不可恢复！')) {
            try {
                await this.dbManager.clearItems();
                await this.loadItems();
                this.updateAllStats();
            } catch (error) {
                console.error('清空行李清单失败:', error);
            }
        }
    }

    // ==================== 统计功能 ====================
    updateTripStats() {
        const totalTrips = this.currentTrips.length;
        const totalBudget = this.currentTrips.reduce((sum, trip) => sum + trip.budget, 0);
        const upcomingTrips = this.currentTrips.filter(trip => this.getTripStatus(trip) === 'planned').length;

        document.getElementById('totalTrips').textContent = totalTrips;
        document.getElementById('totalBudget').textContent = `¥${totalBudget.toLocaleString()}`;
        document.getElementById('upcomingTrips').textContent = upcomingTrips;
    }

    updateExpenseStats() {
        const totalExpenses = this.currentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalBudget = this.currentTrips.reduce((sum, trip) => sum + trip.budget, 0);
        const remainingBudget = totalBudget - totalExpenses;

        document.getElementById('totalExpenses').textContent = `¥${totalExpenses.toLocaleString()}`;
        document.getElementById('remainingBudget').textContent = `¥${remainingBudget.toLocaleString()}`;
        document.getElementById('expenseCount').textContent = this.currentExpenses.length;
    }

    updateItemStats() {
        const totalItems = this.currentItems.length;
        const packedItems = this.currentItems.filter(item => item.packed).length;
        const remainingItems = totalItems - packedItems;
        const packingRate = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

        // 更新打包进度条
        const packingProgress = document.getElementById('packingProgress');
        if (packingProgress) {
            packingProgress.style.width = `${packingRate}%`;
        }
        
        // 更新打包百分比
        const packingPercentage = document.getElementById('packingPercentage');
        if (packingPercentage) {
            packingPercentage.textContent = `${packingRate}%`;
        }
        
        // 更新其他统计数据
        this.updateElementText('totalItems', totalItems);
        this.updateElementText('packedItems', packedItems);
        this.updateElementText('remainingItems', remainingItems);
        this.updateElementText('totalItemsStats', totalItems);
        this.updateElementText('packedItemsStats', packedItems);
        this.updateElementText('packingRate', `${packingRate}%`);
        
        // 更新打包计数
        this.updateElementText('packedCount', packedItems);
        this.updateElementText('totalCount', totalItems);
    }

    updateOverallStats() {
        // 旅行统计
        const totalTripCount = this.currentTrips.length;
        const completedTrips = this.currentTrips.filter(trip => this.getTripStatus(trip) === 'completed').length;
        const ongoingTrips = this.currentTrips.filter(trip => this.getTripStatus(trip) === 'ongoing').length;
        const plannedTrips = this.currentTrips.filter(trip => this.getTripStatus(trip) === 'planned').length;

        document.getElementById('totalTripCount').textContent = totalTripCount;
        document.getElementById('completedTrips').textContent = completedTrips;
        document.getElementById('ongoingTrips').textContent = ongoingTrips;
        document.getElementById('plannedTrips').textContent = plannedTrips;

        // 预算统计
        const totalBudget = this.currentTrips.reduce((sum, trip) => sum + trip.budget, 0);
        const totalExpenses = this.currentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const avgExpense = this.currentExpenses.length > 0 ? totalExpenses / this.currentExpenses.length : 0;
        const budgetUsage = totalBudget > 0 ? (totalExpenses / totalBudget * 100) : 0;

        document.getElementById('totalBudgetStats').textContent = `¥${totalBudget.toLocaleString()}`;
        document.getElementById('totalExpensesStats').textContent = `¥${totalExpenses.toLocaleString()}`;
        document.getElementById('avgExpense').textContent = `¥${avgExpense.toFixed(0)}`;
        document.getElementById('budgetUsage').textContent = `${budgetUsage.toFixed(1)}%`;

        // 行李统计
        const totalItems = this.currentItems.length;
        const packedItems = this.currentItems.filter(item => item.packed).length;
        const packingRate = totalItems > 0 ? (packedItems / totalItems * 100) : 0;

        document.getElementById('totalItemsStats').textContent = totalItems;
        document.getElementById('packedItemsStats').textContent = packedItems;
        document.getElementById('packingRate').textContent = `${packingRate.toFixed(1)}%`;

        // 支出分类统计
        this.updateCategoryStats();
    }

    updateCategoryStats() {
        const categoryStats = {};
        this.currentExpenses.forEach(expense => {
            categoryStats[expense.category] = (categoryStats[expense.category] || 0) + expense.amount;
        });

        const categoryContainer = document.getElementById('categoryStats');
        categoryContainer.innerHTML = '';

        Object.entries(categoryStats).forEach(([category, amount]) => {
            const p = document.createElement('p');
            p.innerHTML = `<strong>${this.getCategoryText(category)}:</strong> ¥${amount.toLocaleString()}`;
            categoryContainer.appendChild(p);
        });

        if (Object.keys(categoryStats).length === 0) {
            categoryContainer.innerHTML = '<p>暂无支出数据</p>';
        }
    }

    // ==================== 下拉选项更新 ====================
    updateTripSelects() {
        const selects = ['expenseTrip', 'itemTrip'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                // 保存当前选中值
                const currentValue = select.value;
                
                // 清空选项
                select.innerHTML = '<option value="">选择旅行计划</option>';
                
                // 添加旅行计划选项
                this.currentTrips.forEach(trip => {
                    const option = document.createElement('option');
                    option.value = trip.id;
                    option.textContent = trip.name;
                    select.appendChild(option);
                });
                
                // 恢复选中值
                select.value = currentValue;
            }
        });
    }

    // ==================== 导入导出功能 ====================
    async exportTrips() {
        try {
            await this.dbManager.exportTrips();
        } catch (error) {
            console.error('导出旅行计划失败:', error);
        }
    }

    async importTrips() {
        this.triggerFileImport('trips');
    }

    async exportExpenses() {
        try {
            await this.dbManager.exportExpenses();
        } catch (error) {
            console.error('导出预算数据失败:', error);
        }
    }

    async importExpenses() {
        this.triggerFileImport('expenses');
    }

    async exportItems() {
        try {
            await this.dbManager.exportItems();
        } catch (error) {
            console.error('导出行李清单失败:', error);
        }
    }

    async importItems() {
        this.triggerFileImport('items');
    }

    triggerFileImport(type) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    switch (type) {
                        case 'trips':
                            await this.dbManager.importTrips(file);
                            break;
                        case 'expenses':
                            await this.dbManager.importExpenses(file);
                            break;
                        case 'items':
                            await this.dbManager.importItems(file);
                            break;
                    }
                    await this.loadAllData();
                    this.updateAllStats();
                } catch (error) {
                    console.error('导入失败:', error);
                }
            }
        };
        input.click();
    }

    // ==================== 高级交互功能 ====================
    
    // 添加涟漪效果
    addRippleEffect(element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // 设置表单验证
    setupFormValidation() {
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // 实时验证
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
            
            // 添加焦点效果
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
            });
        });
    }
    
    // 验证单个字段
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // 根据字段类型进行验证
        switch (field.id) {
            case 'tripName':
            case 'expenseName':
            case 'itemName':
                if (!value) {
                    isValid = false;
                    errorMessage = '此字段为必填项';
                }
                break;
            case 'budget':
            case 'expenseAmount':
                if (value && (isNaN(value) || parseFloat(value) < 0)) {
                    isValid = false;
                    errorMessage = '请输入有效的金额';
                }
                break;
            case 'startDate':
            case 'endDate':
                if (value) {
                    const date = new Date(value);
                    if (isNaN(date.getTime())) {
                        isValid = false;
                        errorMessage = '请输入有效的日期';
                    }
                }
                break;
        }
        
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }
        
        return isValid;
    }
    
    // 显示字段错误
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('error');
        field.style.borderColor = 'var(--error-500)';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: var(--error-500);
            font-size: 0.75rem;
            margin-top: 0.25rem;
            animation: slideInDown 0.3s ease-out;
        `;
        
        field.parentElement.appendChild(errorDiv);
    }
    
    // 清除字段错误
    clearFieldError(field) {
        field.classList.remove('error');
        field.style.borderColor = '';
        
        const errorDiv = field.parentElement.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    // 设置键盘快捷键
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N: 新建旅行计划
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.switchTab('plans');
                document.getElementById('tripName').focus();
            }
            
            // Ctrl/Cmd + E: 添加支出
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.switchTab('budget');
                document.getElementById('expenseName').focus();
            }
            
            // Ctrl/Cmd + I: 添加物品
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                this.switchTab('checklist');
                document.getElementById('itemName').focus();
            }
            
            // Ctrl/Cmd + S: 查看统计
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.switchTab('stats');
            }
            
            // Escape: 清除表单
            if (e.key === 'Escape') {
                this.clearActiveForm();
            }
        });
    }
    
    // 设置触摸手势
    setupTouchGestures() {
        let startX = 0;
        let startY = 0;
        let currentTab = 0;
        const tabs = ['plans', 'budget', 'checklist', 'stats'];
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // 水平滑动切换标签页
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                const currentTabIndex = tabs.indexOf(document.querySelector('.tab-btn.active').dataset.tab);
                
                if (diffX > 0 && currentTabIndex < tabs.length - 1) {
                    // 向左滑动，下一个标签页
                    this.switchTab(tabs[currentTabIndex + 1]);
                } else if (diffX < 0 && currentTabIndex > 0) {
                    // 向右滑动，上一个标签页
                    this.switchTab(tabs[currentTabIndex - 1]);
                }
            }
        });
    }
    
    // 清除活动表单
    clearActiveForm() {
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        
        switch (activeTab) {
            case 'plans':
                this.resetTripForm();
                break;
            case 'budget':
                this.resetExpenseForm();
                break;
            case 'checklist':
                this.resetItemForm();
                break;
        }
    }
    
    // 显示通知
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `toast toast-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }
    
    // 获取通知图标
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
    
    // 添加加载状态
    showLoading(element, text = '加载中...') {
        const originalText = element.textContent;
        element.textContent = text;
        element.disabled = true;
        element.classList.add('loading');
        
        return () => {
            element.textContent = originalText;
            element.disabled = false;
            element.classList.remove('loading');
        };
    }
    
    // 添加确认对话框
    async showConfirmDialog(message, title = '确认操作') {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: var(--bg-overlay);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: var(--z-modal);
                animation: fadeIn 0.3s ease-out;
            `;
            
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.cssText = `
                background: var(--bg-card);
                border-radius: var(--radius-xl);
                padding: var(--space-6);
                max-width: 400px;
                width: 90%;
                box-shadow: var(--shadow-2xl);
                animation: scaleIn 0.3s ease-out;
            `;
            
            modal.innerHTML = `
                <h3 style="margin-bottom: var(--space-4); color: var(--text-primary);">${title}</h3>
                <p style="margin-bottom: var(--space-6); color: var(--text-secondary);">${message}</p>
                <div style="display: flex; gap: var(--space-3); justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove(); resolve(false);">取消</button>
                    <button class="btn btn-danger" onclick="this.closest('.modal-overlay').remove(); resolve(true);">确认</button>
                </div>
            `;
            
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            
            // 点击遮罩关闭
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                    resolve(false);
                }
            });
        });
    }
    
    // ==================== 工具方法 ====================
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 更新时间显示
    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }
    
    // 辅助方法，更新元素文本
    updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    // 显示旅行详情
    async showTripDetail(tripId) {
        try {
            const trip = await this.getTrip(tripId);
            if (!trip) {
                alert('旅行计划不存在');
                return;
            }

            const content = `
                <div class="modal-header">
                    <h2>${trip.name}</h2>
                    <button class="close-btn" onclick="app.hideModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="trip-detail">
                        <div class="detail-section">
                            <h3>基本信息</h3>
                            <div class="detail-row">
                                <span class="detail-label">目的地:</span>
                                <span class="detail-value">${trip.destination}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">开始日期:</span>
                                <span class="detail-value">${new Date(trip.startDate).toLocaleDateString()}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">结束日期:</span>
                                <span class="detail-value">${new Date(trip.endDate).toLocaleDateString()}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">预算:</span>
                                <span class="detail-value">¥${trip.budget?.toLocaleString() || 0}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">状态:</span>
                                <span class="detail-value trip-status ${this.getTripStatus(trip)}">${this.getTripStatusText(trip)}</span>
                            </div>
                            ${trip.notes ? `
                            <div class="detail-row">
                                <span class="detail-label">备注:</span>
                                <span class="detail-value">${trip.notes}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="app.hideModal()">关闭</button>
                    <button class="btn btn-primary" onclick="app.editTrip('${trip.id}')">编辑</button>
                </div>
            `;
            
            this.showModal(content);
        } catch (error) {
            console.error('显示旅行详情失败:', error);
            alert('加载详情失败');
        }
    }

    // 编辑旅行
    async editTrip(tripId) {
        try {
            const trip = await this.getTrip(tripId);
            if (!trip) {
                alert('旅行计划不存在');
                return;
            }

            const content = `
                <div class="modal-header">
                    <h2>编辑旅行计划</h2>
                    <button class="close-btn" onclick="app.hideModal()">×</button>
                </div>
                <div class="modal-body">
                    <form id="editTripForm">
                        <div class="form-group">
                            <label for="editTripName">旅行名称</label>
                            <input type="text" id="editTripName" required value="${trip.name}">
                        </div>
                        <div class="form-group">
                            <label for="editTripDestination">目的地</label>
                            <input type="text" id="editTripDestination" required value="${trip.destination}">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editTripStartDate">开始日期</label>
                                <input type="date" id="editTripStartDate" required value="${trip.startDate}">
                            </div>
                            <div class="form-group">
                                <label for="editTripEndDate">结束日期</label>
                                <input type="date" id="editTripEndDate" required value="${trip.endDate}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="editTripBudget">预算 (¥)</label>
                            <input type="number" id="editTripBudget" value="${trip.budget || 0}">
                        </div>
                        <div class="form-group">
                            <label for="editTripNotes">备注</label>
                            <textarea id="editTripNotes">${trip.notes || ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="app.hideModal()">取消</button>
                    <button class="btn btn-primary" onclick="app.submitEditTrip('${trip.id}')">保存</button>
                </div>
            `;
            
            this.showModal(content);
        } catch (error) {
            console.error('编辑旅行失败:', error);
            alert('加载编辑表单失败');
        }
    }

    // 提交编辑旅行
    async submitEditTrip(tripId) {
        const tripData = {
            name: document.getElementById('editTripName').value,
            destination: document.getElementById('editTripDestination').value,
            startDate: document.getElementById('editTripStartDate').value,
            endDate: document.getElementById('editTripEndDate').value,
            budget: parseFloat(document.getElementById('editTripBudget').value) || 0,
            notes: document.getElementById('editTripNotes').value
        };
        
        if (!tripData.name || !tripData.destination || !tripData.startDate || !tripData.endDate) {
            alert('请填写所有必填字段');
                return;
            }

        try {
            await this.updateTrip(tripId, tripData);
            this.hideModal();
            this.loadPageData(this.getCurrentPage());
        } catch (error) {
            console.error('更新旅行计划失败:', error);
            alert('更新失败，请重试');
        }
    }

    // 删除旅行
    async deleteTrip(tripId) {
        if (!confirm('确定要删除这个旅行计划吗？此操作不可撤销。')) {
                return;
            }

        try {
            await this.removeTrip(tripId);
            this.loadPageData(this.getCurrentPage());
        } catch (error) {
            console.error('删除旅行计划失败:', error);
            alert('删除失败，请重试');
        }
    }

    // 编辑支出
    async editExpense(expenseId) {
        try {
            const expense = await this.getExpense(expenseId);
            if (!expense) {
                alert('支出记录不存在');
                return;
            }

            const content = `
                <div class="modal-header">
                    <h2>编辑支出</h2>
                    <button class="close-btn" onclick="app.hideModal()">×</button>
                </div>
                <div class="modal-body">
                    <form id="editExpenseForm">
                        <div class="form-group">
                            <label for="editExpenseName">支出项目</label>
                            <input type="text" id="editExpenseName" required value="${expense.name}">
                        </div>
                        <div class="form-group">
                            <label for="editExpenseAmount">金额 (¥)</label>
                            <input type="number" id="editExpenseAmount" required value="${expense.amount}">
                        </div>
                        <div class="form-group">
                            <label for="editExpenseCategory">分类</label>
                            <select id="editExpenseCategory" required>
                                <option value="交通" ${expense.category === '交通' ? 'selected' : ''}>交通</option>
                                <option value="住宿" ${expense.category === '住宿' ? 'selected' : ''}>住宿</option>
                                <option value="餐饮" ${expense.category === '餐饮' ? 'selected' : ''}>餐饮</option>
                                <option value="娱乐" ${expense.category === '娱乐' ? 'selected' : ''}>娱乐</option>
                                <option value="购物" ${expense.category === '购物' ? 'selected' : ''}>购物</option>
                                <option value="其他" ${expense.category === '其他' ? 'selected' : ''}>其他</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editExpenseDate">日期</label>
                            <input type="date" id="editExpenseDate" required value="${expense.date}">
                        </div>
                        <div class="form-group">
                            <label for="editExpenseNotes">备注</label>
                            <textarea id="editExpenseNotes">${expense.notes || ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="app.hideModal()">取消</button>
                    <button class="btn btn-primary" onclick="app.submitEditExpense('${expense.id}')">保存</button>
                </div>
            `;
            
            this.showModal(content);
        } catch (error) {
            console.error('编辑支出失败:', error);
            alert('加载编辑表单失败');
        }
    }

    // 提交编辑支出
    async submitEditExpense(expenseId) {
        const expenseData = {
            name: document.getElementById('editExpenseName').value,
            amount: parseFloat(document.getElementById('editExpenseAmount').value) || 0,
            category: document.getElementById('editExpenseCategory').value,
            date: document.getElementById('editExpenseDate').value,
            notes: document.getElementById('editExpenseNotes').value
        };
        
        if (!expenseData.name || !expenseData.amount || !expenseData.category || !expenseData.date) {
            alert('请填写所有必填字段');
                return;
            }

        try {
            await this.updateExpense(expenseId, expenseData);
            this.hideModal();
            this.loadPageData(this.getCurrentPage());
        } catch (error) {
            console.error('更新支出失败:', error);
            alert('更新失败，请重试');
        }
    }

    // 删除支出
    async deleteExpense(expenseId) {
        if (!confirm('确定要删除这个支出记录吗？此操作不可撤销。')) {
                return;
            }

        try {
            await this.removeExpense(expenseId);
            this.loadPageData(this.getCurrentPage());
        } catch (error) {
            console.error('删除支出失败:', error);
            alert('删除失败，请重试');
        }
    }

    // 编辑物品
    async editItem(itemId) {
        try {
            const item = await this.getItem(itemId);
            if (!item) {
                alert('物品不存在');
                return;
            }

            const content = `
                <div class="modal-header">
                    <h2>编辑物品</h2>
                    <button class="close-btn" onclick="app.hideModal()">×</button>
                </div>
                <div class="modal-body">
                    <form id="editItemForm">
                        <div class="form-group">
                            <label for="editItemName">物品名称</label>
                            <input type="text" id="editItemName" required value="${item.name}">
                        </div>
                        <div class="form-group">
                            <label for="editItemCategory">分类</label>
                            <select id="editItemCategory" required>
                                <option value="证件" ${item.category === '证件' ? 'selected' : ''}>证件</option>
                                <option value="电子产品" ${item.category === '电子产品' ? 'selected' : ''}>电子产品</option>
                                <option value="衣物" ${item.category === '衣物' ? 'selected' : ''}>衣物</option>
                                <option value="洗漱用品" ${item.category === '洗漱用品' ? 'selected' : ''}>洗漱用品</option>
                                <option value="药品" ${item.category === '药品' ? 'selected' : ''}>药品</option>
                                <option value="其他" ${item.category === '其他' ? 'selected' : ''}>其他</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editItemNotes">备注</label>
                            <textarea id="editItemNotes">${item.notes || ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="app.hideModal()">取消</button>
                    <button class="btn btn-primary" onclick="app.submitEditItem('${item.id}')">保存</button>
                </div>
            `;
            
            this.showModal(content);
                } catch (error) {
            console.error('编辑物品失败:', error);
            alert('加载编辑表单失败');
        }
    }

    // 提交编辑物品
    async submitEditItem(itemId) {
        const itemData = {
            name: document.getElementById('editItemName').value,
            category: document.getElementById('editItemCategory').value,
            notes: document.getElementById('editItemNotes').value
        };
        
        if (!itemData.name || !itemData.category) {
            alert('请填写所有必填字段');
            return;
        }
        
        try {
            await this.updateItem(itemId, itemData);
            this.hideModal();
            this.loadPageData(this.getCurrentPage());
        } catch (error) {
            console.error('更新物品失败:', error);
            alert('更新失败，请重试');
        }
    }

    // 删除物品
    async deleteItem(itemId) {
        if (!confirm('确定要删除这个物品吗？此操作不可撤销。')) {
                return;
            }

        try {
            await this.removeItem(itemId);
            this.loadPageData(this.getCurrentPage());
        } catch (error) {
            console.error('删除物品失败:', error);
            alert('删除失败，请重试');
        }
    }

    // 获取单个旅行计划
    async getTrip(id) {
        return await this.dbManager.getTrip(id);
    }

    // 获取单个支出记录
    async getExpense(id) {
        return await this.dbManager.getExpense(id);
    }

    // 获取单个物品
    async getItem(id) {
        return await this.dbManager.getItem(id);
    }

    // 更新旅行计划
    async updateTrip(id, updateData) {
        return await this.dbManager.updateTrip(id, updateData);
    }

    // 更新支出记录
    async updateExpense(id, updateData) {
        return await this.dbManager.updateExpense(id, updateData);
    }

    // 更新物品
    async updateItem(id, updateData) {
        return await this.dbManager.updateItem(id, updateData);
    }

    // 删除旅行计划
    async removeTrip(id) {
        return await this.dbManager.removeTrip(id);
    }

    // 删除支出记录
    async removeExpense(id) {
        return await this.dbManager.removeExpense(id);
    }

    // 删除物品
    async removeItem(id) {
        return await this.dbManager.removeItem(id);
    }

    // 清空所有数据
    async clearAllData() {
        try {
            await this.dbManager.clearTrips();
            await this.dbManager.clearExpenses();
            await this.dbManager.clearItems();
            this.log('所有数据已清空', 'success');
            this.loadAllData();
        } catch (error) {
            console.error('清空数据失败:', error);
            this.log('清空数据失败', 'error');
        }
    }

    // 处理快速操作
    handleQuickAction(action) {
        switch (action) {
            case 'add-trip':
                this.showAddModal('trips');
                break;
            case 'add-expense':
                this.showAddModal('budget');
                break;
            case 'add-item':
                this.showAddModal('checklist');
                break;
            case 'share':
                this.shareCurrentPage();
                break;
            case 'export':
                this.exportAllData();
                break;
            case 'import':
                this.importData();
                break;
            default:
                console.log('未知操作:', action);
        }
    }

    // 处理搜索
    handleSearch(query) {
        const currentPage = this.getCurrentPage();
        switch (currentPage) {
            case 'trips':
                this.searchTrips(query);
                break;
            case 'budget':
                this.searchExpenses(query);
                break;
            case 'checklist':
                this.searchItems(query);
                break;
        }
    }

    // 显示过滤器模态框
    showFilterModal() {
        const currentPage = this.getCurrentPage();
        let content = '';
        
        switch (currentPage) {
            case 'trips':
                content = this.getTripFilterContent();
                break;
            case 'budget':
                content = this.getExpenseFilterContent();
                break;
            case 'checklist':
                content = this.getItemFilterContent();
                break;
        }
        
        this.showModal('筛选', content);
    }

    // 显示添加模态框
    showAddModal(type) {
        let content = '';
        let title = '';
        
        switch (type) {
            case 'trips':
                title = '添加旅行计划';
                content = this.getAddTripForm();
                break;
            case 'budget':
                title = '添加支出记录';
                content = this.getAddExpenseForm();
                break;
            case 'checklist':
                title = '添加行李物品';
                content = this.getAddItemForm();
                break;
        }
        
        this.showModal(title, content);
    }

    // 分享当前页面
    shareCurrentPage() {
        const currentPage = this.getCurrentPage();
        const pageNames = {
            'home': '首页',
            'trips': '旅行计划',
            'budget': '预算管理',
            'checklist': '行李清单'
        };
        
        const pageName = pageNames[currentPage] || '页面';
        
        if (navigator.share) {
            navigator.share({
                title: `旅行助手 - ${pageName}`,
                text: `我正在使用旅行助手管理${pageName}`,
                url: window.location.href
            });
        } else {
            // 复制链接到剪贴板
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showToast('链接已复制到剪贴板');
            });
        }
    }

    // 显示通知
    showNotifications() {
        const notifications = [
            { title: '旅行提醒', message: '您的北京之旅还有3天开始', time: '2分钟前' },
            { title: '预算提醒', message: '本月支出已超过预算的80%', time: '1小时前' },
            { title: '打包提醒', message: '您还有5件物品未打包', time: '3小时前' }
        ];
        
        let content = '<div class="notifications-list">';
        notifications.forEach(notification => {
            content += `
                <div class="notification-item">
                    <div class="notification-header">
                        <h4>${notification.title}</h4>
                        <span class="notification-time">${notification.time}</span>
                    </div>
                    <p>${notification.message}</p>
                </div>
            `;
        });
        content += '</div>';
        
        this.showModal('通知', content);
    }

    // 提交添加旅行计划
    async submitAddTrip() {
        const tripName = document.getElementById('tripName').value.trim();
        const destination = document.getElementById('tripDestination').value.trim();
        const startDate = document.getElementById('tripStartDate').value;
        const endDate = document.getElementById('tripEndDate').value;
        const budget = document.getElementById('tripBudget').value.trim();
        const notes = document.getElementById('tripNotes').value.trim();
        
        // 表单验证
        if (!tripName || !destination || !startDate || !endDate) {
            this.showNotification('请填写所有必填字段', 'error');
            return;
        }
        
        if (new Date(startDate) >= new Date(endDate)) {
            this.showNotification('结束日期必须晚于开始日期', 'error');
            return;
        }
        
        const addBtn = document.getElementById('addTripBtn');
        if (addBtn) addBtn.disabled = true;
        
        try {
            await this.dbManager.addTrip({
                name: tripName,
                destination,
                startDate,
                endDate,
                budget: budget ? parseFloat(budget) : 0,
                notes
            });
            
            this.hideModal();
            await this.loadTrips();
            this.updateAllStats();
            this.showNotification('旅行计划创建成功！', 'success');
        } catch (error) {
            console.error('添加旅行计划失败:', error);
            this.showNotification('创建失败: ' + error.message, 'error');
        } finally {
            if (addBtn) addBtn.disabled = false;
        }
    }

    // 提交添加支出记录
    async submitAddExpense() {
        const name = document.getElementById('expenseName').value.trim();
        const amount = document.getElementById('expenseAmount').value.trim();
        const category = document.getElementById('expenseCategory').value;
        const tripId = document.getElementById('expenseTrip').value;
        const date = document.getElementById('expenseDate').value;
        const notes = document.getElementById('expenseNotes').value.trim();

        if (!name) {
            this.showNotification('请填写项目名称', 'error');
            document.getElementById('expenseName').focus();
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            this.showNotification('请填写有效金额', 'error');
            document.getElementById('expenseAmount').focus();
            return;
        }
        
        if (!category) {
            this.showNotification('请选择分类', 'error');
            document.getElementById('expenseCategory').focus();
            return;
        }
        
        if (!date) {
            this.showNotification('请选择日期', 'error');
            document.getElementById('expenseDate').focus();
            return;
        }

        const addBtn = document.getElementById('addExpenseBtn');
        if (addBtn) addBtn.disabled = true;

        try {
            await this.dbManager.addExpense({
                name,
                amount: parseFloat(amount),
                category,
                tripId: tripId || null,
                date,
                notes
            });

            this.hideModal();
            await this.loadExpenses();
            this.updateAllStats();
            this.showNotification('支出记录添加成功', 'success');
        } catch (error) {
            console.error('添加支出失败:', error);
            this.showNotification('添加支出失败: ' + error.message, 'error');
        } finally {
            if (addBtn) addBtn.disabled = false;
        }
    }

    // 提交添加物品
    async submitAddItem() {
        const name = document.getElementById('itemName').value.trim();
        const category = document.getElementById('itemCategory').value;
        const tripId = document.getElementById('itemTrip').value;
        const quantity = parseInt(document.getElementById('itemQuantity').value) || 1;
        const notes = document.getElementById('itemNotes').value.trim();

        if (!name) {
            this.showNotification('请填写物品名称', 'error');
            document.getElementById('itemName').focus();
            return;
        }

        if (!category) {
            this.showNotification('请选择物品分类', 'error');
            document.getElementById('itemCategory').focus();
            return;
        }

        const addBtn = document.getElementById('addItemBtn');
        if (addBtn) addBtn.disabled = true;

        try {
            // 如果数量大于1，创建多个物品
            for (let i = 0; i < quantity; i++) {
                await this.dbManager.addItem({
                    name: quantity > 1 ? `${name} (${i+1})` : name,
                    category,
                    tripId: tripId || null,
                    notes,
                    packed: false
                });
            }

            this.hideModal();
            await this.loadItems();
            this.updateAllStats();
            this.showNotification('物品添加成功', 'success');
        } catch (error) {
            console.error('添加物品失败:', error);
            this.showNotification('添加失败: ' + error.message, 'error');
        } finally {
            if (addBtn) addBtn.disabled = false;
        }
    }

    // 处理表单提交
    handleFormSubmit(form) {
        const formType = form.getAttribute('data-type');
        
        switch (formType) {
            case 'trip':
                this.submitAddTrip();
                break;
            case 'expense':
                this.submitAddExpense();
                break;
            case 'item':
                this.submitAddItem();
                break;
        }
    }

    // 绑定触摸事件
    bindTouchEvents() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // 检测滑动方向
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > 50) { // 最小滑动距离
                    if (deltaX > 0) {
                        // 向右滑动 - 返回上一页
                        this.handleSwipeRight();
                    } else {
                        // 向左滑动 - 前进
                        this.handleSwipeLeft();
                    }
                }
            }
        });
    }

    // 处理向右滑动
    handleSwipeRight() {
        const currentPage = this.getCurrentPage();
        if (currentPage !== 'home') {
            this.switchPage('home');
        }
    }

    // 处理向左滑动
    handleSwipeLeft() {
        // 可以添加前进功能
        console.log('向左滑动');
    }

    // 显示提示消息
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // 获取添加旅行表单
    getAddTripForm() {
        return `
            <form class="add-form" data-type="trip">
                <div class="form-group">
                    <label for="tripName">旅行名称</label>
                    <input type="text" id="tripName" required>
                </div>
                <div class="form-group">
                    <label for="tripDestination">目的地</label>
                    <input type="text" id="tripDestination" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="tripStartDate">开始日期</label>
                        <input type="date" id="tripStartDate" required>
                    </div>
                    <div class="form-group">
                        <label for="tripEndDate">结束日期</label>
                        <input type="date" id="tripEndDate" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="tripBudget">预算 (¥)</label>
                    <input type="number" id="tripBudget" min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label for="tripNotes">备注</label>
                    <textarea id="tripNotes" rows="3"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="app.hideModal()">取消</button>
                    <button type="submit" class="btn btn-primary">添加</button>
                </div>
            </form>
        `;
    }

    // 获取添加支出表单
    getAddExpenseForm() {
        return `
            <form class="add-form" data-type="expense">
                <div class="form-group">
                    <label for="expenseName">支出名称</label>
                    <input type="text" id="expenseName" required>
                </div>
                <div class="form-group">
                    <label for="expenseAmount">金额 (¥)</label>
                    <input type="number" id="expenseAmount" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="expenseCategory">类别</label>
                    <select id="expenseCategory" required>
                        <option value="">选择类别</option>
                        <option value="交通">交通</option>
                        <option value="住宿">住宿</option>
                        <option value="餐饮">餐饮</option>
                        <option value="购物">购物</option>
                        <option value="娱乐">娱乐</option>
                        <option value="其他">其他</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="expenseDate">日期</label>
                    <input type="date" id="expenseDate" required>
                </div>
                <div class="form-group">
                    <label for="expenseNotes">备注</label>
                    <textarea id="expenseNotes" rows="3"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="app.hideModal()">取消</button>
                    <button type="submit" class="btn btn-primary">添加</button>
                </div>
            </form>
        `;
    }

    // 获取添加物品表单
    getAddItemForm() {
        return `
            <form class="add-form" data-type="item">
                <div class="form-group">
                    <label for="itemName">物品名称</label>
                    <input type="text" id="itemName" required>
                </div>
                <div class="form-group">
                    <label for="itemCategory">类别</label>
                    <select id="itemCategory" required>
                        <option value="">选择类别</option>
                        <option value="衣物">衣物</option>
                        <option value="电子设备">电子设备</option>
                        <option value="洗漱用品">洗漱用品</option>
                        <option value="证件">证件</option>
                        <option value="药品">药品</option>
                        <option value="其他">其他</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="itemNotes">备注</label>
                    <textarea id="itemNotes" rows="3"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="app.hideModal()">取消</button>
                    <button type="submit" class="btn btn-primary">添加</button>
                </div>
            </form>
        `;
    }

    // 获取筛选内容
    getTripFilterContent() {
        return `
            <div class="filter-content">
                <div class="form-group">
                    <label>状态</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" value="planned" checked> 计划中</label>
                        <label><input type="checkbox" value="ongoing" checked> 进行中</label>
                        <label><input type="checkbox" value="completed" checked> 已完成</label>
                    </div>
                </div>
                <div class="form-group">
                    <label>预算范围</label>
                    <div class="range-inputs">
                        <input type="number" placeholder="最小" min="0">
                        <span>-</span>
                        <input type="number" placeholder="最大" min="0">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="app.hideModal()">重置</button>
                    <button type="button" class="btn btn-primary" onclick="app.applyFilter()">应用</button>
                </div>
            </div>
        `;
    }

    getExpenseFilterContent() {
        return `
            <div class="filter-content">
                <div class="form-group">
                    <label>类别</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" value="交通" checked> 交通</label>
                        <label><input type="checkbox" value="住宿" checked> 住宿</label>
                        <label><input type="checkbox" value="餐饮" checked> 餐饮</label>
                        <label><input type="checkbox" value="购物" checked> 购物</label>
                        <label><input type="checkbox" value="娱乐" checked> 娱乐</label>
                        <label><input type="checkbox" value="其他" checked> 其他</label>
                    </div>
                </div>
                <div class="form-group">
                    <label>金额范围</label>
                    <div class="range-inputs">
                        <input type="number" placeholder="最小" min="0">
                        <span>-</span>
                        <input type="number" placeholder="最大" min="0">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="app.hideModal()">重置</button>
                    <button type="button" class="btn btn-primary" onclick="app.applyFilter()">应用</button>
                </div>
            </div>
        `;
    }

    getItemFilterContent() {
        return `
            <div class="filter-content">
                <div class="form-group">
                    <label>类别</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" value="衣物" checked> 衣物</label>
                        <label><input type="checkbox" value="电子设备" checked> 电子设备</label>
                        <label><input type="checkbox" value="洗漱用品" checked> 洗漱用品</label>
                        <label><input type="checkbox" value="证件" checked> 证件</label>
                        <label><input type="checkbox" value="药品" checked> 药品</label>
                        <label><input type="checkbox" value="其他" checked> 其他</label>
                    </div>
                </div>
                <div class="form-group">
                    <label>状态</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" value="packed" checked> 已打包</label>
                        <label><input type="checkbox" value="unpacked" checked> 未打包</label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="app.hideModal()">重置</button>
                    <button type="button" class="btn btn-primary" onclick="app.applyFilter()">应用</button>
                </div>
            </div>
        `;
    }

    // 应用筛选
    applyFilter() {
        this.hideModal();
        this.loadPageData(this.getCurrentPage());
        this.showToast('筛选已应用');
    }

    // 获取所有旅行计划
    async getAllTrips() {
        return await this.dbManager.getAllTrips();
    }

    // 获取所有支出记录
    async getAllExpenses() {
        return await this.dbManager.getAllExpenses();
    }

    // 获取所有物品
    async getAllItems() {
        return await this.dbManager.getAllItems();
    }

    // 导出所有数据
    exportAllData() {
        Promise.all([
            this.getAllTrips(),
            this.getAllExpenses(),
            this.getAllItems()
        ]).then(([trips, expenses, items]) => {
            const data = {
                trips,
                expenses,
                items,
                exportDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `travel-assistant-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showToast('数据导出成功');
        });
    }

    // 导入数据
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        this.processImportedData(data);
        } catch (error) {
                        this.showToast('文件格式错误', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    // 处理导入的数据
    async processImportedData(data) {
        try {
            if (data.trips) {
                for (const trip of data.trips) {
                    await this.addTrip(trip);
                }
            }
            if (data.expenses) {
                for (const expense of data.expenses) {
                    await this.addExpense(expense);
                }
            }
            if (data.items) {
                for (const item of data.items) {
                    await this.addItem(item);
                }
            }
            
            this.showToast('数据导入成功');
            this.loadAllData();
                } catch (error) {
            this.showToast('数据导入失败', 'error');
        }
    }

    // 显示添加旅行模态框
    showAddTripModal() {
        const content = `
            <form class="add-form" data-type="trip" id="addTripForm">
                <div class="form-group">
                    <label for="tripName">旅行名称</label>
                    <input type="text" id="tripName" required>
                </div>
                <div class="form-group">
                    <label for="tripDestination">目的地</label>
                    <input type="text" id="tripDestination" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="tripStartDate">开始日期</label>
                        <input type="date" id="tripStartDate" required>
                    </div>
                    <div class="form-group">
                        <label for="tripEndDate">结束日期</label>
                        <input type="date" id="tripEndDate" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="tripBudget">预算 (¥)</label>
                    <input type="number" id="tripBudget" min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label for="tripNotes">备注</label>
                    <textarea id="tripNotes" rows="3"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="app.hideModal()">取消</button>
                    <button type="button" class="btn btn-primary" id="addTripBtn" onclick="app.submitAddTrip()">添加</button>
                </div>
            </form>
        `;
        this.showModal('添加旅行计划', content);
        
        // 设置默认日期
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('tripStartDate').value = today;
        
        // 计算默认结束日期（当前日期+7天）
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        document.getElementById('tripEndDate').value = nextWeek.toISOString().split('T')[0];
    }

    // 显示添加支出模态框
    showAddExpenseModal() {
        // 准备旅行计划选项
        let tripOptions = '<option value="">选择旅行计划</option>';
        this.currentTrips.forEach(trip => {
            tripOptions += `<option value="${trip.id}">${this.escapeHtml(trip.name)}</option>`;
        });
        
        const content = `
            <form class="add-form" data-type="expense" id="addExpenseForm">
                <div class="form-group">
                    <label for="expenseName">支出项目</label>
                    <input type="text" id="expenseName" required>
                </div>
                <div class="form-group">
                    <label for="expenseAmount">金额 (¥)</label>
                    <input type="number" id="expenseAmount" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="expenseCategory">分类</label>
                    <select id="expenseCategory" required>
                        <option value="">选择分类</option>
                        <option value="transportation">交通</option>
                        <option value="accommodation">住宿</option>
                        <option value="food">餐饮</option>
                        <option value="entertainment">娱乐</option>
                        <option value="shopping">购物</option>
                        <option value="other">其他</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="expenseTrip">关联旅行</label>
                    <select id="expenseTrip">
                        ${tripOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label for="expenseDate">日期</label>
                    <input type="date" id="expenseDate" required value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label for="expenseNotes">备注</label>
                    <textarea id="expenseNotes" rows="3"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="app.hideModal()">取消</button>
                    <button type="button" class="btn btn-primary" id="addExpenseBtn" onclick="app.submitAddExpense()">添加</button>
                </div>
            </form>
        `;
        
        this.showModal('添加支出记录', content);
    }

    // 显示添加物品模态框
    showAddItemModal() {
        // 准备旅行计划选项
        let tripOptions = '<option value="">选择旅行计划</option>';
        this.currentTrips.forEach(trip => {
            tripOptions += `<option value="${trip.id}">${this.escapeHtml(trip.name)}</option>`;
        });
        
        const content = `
            <form class="add-form" data-type="item" id="addItemForm">
                <div class="form-group">
                    <label for="itemName">物品名称</label>
                    <input type="text" id="itemName" required>
                </div>
                <div class="form-group">
                    <label for="itemCategory">分类</label>
                    <select id="itemCategory" required>
                        <option value="">选择分类</option>
                        <option value="documents">证件</option>
                        <option value="electronics">电子产品</option>
                        <option value="clothing">衣物</option>
                        <option value="toiletries">洗漱用品</option>
                        <option value="medicine">药品</option>
                        <option value="other">其他</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="itemTrip">关联旅行</label>
                    <select id="itemTrip">
                        ${tripOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label for="itemQuantity">数量</label>
                    <input type="number" id="itemQuantity" value="1" min="1" step="1">
                </div>
                <div class="form-group">
                    <label for="itemNotes">备注</label>
                    <textarea id="itemNotes" rows="3"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="app.hideModal()">取消</button>
                    <button type="button" class="btn btn-primary" id="addItemBtn" onclick="app.submitAddItem()">添加</button>
                </div>
            </form>
        `;
        
        this.showModal('添加行李物品', content);
    }

    // 显示快速操作菜单
    showQuickActions() {
        this.toggleQuickActions();
    }

    // 记录日志
    log(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// 启动应用
let app;
document.addEventListener('DOMContentLoaded', async () => {
    app = new TravelAssistant();
    // 等待应用初始化完成
    await app.init();
});


