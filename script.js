// 旅行助手应用主类
class TravelAssistant {
    constructor() {
        this.dbManager = new TravelDatabaseManager();
        this.currentTrips = [];
        this.currentExpenses = [];
        this.currentItems = [];
        this.init();
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

    bindEvents() {
        // 标签页切换 - 添加动画效果
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
                this.addRippleEffect(e.target);
            });
        });

        // 旅行计划相关事件
        document.getElementById('addTripBtn').addEventListener('click', (e) => {
            this.addRippleEffect(e.target);
            this.addTrip();
        });
        document.getElementById('clearTripsBtn').addEventListener('click', (e) => {
            this.addRippleEffect(e.target);
            this.clearTrips();
        });
        document.getElementById('exportTripsBtn').addEventListener('click', (e) => {
            this.addRippleEffect(e.target);
            this.exportTrips();
        });
        document.getElementById('importTripsBtn').addEventListener('click', (e) => {
            this.addRippleEffect(e.target);
            this.importTrips();
        });
        document.getElementById('searchTripsInput').addEventListener('input', (e) => this.searchTrips(e.target.value));

        // 预算管理相关事件
        document.getElementById('addExpenseBtn').addEventListener('click', (e) => {
            this.addRippleEffect(e.target);
            this.addExpense();
        });
        document.getElementById('clearExpensesBtn').addEventListener('click', (e) => {
            this.addRippleEffect(e.target);
            this.clearExpenses();
        });
        document.getElementById('exportExpensesBtn').addEventListener('click', (e) => {
            this.addRippleEffect(e.target);
            this.exportExpenses();
        });
        document.getElementById('importExpensesBtn').addEventListener('click', (e) => {
            this.addRippleEffect(e.target);
            this.importExpenses();
        });
        document.getElementById('searchExpensesInput').addEventListener('input', (e) => this.searchExpenses(e.target.value));

        // 行李清单相关事件
        document.getElementById('addItemBtn').addEventListener('click', (e) => {
            this.addRippleEffect(e.target);
            this.addItem();
        });
        document.getElementById('clearItemsBtn').addEventListener('click', (e) => {
            this.addRippleEffect(e.target);
            this.clearItems();
        });
        document.getElementById('exportItemsBtn').addEventListener('click', (e) => {
            this.addRippleEffect(e.target);
            this.exportItems();
        });
        document.getElementById('importItemsBtn').addEventListener('click', (e) => {
            this.addRippleEffect(e.target);
            this.importItems();
        });
        document.getElementById('searchItemsInput').addEventListener('input', (e) => this.searchItems(e.target.value));

        // 表单回车提交
        document.getElementById('tripName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTrip();
        });
        document.getElementById('expenseName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addExpense();
        });
        document.getElementById('itemName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addItem();
        });

        // 添加表单验证和实时反馈
        this.setupFormValidation();
        
        // 添加键盘快捷键
        this.setupKeyboardShortcuts();
        
        // 添加触摸手势支持
        this.setupTouchGestures();
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
        this.updateTripStats();
        this.updateExpenseStats();
        this.updateItemStats();
        this.updateOverallStats();
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
        const tbody = document.getElementById('tripsTableBody');
        tbody.innerHTML = '';

        if (trips.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #64748b;">暂无旅行计划</td></tr>';
            return;
        }

        trips.forEach(trip => {
            const row = document.createElement('tr');
            const status = this.getTripStatus(trip);
            row.innerHTML = `
                <td>${trip.id}</td>
                <td>${this.escapeHtml(trip.name)}</td>
                <td>${this.escapeHtml(trip.destination)}</td>
                <td>${new Date(trip.startDate).toLocaleDateString()}</td>
                <td>${new Date(trip.endDate).toLocaleDateString()}</td>
                <td>¥${trip.budget.toLocaleString()}</td>
                <td><span class="status-badge status-${status}">${this.getStatusText(status)}</span></td>
                <td>
                    <button class="action-btn edit-btn" onclick="app.editTrip(${trip.id})">编辑</button>
                    <button class="action-btn delete-btn" onclick="app.deleteTrip(${trip.id})">删除</button>
                </td>
            `;
            tbody.appendChild(row);
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
        const tbody = document.getElementById('expensesTableBody');
        tbody.innerHTML = '';

        if (expenses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #64748b;">暂无支出记录</td></tr>';
            return;
        }

        expenses.forEach(expense => {
            const row = document.createElement('tr');
            const trip = this.currentTrips.find(t => t.id === expense.tripId);
            row.innerHTML = `
                <td>${expense.id}</td>
                <td>${this.escapeHtml(expense.name)}</td>
                <td>¥${expense.amount.toLocaleString()}</td>
                <td>${this.getCategoryText(expense.category)}</td>
                <td>${trip ? this.escapeHtml(trip.name) : '-'}</td>
                <td>${new Date(expense.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="app.editExpense(${expense.id})">编辑</button>
                    <button class="action-btn delete-btn" onclick="app.deleteExpense(${expense.id})">删除</button>
                </td>
            `;
            tbody.appendChild(row);
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
                isPacked: false
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
        const tbody = document.getElementById('itemsTableBody');
        tbody.innerHTML = '';

        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b;">暂无行李物品</td></tr>';
            return;
        }

        items.forEach(item => {
            const row = document.createElement('tr');
            const trip = this.currentTrips.find(t => t.id === item.tripId);
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${this.escapeHtml(item.name)}</td>
                <td>${this.getItemCategoryText(item.category)}</td>
                <td>${trip ? this.escapeHtml(trip.name) : '-'}</td>
                <td><span class="status-badge status-${item.isPacked ? 'packed' : 'unpacked'}">${item.isPacked ? '已打包' : '待打包'}</span></td>
                <td>
                    <button class="action-btn toggle-btn" onclick="app.toggleItemPacked('${item.id}', this.checked)">${item.isPacked ? '取消打包' : '标记打包'}</button>
                    <button class="action-btn edit-btn" onclick="app.editItem('${item.id}')">编辑</button>
                    <button class="action-btn delete-btn" onclick="app.deleteItem('${item.id}')">删除</button>
                </td>
            `;
            tbody.appendChild(row);
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
            const item = this.currentItems.find(i => i.id === id);
            if (item) {
                await this.dbManager.updateItem(id, { isPacked: !item.isPacked });
                await this.loadItems();
                this.updateAllStats();
            }
        } catch (error) {
            console.error('更新物品状态失败:', error);
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
        const packedItems = this.currentItems.filter(item => item.isPacked).length;
        const remainingItems = totalItems - packedItems;

        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('packedItems').textContent = packedItems;
        document.getElementById('remainingItems').textContent = remainingItems;
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
        const packedItems = this.currentItems.filter(item => item.isPacked).length;
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
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-card);
            border: 1px solid var(--border-light);
            border-radius: var(--radius-lg);
            padding: var(--space-4);
            box-shadow: var(--shadow-xl);
            z-index: var(--z-toast);
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
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
        document.getElementById('currentTime').textContent = timeString;
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
}

// 启动应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TravelAssistant();
});

