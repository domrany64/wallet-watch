// ===== Firebase Config =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getDatabase, ref, push, set, update, remove, onValue, get } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDyQ6QQQ0Jb3DHT-zzYxbBJ8mJ12yxjt48",
    authDomain: "wallet-watch-247f2.firebaseapp.com",
    databaseURL: "https://wallet-watch-247f2-default-rtdb.firebaseio.com",
    projectId: "wallet-watch-247f2",
    storageBucket: "wallet-watch-247f2.firebasestorage.app",
    messagingSenderId: "647540254739",
    appId: "1:647540254739:web:feeb3a44b81d7e3597f7e6"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// ===== Auth State =====
let currentUser = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateAuthUI();
    if (user) {
        setupListeners();
    } else {
        detachListeners();
        data = { settings: {}, cards: {}, recurring: {}, transactions: {}, savingsGoals: {}, investments: {} };
        handleRoute();
    }
});

function updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    const navTabs = document.getElementById('navTabs');
    const settingsBtn = document.getElementById('settingsBtn');
    const backupBtn = document.getElementById('backupBtn');

    if (currentUser) {
        authBtn.textContent = 'Logout';
        authBtn.onclick = () => signOut(auth);
        navTabs.style.display = '';
        settingsBtn.style.display = '';
        backupBtn.style.display = '';
    } else {
        authBtn.textContent = 'Login';
        authBtn.onclick = () => showOverlay('loginOverlay');
        navTabs.style.display = 'none';
        settingsBtn.style.display = 'none';
        backupBtn.style.display = 'none';
    }
}

// ===== State =====
let data = {
    settings: {},
    cards: {},
    recurring: {},
    transactions: {},
    savingsGoals: {},
    investments: {}
};
let currentView = 'dashboard';
let selectedMonth = getCurrentMonth();
let listeners = [];

function getCurrentMonth() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ===== Constants =====
const CATEGORIES = {
    housing: { icon: '🏠', label: 'Housing' },
    utilities: { icon: '💡', label: 'Utilities' },
    groceries: { icon: '🛒', label: 'Groceries' },
    dining: { icon: '🍽️', label: 'Dining Out' },
    transport: { icon: '🚗', label: 'Transportation' },
    healthcare: { icon: '🏥', label: 'Healthcare' },
    entertainment: { icon: '🎭', label: 'Entertainment' },
    shopping: { icon: '🛍️', label: 'Shopping' },
    personal: { icon: '💇', label: 'Personal Care' },
    education: { icon: '📚', label: 'Education' },
    subscriptions: { icon: '📱', label: 'Subscriptions' },
    savings: { icon: '🏦', label: 'Savings' },
    investments: { icon: '📈', label: 'Investments' },
    insurance: { icon: '🛡️', label: 'Insurance' },
    gifts: { icon: '🎁', label: 'Gifts' },
    travel: { icon: '✈️', label: 'Travel' },
    childcare: { icon: '👶', label: 'Childcare' },
    pets: { icon: '🐾', label: 'Pets' },
    other: { icon: '📦', label: 'Other' }
};

const RECURRING_TYPES = {
    bill: { icon: '📄', label: 'Bills' },
    subscription: { icon: '📱', label: 'Subscriptions' },
    savings: { icon: '🏦', label: 'Savings' },
    investment: { icon: '📈', label: 'Investments' }
};

// ===== Firebase Listeners =====
function setupListeners() {
    detachListeners();
    const uid = currentUser.uid;
    const paths = ['settings', 'cards', 'recurring', 'transactions', 'savingsGoals', 'investments'];
    paths.forEach(path => {
        const r = ref(db, `households/${uid}/${path}`);
        const unsub = onValue(r, (snap) => {
            data[path] = snap.val() || (path === 'settings' ? {} : {});
            handleRoute();
        });
        listeners.push(unsub);
    });
}

function detachListeners() {
    listeners.forEach(unsub => unsub());
    listeners = [];
}

function dbRef(path) {
    return ref(db, `households/${currentUser.uid}/${path}`);
}

// ===== Router =====
function getRoute() {
    const hash = window.location.hash || '#/';
    const parts = hash.replace('#/', '').split('/');
    return { path: parts[0] || 'dashboard', param: parts[1] || null };
}

window.addEventListener('hashchange', handleRoute);

function handleRoute() {
    if (!currentUser) {
        renderWelcome();
        return;
    }
    const route = getRoute();
    currentView = route.path || 'dashboard';
    updateActiveTab();

    switch (currentView) {
        case 'transactions': renderTransactions(); break;
        case 'recurring': renderRecurring(); break;
        case 'cards': renderCards(); break;
        case 'savings': renderSavings(); break;
        default: renderDashboard(); break;
    }
}

function updateActiveTab() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.view === currentView);
    });
}

// ===== Helpers =====
const mainContent = document.getElementById('mainContent');

function fmt(amount) {
    const currency = data.settings.currency || '$';
    return `${currency}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

function monthLabel(monthStr) {
    const [y, m] = monthStr.split('-');
    const date = new Date(Number(y), Number(m) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

function prevMonth(monthStr) {
    const [y, m] = monthStr.split('-').map(Number);
    const d = new Date(y, m - 2);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function nextMonth(monthStr) {
    const [y, m] = monthStr.split('-').map(Number);
    const d = new Date(y, m);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function daysInMonth(monthStr) {
    const [y, m] = monthStr.split('-').map(Number);
    return new Date(y, m, 0).getDate();
}

function dayOfMonth() {
    return new Date().getDate();
}

function getSpenders() {
    if (data.settings.spenders) {
        if (typeof data.settings.spenders === 'string') return data.settings.spenders.split(',').map(s => s.trim());
        return data.settings.spenders;
    }
    return ['Person 1'];
}

function getCardName(cardId) {
    if (!cardId || !data.cards[cardId]) return '—';
    const c = data.cards[cardId];
    return `${c.name}${c.lastFour ? ' ••' + c.lastFour : ''}`;
}

function getCategoryIcon(cat) {
    return CATEGORIES[cat]?.icon || '📦';
}

function getCategoryLabel(cat) {
    return CATEGORIES[cat]?.label || cat;
}

function getMonthTransactions() {
    return Object.entries(data.transactions)
        .filter(([, t]) => t.month === selectedMonth)
        .map(([id, t]) => ({ id, ...t }));
}

function getActiveRecurringTotal() {
    return Object.values(data.recurring)
        .filter(r => r.active !== false)
        .reduce((sum, r) => sum + Number(r.amount || 0), 0);
}

function getMonthSpending() {
    return getMonthTransactions().reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

function categoryOptions() {
    return Object.entries(CATEGORIES)
        .map(([k, v]) => `<option value="${k}">${v.icon} ${v.label}</option>`)
        .join('');
}

function cardOptions(includeEmpty = true) {
    let opts = includeEmpty ? '<option value="">No card</option>' : '';
    Object.entries(data.cards).forEach(([id, c]) => {
        opts += `<option value="${id}">${escapeHtml(c.name)}${c.lastFour ? ' ••' + c.lastFour : ''}</option>`;
    });
    return opts;
}

function spenderOptions() {
    return getSpenders().map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
}

// ===== Toast =====
let toastTimer;
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== Modal Helpers =====
function showOverlay(id) {
    document.getElementById(id).classList.add('active');
}

function hideOverlay(id) {
    document.getElementById(id).classList.remove('active');
}

function showModal(title, bodyHtml) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    showOverlay('modalOverlay');
}

function hideModal() {
    hideOverlay('modalOverlay');
}

// ===== Month Navigator HTML =====
function monthNavHtml() {
    return `
        <div class="month-nav">
            <button onclick="window._prevMonth()">◀</button>
            <span class="month-label">${monthLabel(selectedMonth)}</span>
            <button onclick="window._nextMonth()">▶</button>
        </div>`;
}

window._prevMonth = () => { selectedMonth = prevMonth(selectedMonth); handleRoute(); };
window._nextMonth = () => { selectedMonth = nextMonth(selectedMonth); handleRoute(); };

// ===== RENDER: Welcome =====
function renderWelcome() {
    mainContent.innerHTML = `
        <div class="welcome">
            <h1>💰 Wallet<span>Watch</span></h1>
            <p>Track your family's spending, manage bills, and always know how much you can still spend this month.</p>
            <button class="btn btn-primary" onclick="document.getElementById('loginOverlay').classList.add('active')">Login to Get Started</button>
        </div>`;
}

// ===== RENDER: Dashboard =====
function renderDashboard() {
    const income = Number(data.settings.monthlyIncome || 0);
    const committed = getActiveRecurringTotal();
    const discretionary = income - committed;
    const spent = getMonthSpending();
    const remaining = discretionary - spent;
    const txns = getMonthTransactions().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    // Budget bar percentage
    const pct = discretionary > 0 ? Math.min((spent / discretionary) * 100, 100) : 0;
    const barClass = pct < 60 ? 'safe' : pct < 85 ? 'caution' : 'over';
    const overBudget = remaining < 0;

    // If no settings, show setup prompt
    if (!income) {
        mainContent.innerHTML = `
            ${monthNavHtml()}
            <div class="empty-state">
                <div class="emoji">⚙️</div>
                <h2>Welcome! Let's set up your budget</h2>
                <p>Click the gear icon above to set your monthly income and household members.</p>
                <button class="btn btn-primary" onclick="document.getElementById('settingsOverlay').classList.add('active')">Open Settings</button>
            </div>`;
        return;
    }

    // Per-spender breakdown
    const spenderTotals = {};
    getSpenders().forEach(s => spenderTotals[s] = 0);
    txns.forEach(t => {
        if (t.spender && spenderTotals[t.spender] !== undefined) {
            spenderTotals[t.spender] += Number(t.amount || 0);
        }
    });

    // Per-category breakdown
    const catTotals = {};
    txns.forEach(t => {
        const cat = t.category || 'other';
        catTotals[cat] = (catTotals[cat] || 0) + Number(t.amount || 0);
    });
    const catSorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const maxCat = catSorted.length > 0 ? catSorted[0][1] : 1;

    // Days progress
    const totalDays = daysInMonth(selectedMonth);
    const isCurrentMonth = selectedMonth === getCurrentMonth();
    const currentDay = isCurrentMonth ? dayOfMonth() : totalDays;
    const dayPct = (currentDay / totalDays) * 100;

    mainContent.innerHTML = `
        ${monthNavHtml()}

        <div class="summary-grid">
            <div class="summary-card">
                <div class="label">Income</div>
                <div class="value neutral">${fmt(income)}</div>
            </div>
            <div class="summary-card">
                <div class="label">Committed</div>
                <div class="value warning">${fmt(committed)}</div>
                <div class="sub">${Object.values(data.recurring).filter(r => r.active !== false).length} recurring items</div>
            </div>
            <div class="summary-card">
                <div class="label">Spent</div>
                <div class="value negative">${fmt(spent)}</div>
                <div class="sub">${txns.length} transactions</div>
            </div>
            <div class="summary-card">
                <div class="label">Remaining</div>
                <div class="value ${overBudget ? 'negative' : 'positive'}">${fmt(remaining)}</div>
                <div class="sub">${isCurrentMonth ? `Day ${currentDay} of ${totalDays}` : 'Past month'}</div>
            </div>
        </div>

        <div class="budget-bar-container">
            <div class="budget-bar-labels">
                <span>Discretionary: ${fmt(discretionary)}</span>
                <span>${overBudget ? 'OVER BUDGET' : Math.round(pct) + '% used'}</span>
            </div>
            <div class="budget-bar">
                <div class="budget-bar-fill ${barClass}" style="width: ${pct}%"></div>
                ${isCurrentMonth ? `<div class="budget-bar-marker" style="left: ${dayPct}%" title="Today (day ${currentDay})"></div>` : ''}
            </div>
        </div>

        <div class="dashboard-grid">
            <div class="card">
                <div class="card-header">
                    <span class="card-title">By Category</span>
                </div>
                <div class="category-bars">
                    ${catSorted.length === 0 ? '<div style="color:var(--text-dim);font-size:0.85rem">No spending yet</div>' :
                        catSorted.slice(0, 8).map(([cat, total]) => `
                            <div class="category-bar-row">
                                <span class="category-bar-label">${getCategoryIcon(cat)} ${getCategoryLabel(cat)}</span>
                                <div class="category-bar-track">
                                    <div class="category-bar-fill" style="width: ${(total / maxCat) * 100}%"></div>
                                </div>
                                <span class="category-bar-amount">${fmt(total)}</span>
                            </div>`).join('')}
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <span class="card-title">By Spender</span>
                </div>
                <div class="spender-list">
                    ${Object.entries(spenderTotals).map(([name, total]) => `
                        <div class="spender-row">
                            <span class="spender-name">${escapeHtml(name)}</span>
                            <span class="spender-amount">${fmt(total)}</span>
                        </div>`).join('')}
                </div>
            </div>
        </div>

        <div class="section-header">
            <h2 class="section-title">Recent Transactions</h2>
            <a href="#/transactions" class="btn btn-sm btn-secondary">View All →</a>
        </div>
        <div class="txn-list">
            ${txns.length === 0 ? '<div class="empty-state"><div class="emoji">📝</div><p>No transactions this month</p></div>' :
                txns.slice(0, 10).map(t => txnItemHtml(t)).join('')}
        </div>
    `;
}

function txnItemHtml(t) {
    return `
        <div class="txn-item">
            <div class="txn-icon">${getCategoryIcon(t.category)}</div>
            <div class="txn-details">
                <div class="txn-desc">${escapeHtml(t.description || getCategoryLabel(t.category))}</div>
                <div class="txn-meta">
                    <span>${getCategoryLabel(t.category)}</span>
                    <span>•</span>
                    <span>${escapeHtml(t.spender || '')}</span>
                    <span>•</span>
                    <span>${getCardName(t.cardId)}</span>
                    <span>•</span>
                    <span>${t.date || ''}</span>
                </div>
            </div>
            <div class="txn-amount">${fmt(t.amount)}</div>
            <div class="txn-actions">
                <button class="btn-icon" onclick="window._editTxn('${t.id}')" title="Edit">✏️</button>
                <button class="btn-icon" onclick="window._deleteTxn('${t.id}')" title="Delete">🗑️</button>
            </div>
        </div>`;
}

// ===== RENDER: Transactions =====
function renderTransactions() {
    const txns = getMonthTransactions().sort((a, b) => {
        if (a.date !== b.date) return (b.date || '').localeCompare(a.date || '');
        return (b.createdAt || 0) - (a.createdAt || 0);
    });
    const total = txns.reduce((s, t) => s + Number(t.amount || 0), 0);
    const today = new Date().toISOString().split('T')[0];

    mainContent.innerHTML = `
        ${monthNavHtml()}

        <div class="quick-add">
            <div class="quick-add-title">+ Quick Add Transaction</div>
            <form id="quickAddForm">
                <div class="quick-add-row">
                    <div class="form-group narrow">
                        <label for="qaAmount">Amount</label>
                        <input type="number" id="qaAmount" min="0.01" step="0.01" required placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label for="qaCategory">Category</label>
                        <select id="qaCategory" required>${categoryOptions()}</select>
                    </div>
                    <div class="form-group wide">
                        <label for="qaDesc">Description</label>
                        <input type="text" id="qaDesc" placeholder="What was it for?">
                    </div>
                </div>
                <div class="quick-add-row" style="margin-top: 0.75rem">
                    <div class="form-group">
                        <label for="qaCard">Card</label>
                        <select id="qaCard">${cardOptions()}</select>
                    </div>
                    <div class="form-group">
                        <label for="qaSpender">Spender</label>
                        <select id="qaSpender">${spenderOptions()}</select>
                    </div>
                    <div class="form-group">
                        <label for="qaDate">Date</label>
                        <input type="date" id="qaDate" value="${today}">
                    </div>
                    <div class="form-group" style="flex: 0 0 auto; align-self: flex-end;">
                        <button type="submit" class="btn btn-primary">Add</button>
                    </div>
                </div>
            </form>
        </div>

        <div class="section-header">
            <h2 class="section-title">Transactions (${txns.length})</h2>
        </div>

        <div class="filter-bar">
            <select id="filterCard" onchange="window._applyTxnFilter()">
                <option value="">All Cards</option>
                ${cardOptions(false)}
            </select>
            <select id="filterSpender" onchange="window._applyTxnFilter()">
                <option value="">All Spenders</option>
                ${getSpenders().map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('')}
            </select>
            <select id="filterCategory" onchange="window._applyTxnFilter()">
                <option value="">All Categories</option>
                ${categoryOptions()}
            </select>
        </div>

        <div class="txn-list" id="txnList">
            ${txns.length === 0 ? '<div class="empty-state"><div class="emoji">📝</div><p>No transactions this month. Add one above!</p></div>' :
                txns.map(t => txnItemHtml(t)).join('')}
        </div>

        ${txns.length > 0 ? `
        <div class="totals-bar">
            <span class="total-label">Total for ${monthLabel(selectedMonth)}</span>
            <span class="total-value">${fmt(total)}</span>
        </div>` : ''}
    `;

    document.getElementById('quickAddForm').addEventListener('submit', handleQuickAdd);
}

function handleQuickAdd(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('qaAmount').value);
    const date = document.getElementById('qaDate').value;
    const [y, m] = date.split('-');
    const month = `${y}-${m}`;

    const txn = {
        amount,
        category: document.getElementById('qaCategory').value,
        description: document.getElementById('qaDesc').value.trim(),
        cardId: document.getElementById('qaCard').value,
        spender: document.getElementById('qaSpender').value,
        date,
        month,
        createdAt: Date.now()
    };

    const newRef = push(dbRef('transactions'));
    set(newRef, txn).then(() => {
        showToast('Transaction added!');
        document.getElementById('quickAddForm').reset();
        document.getElementById('qaDate').value = new Date().toISOString().split('T')[0];
    });
}

// Transaction filter (client-side)
window._applyTxnFilter = () => {
    const cardF = document.getElementById('filterCard')?.value || '';
    const spenderF = document.getElementById('filterSpender')?.value || '';
    const catF = document.getElementById('filterCategory')?.value || '';

    let txns = getMonthTransactions().sort((a, b) => {
        if (a.date !== b.date) return (b.date || '').localeCompare(a.date || '');
        return (b.createdAt || 0) - (a.createdAt || 0);
    });

    if (cardF) txns = txns.filter(t => t.cardId === cardF);
    if (spenderF) txns = txns.filter(t => t.spender === spenderF);
    if (catF) txns = txns.filter(t => t.category === catF);

    const list = document.getElementById('txnList');
    if (list) {
        list.innerHTML = txns.length === 0
            ? '<div class="empty-state"><p>No matching transactions</p></div>'
            : txns.map(t => txnItemHtml(t)).join('');
    }
};

// Edit transaction
window._editTxn = (id) => {
    const t = data.transactions[id];
    if (!t) return;

    showModal('Edit Transaction', `
        <form id="editTxnForm" class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="etAmount">Amount</label>
                    <input type="number" id="etAmount" min="0.01" step="0.01" required value="${t.amount}">
                </div>
                <div class="form-group">
                    <label for="etCategory">Category</label>
                    <select id="etCategory" required>${categoryOptions()}</select>
                </div>
            </div>
            <div class="form-group">
                <label for="etDesc">Description</label>
                <input type="text" id="etDesc" value="${escapeHtml(t.description || '')}">
            </div>
            <div class="form-row-3">
                <div class="form-group">
                    <label for="etCard">Card</label>
                    <select id="etCard">${cardOptions()}</select>
                </div>
                <div class="form-group">
                    <label for="etSpender">Spender</label>
                    <select id="etSpender">${spenderOptions()}</select>
                </div>
                <div class="form-group">
                    <label for="etDate">Date</label>
                    <input type="date" id="etDate" value="${t.date || ''}">
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="window._hideModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `);

    document.getElementById('etCategory').value = t.category || 'other';
    document.getElementById('etCard').value = t.cardId || '';
    document.getElementById('etSpender').value = t.spender || '';

    document.getElementById('editTxnForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const date = document.getElementById('etDate').value;
        const [y, m] = date.split('-');
        update(dbRef(`transactions/${id}`), {
            amount: parseFloat(document.getElementById('etAmount').value),
            category: document.getElementById('etCategory').value,
            description: document.getElementById('etDesc').value.trim(),
            cardId: document.getElementById('etCard').value,
            spender: document.getElementById('etSpender').value,
            date,
            month: `${y}-${m}`
        }).then(() => {
            hideModal();
            showToast('Transaction updated');
        });
    });
};

// Delete transaction
window._deleteTxn = (id) => {
    if (!confirm('Delete this transaction?')) return;
    remove(dbRef(`transactions/${id}`)).then(() => showToast('Transaction deleted'));
};

window._hideModal = hideModal;

// ===== RENDER: Recurring =====
function renderRecurring() {
    const items = Object.entries(data.recurring).map(([id, r]) => ({ id, ...r }));
    const grouped = {};
    Object.keys(RECURRING_TYPES).forEach(t => grouped[t] = []);
    items.forEach(r => {
        const type = r.type || 'bill';
        if (!grouped[type]) grouped[type] = [];
        grouped[type].push(r);
    });

    const totalActive = items.filter(r => r.active !== false).reduce((s, r) => s + Number(r.amount || 0), 0);

    mainContent.innerHTML = `
        <div class="section-header">
            <h2 class="section-title">🔄 Recurring Commitments</h2>
            <button class="btn btn-primary btn-sm" onclick="window._addRecurring()">+ Add</button>
        </div>

        <div class="totals-bar" style="margin-bottom: 1.5rem">
            <span class="total-label">Total Monthly Commitments</span>
            <span class="total-value">${fmt(totalActive)}</span>
        </div>

        ${Object.entries(RECURRING_TYPES).map(([type, cfg]) => {
            const group = grouped[type] || [];
            if (group.length === 0) return '';
            return `
                <div class="recurring-group">
                    <div class="recurring-group-title">${cfg.icon} ${cfg.label} (${group.length})</div>
                    ${group.map(r => `
                        <div class="recurring-item ${r.active === false ? 'inactive' : ''}">
                            <div class="txn-icon">${getCategoryIcon(r.category)}</div>
                            <div class="recurring-info">
                                <div class="recurring-name">${escapeHtml(r.name)}</div>
                                <div class="recurring-meta">
                                    ${getCategoryLabel(r.category)}
                                    ${r.dueDay ? ` • Due day ${r.dueDay}` : ''}
                                    ${r.cardId ? ` • ${getCardName(r.cardId)}` : ''}
                                    ${r.active === false ? ' • <em>Inactive</em>' : ''}
                                </div>
                            </div>
                            <div class="recurring-amount">${fmt(r.amount)}</div>
                            <div class="recurring-actions">
                                <button class="btn-icon" onclick="window._editRecurring('${r.id}')" title="Edit">✏️</button>
                                <button class="btn-icon" onclick="window._deleteRecurring('${r.id}')" title="Delete">🗑️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>`;
        }).join('')}

        ${items.length === 0 ? `
            <div class="empty-state">
                <div class="emoji">🔄</div>
                <h2>No recurring items yet</h2>
                <p>Add your monthly bills, subscriptions, savings plans, and investments.</p>
            </div>` : ''}
    `;
}

function recurringFormHtml(r = {}) {
    return `
        <form id="recurringForm" class="modal-form">
            <div class="form-group">
                <label for="rName">Name</label>
                <input type="text" id="rName" required value="${escapeHtml(r.name || '')}" placeholder="e.g. Rent, Netflix, 401k">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="rAmount">Amount ($)</label>
                    <input type="number" id="rAmount" min="0.01" step="0.01" required value="${r.amount || ''}">
                </div>
                <div class="form-group">
                    <label for="rType">Type</label>
                    <select id="rType" required>
                        ${Object.entries(RECURRING_TYPES).map(([k, v]) => `<option value="${k}" ${r.type === k ? 'selected' : ''}>${v.icon} ${v.label}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="rCategory">Category</label>
                    <select id="rCategory" required>${categoryOptions()}</select>
                </div>
                <div class="form-group">
                    <label for="rDueDay">Due Day (1-31)</label>
                    <input type="number" id="rDueDay" min="1" max="31" value="${r.dueDay || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="rCard">Card</label>
                    <select id="rCard">${cardOptions()}</select>
                </div>
                <div class="form-group">
                    <label for="rActive">Status</label>
                    <select id="rActive">
                        <option value="true" ${r.active !== false ? 'selected' : ''}>Active</option>
                        <option value="false" ${r.active === false ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="rNotes">Notes</label>
                <input type="text" id="rNotes" value="${escapeHtml(r.notes || '')}">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="window._hideModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>`;
}

window._addRecurring = () => {
    showModal('Add Recurring Item', recurringFormHtml());
    document.getElementById('recurringForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const item = {
            name: document.getElementById('rName').value.trim(),
            amount: parseFloat(document.getElementById('rAmount').value),
            type: document.getElementById('rType').value,
            category: document.getElementById('rCategory').value,
            dueDay: parseInt(document.getElementById('rDueDay').value) || null,
            cardId: document.getElementById('rCard').value,
            active: document.getElementById('rActive').value === 'true',
            notes: document.getElementById('rNotes').value.trim(),
            createdAt: Date.now()
        };
        set(push(dbRef('recurring')), item).then(() => { hideModal(); showToast('Recurring item added'); });
    });
};

window._editRecurring = (id) => {
    const r = data.recurring[id];
    if (!r) return;
    showModal('Edit Recurring Item', recurringFormHtml(r));
    document.getElementById('rCategory').value = r.category || 'other';
    document.getElementById('rCard').value = r.cardId || '';

    document.getElementById('recurringForm').addEventListener('submit', (e) => {
        e.preventDefault();
        update(dbRef(`recurring/${id}`), {
            name: document.getElementById('rName').value.trim(),
            amount: parseFloat(document.getElementById('rAmount').value),
            type: document.getElementById('rType').value,
            category: document.getElementById('rCategory').value,
            dueDay: parseInt(document.getElementById('rDueDay').value) || null,
            cardId: document.getElementById('rCard').value,
            active: document.getElementById('rActive').value === 'true',
            notes: document.getElementById('rNotes').value.trim()
        }).then(() => { hideModal(); showToast('Recurring item updated'); });
    });
};

window._deleteRecurring = (id) => {
    if (!confirm('Delete this recurring item?')) return;
    remove(dbRef(`recurring/${id}`)).then(() => showToast('Recurring item deleted'));
};

// ===== RENDER: Cards =====
function renderCards() {
    const cards = Object.entries(data.cards).map(([id, c]) => ({ id, ...c }));
    const monthTxns = getMonthTransactions();

    // Per-card spending
    const cardSpending = {};
    monthTxns.forEach(t => {
        if (t.cardId) cardSpending[t.cardId] = (cardSpending[t.cardId] || 0) + Number(t.amount || 0);
    });

    mainContent.innerHTML = `
        <div class="section-header">
            <h2 class="section-title">💳 Cards</h2>
            <button class="btn btn-primary btn-sm" onclick="window._addCard()">+ Add Card</button>
        </div>

        ${monthNavHtml()}

        <div class="cards-grid">
            ${cards.length === 0 ? `
                <div class="empty-state" style="grid-column: 1/-1">
                    <div class="emoji">💳</div>
                    <h2>No cards added</h2>
                    <p>Add your debit and credit cards to track per-card spending.</p>
                </div>` :
                cards.map(c => {
                    const spent = cardSpending[c.id] || 0;
                    const isCredit = c.type === 'credit';
                    const limit = Number(c.creditLimit || 0);
                    const utilPct = isCredit && limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                    const utilClass = utilPct < 30 ? 'safe' : utilPct < 70 ? 'caution' : 'over';

                    return `
                        <div class="card-item ${c.type}">
                            <div class="card-item-actions">
                                <button class="btn-icon" onclick="window._editCard('${c.id}')" title="Edit">✏️</button>
                                <button class="btn-icon" onclick="window._deleteCard('${c.id}')" title="Delete">🗑️</button>
                            </div>
                            <div class="card-item-header">
                                <span class="card-item-name">${escapeHtml(c.name)}</span>
                                <span class="card-type-badge ${c.type}">${c.type}</span>
                            </div>
                            <div class="card-item-details">
                                <span>Holder: ${escapeHtml(c.holder || '—')}</span>
                                ${c.lastFour ? `<span>•••• ${escapeHtml(c.lastFour)}</span>` : ''}
                                ${isCredit && limit ? `<span>Limit: ${fmt(limit)}</span>` : ''}
                            </div>
                            <div class="card-spending">
                                <span class="card-spending-label">Spent this month</span>
                                <span class="card-spending-value">${fmt(spent)}</span>
                            </div>
                            ${isCredit && limit ? `
                                <div class="card-utilization">
                                    <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted)">
                                        <span>Utilization</span>
                                        <span>${Math.round(utilPct)}%</span>
                                    </div>
                                    <div class="card-utilization-bar">
                                        <div class="card-utilization-fill budget-bar-fill ${utilClass}" style="width: ${utilPct}%"></div>
                                    </div>
                                </div>` : ''}
                        </div>`;
                }).join('')}
        </div>
    `;
}

function cardFormHtml(c = {}) {
    return `
        <form id="cardForm" class="modal-form">
            <div class="form-group">
                <label for="cName">Card Name</label>
                <input type="text" id="cName" required value="${escapeHtml(c.name || '')}" placeholder="e.g. Chase Checking Debit">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="cType">Type</label>
                    <select id="cType" required>
                        <option value="debit" ${c.type === 'debit' || !c.type ? 'selected' : ''}>Debit</option>
                        <option value="credit" ${c.type === 'credit' ? 'selected' : ''}>Credit</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="cLastFour">Last 4 Digits</label>
                    <input type="text" id="cLastFour" maxlength="4" pattern="[0-9]{4}" value="${escapeHtml(c.lastFour || '')}" placeholder="1234">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="cHolder">Holder</label>
                    <select id="cHolder">${spenderOptions()}</select>
                </div>
                <div class="form-group">
                    <label for="cLimit">Credit Limit ($)</label>
                    <input type="number" id="cLimit" min="0" step="0.01" value="${c.creditLimit || ''}" placeholder="For credit cards">
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="window._hideModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>`;
}

window._addCard = () => {
    showModal('Add Card', cardFormHtml());
    document.getElementById('cardForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const card = {
            name: document.getElementById('cName').value.trim(),
            type: document.getElementById('cType').value,
            lastFour: document.getElementById('cLastFour').value.trim(),
            holder: document.getElementById('cHolder').value,
            creditLimit: parseFloat(document.getElementById('cLimit').value) || null,
            active: true,
            createdAt: Date.now()
        };
        set(push(dbRef('cards')), card).then(() => { hideModal(); showToast('Card added'); });
    });
};

window._editCard = (id) => {
    const c = data.cards[id];
    if (!c) return;
    showModal('Edit Card', cardFormHtml(c));
    document.getElementById('cHolder').value = c.holder || '';

    document.getElementById('cardForm').addEventListener('submit', (e) => {
        e.preventDefault();
        update(dbRef(`cards/${id}`), {
            name: document.getElementById('cName').value.trim(),
            type: document.getElementById('cType').value,
            lastFour: document.getElementById('cLastFour').value.trim(),
            holder: document.getElementById('cHolder').value,
            creditLimit: parseFloat(document.getElementById('cLimit').value) || null
        }).then(() => { hideModal(); showToast('Card updated'); });
    });
};

window._deleteCard = (id) => {
    if (!confirm('Delete this card? Transactions linked to it will keep their data.')) return;
    remove(dbRef(`cards/${id}`)).then(() => showToast('Card deleted'));
};

// ===== RENDER: Savings =====
function renderSavings() {
    const goals = Object.entries(data.savingsGoals || {}).map(([id, g]) => ({ id, ...g }));
    const investments = Object.entries(data.investments || {}).map(([id, inv]) => ({ id, ...inv }));

    const totalSaved = goals.reduce((s, g) => s + Number(g.currentAmount || 0), 0);
    const totalTarget = goals.reduce((s, g) => s + Number(g.targetAmount || 0), 0);
    const totalInvested = investments.reduce((s, inv) => s + Number(inv.shares || 0) * Number(inv.avgCost || 0), 0);
    const totalCurrentValue = investments.reduce((s, inv) => s + Number(inv.shares || 0) * Number(inv.currentValue || inv.avgCost || 0), 0);

    mainContent.innerHTML = `
        <div class="section-header">
            <h2 class="section-title">🎯 Savings & Investments</h2>
        </div>

        <div class="summary-grid" style="margin-bottom: 2rem">
            <div class="summary-card">
                <div class="label">Total Saved</div>
                <div class="value positive">${fmt(totalSaved)}</div>
                <div class="sub">of ${fmt(totalTarget)} target</div>
            </div>
            <div class="summary-card">
                <div class="label">Total Invested</div>
                <div class="value neutral">${fmt(totalInvested)}</div>
                <div class="sub">cost basis</div>
            </div>
            <div class="summary-card">
                <div class="label">Current Value</div>
                <div class="value ${totalCurrentValue >= totalInvested ? 'positive' : 'negative'}">${fmt(totalCurrentValue)}</div>
                <div class="sub">${totalInvested > 0 ? (totalCurrentValue >= totalInvested ? '+' : '') + fmt(totalCurrentValue - totalInvested) + ' gain/loss' : ''}</div>
            </div>
        </div>

        <!-- Savings Goals -->
        <div class="section-header">
            <h2 class="section-title">Savings Goals</h2>
            <button class="btn btn-primary btn-sm" onclick="window._addGoal()">+ Add Goal</button>
        </div>

        <div class="savings-grid">
            ${goals.length === 0 ? `
                <div class="empty-state" style="grid-column: 1/-1">
                    <div class="emoji">🎯</div>
                    <p>No savings goals yet. Add one to start tracking!</p>
                </div>` :
                goals.map(g => {
                    const pct = Number(g.targetAmount) > 0 ? Math.min((Number(g.currentAmount) / Number(g.targetAmount)) * 100, 100) : 0;
                    return `
                        <div class="savings-item">
                            <div class="savings-item-header">
                                <span class="savings-item-name">${escapeHtml(g.name)}</span>
                                <div class="savings-item-actions">
                                    <button class="btn-icon" onclick="window._editGoal('${g.id}')" title="Edit">✏️</button>
                                    <button class="btn-icon" onclick="window._deleteGoal('${g.id}')" title="Delete">🗑️</button>
                                </div>
                            </div>
                            <div class="savings-progress">
                                <div class="savings-progress-bar">
                                    <div class="savings-progress-fill" style="width: ${pct}%"></div>
                                </div>
                                <div class="savings-progress-text">
                                    <span>${fmt(g.currentAmount)} saved</span>
                                    <span>${Math.round(pct)}%</span>
                                </div>
                            </div>
                            <div class="savings-item-details">
                                Target: ${fmt(g.targetAmount)}
                                ${g.monthlyContribution ? ` • ${fmt(g.monthlyContribution)}/mo` : ''}
                                ${g.deadline ? ` • By ${g.deadline}` : ''}
                                ${g.notes ? `<br>${escapeHtml(g.notes)}` : ''}
                            </div>
                        </div>`;
                }).join('')}
        </div>

        <!-- Investments -->
        <div class="section-header" style="margin-top: 2rem">
            <h2 class="section-title">Investments</h2>
            <button class="btn btn-primary btn-sm" onclick="window._addInvestment()">+ Add</button>
        </div>

        ${investments.length === 0 ? `
            <div class="empty-state">
                <div class="emoji">📈</div>
                <p>No investments tracked yet.</p>
            </div>` : `
            <div class="card" style="overflow-x: auto">
                <table class="invest-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Ticker</th>
                            <th>Shares</th>
                            <th>Avg Cost</th>
                            <th>Current</th>
                            <th>Value</th>
                            <th>Gain/Loss</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${investments.map(inv => {
                            const cost = Number(inv.shares || 0) * Number(inv.avgCost || 0);
                            const current = Number(inv.shares || 0) * Number(inv.currentValue || inv.avgCost || 0);
                            const gl = current - cost;
                            return `
                                <tr>
                                    <td>${escapeHtml(inv.name)}</td>
                                    <td><strong>${escapeHtml(inv.ticker || '')}</strong></td>
                                    <td>${inv.shares}</td>
                                    <td>${fmt(inv.avgCost)}</td>
                                    <td>${fmt(inv.currentValue || inv.avgCost)}</td>
                                    <td>${fmt(current)}</td>
                                    <td class="${gl >= 0 ? 'gain' : 'loss'}">${gl >= 0 ? '+' : ''}${fmt(gl)}</td>
                                    <td>
                                        <button class="btn-icon" onclick="window._editInvestment('${inv.id}')">✏️</button>
                                        <button class="btn-icon" onclick="window._deleteInvestment('${inv.id}')">🗑️</button>
                                    </td>
                                </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>`}
    `;
}

// Savings Goal CRUD
function goalFormHtml(g = {}) {
    return `
        <form id="goalForm" class="modal-form">
            <div class="form-group">
                <label for="gName">Goal Name</label>
                <input type="text" id="gName" required value="${escapeHtml(g.name || '')}" placeholder="e.g. Emergency Fund">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="gTarget">Target Amount ($)</label>
                    <input type="number" id="gTarget" min="0" step="0.01" required value="${g.targetAmount || ''}">
                </div>
                <div class="form-group">
                    <label for="gCurrent">Current Amount ($)</label>
                    <input type="number" id="gCurrent" min="0" step="0.01" required value="${g.currentAmount || '0'}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="gMonthly">Monthly Contribution ($)</label>
                    <input type="number" id="gMonthly" min="0" step="0.01" value="${g.monthlyContribution || ''}">
                </div>
                <div class="form-group">
                    <label for="gDeadline">Deadline</label>
                    <input type="date" id="gDeadline" value="${g.deadline || ''}">
                </div>
            </div>
            <div class="form-group">
                <label for="gNotes">Notes</label>
                <input type="text" id="gNotes" value="${escapeHtml(g.notes || '')}">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="window._hideModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>`;
}

window._addGoal = () => {
    showModal('Add Savings Goal', goalFormHtml());
    document.getElementById('goalForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const goal = {
            name: document.getElementById('gName').value.trim(),
            targetAmount: parseFloat(document.getElementById('gTarget').value),
            currentAmount: parseFloat(document.getElementById('gCurrent').value) || 0,
            monthlyContribution: parseFloat(document.getElementById('gMonthly').value) || 0,
            deadline: document.getElementById('gDeadline').value || null,
            notes: document.getElementById('gNotes').value.trim(),
            createdAt: Date.now()
        };
        set(push(dbRef('savingsGoals')), goal).then(() => { hideModal(); showToast('Goal added'); });
    });
};

window._editGoal = (id) => {
    const g = data.savingsGoals[id];
    if (!g) return;
    showModal('Edit Savings Goal', goalFormHtml(g));
    document.getElementById('goalForm').addEventListener('submit', (e) => {
        e.preventDefault();
        update(dbRef(`savingsGoals/${id}`), {
            name: document.getElementById('gName').value.trim(),
            targetAmount: parseFloat(document.getElementById('gTarget').value),
            currentAmount: parseFloat(document.getElementById('gCurrent').value) || 0,
            monthlyContribution: parseFloat(document.getElementById('gMonthly').value) || 0,
            deadline: document.getElementById('gDeadline').value || null,
            notes: document.getElementById('gNotes').value.trim()
        }).then(() => { hideModal(); showToast('Goal updated'); });
    });
};

window._deleteGoal = (id) => {
    if (!confirm('Delete this savings goal?')) return;
    remove(dbRef(`savingsGoals/${id}`)).then(() => showToast('Goal deleted'));
};

// Investment CRUD
function investFormHtml(inv = {}) {
    return `
        <form id="investForm" class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="iName">Name</label>
                    <input type="text" id="iName" required value="${escapeHtml(inv.name || '')}" placeholder="e.g. Apple Inc.">
                </div>
                <div class="form-group">
                    <label for="iTicker">Ticker</label>
                    <input type="text" id="iTicker" value="${escapeHtml(inv.ticker || '')}" placeholder="e.g. AAPL">
                </div>
            </div>
            <div class="form-row-3">
                <div class="form-group">
                    <label for="iShares">Shares</label>
                    <input type="number" id="iShares" min="0" step="0.001" required value="${inv.shares || ''}">
                </div>
                <div class="form-group">
                    <label for="iAvgCost">Avg Cost ($)</label>
                    <input type="number" id="iAvgCost" min="0" step="0.01" required value="${inv.avgCost || ''}">
                </div>
                <div class="form-group">
                    <label for="iCurrent">Current Price ($)</label>
                    <input type="number" id="iCurrent" min="0" step="0.01" value="${inv.currentValue || ''}">
                </div>
            </div>
            <div class="form-group">
                <label for="iNotes">Notes</label>
                <input type="text" id="iNotes" value="${escapeHtml(inv.notes || '')}">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="window._hideModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>`;
}

window._addInvestment = () => {
    showModal('Add Investment', investFormHtml());
    document.getElementById('investForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const inv = {
            name: document.getElementById('iName').value.trim(),
            ticker: document.getElementById('iTicker').value.trim().toUpperCase(),
            shares: parseFloat(document.getElementById('iShares').value),
            avgCost: parseFloat(document.getElementById('iAvgCost').value),
            currentValue: parseFloat(document.getElementById('iCurrent').value) || null,
            notes: document.getElementById('iNotes').value.trim(),
            updatedAt: Date.now(),
            createdAt: Date.now()
        };
        set(push(dbRef('investments')), inv).then(() => { hideModal(); showToast('Investment added'); });
    });
};

window._editInvestment = (id) => {
    const inv = data.investments[id];
    if (!inv) return;
    showModal('Edit Investment', investFormHtml(inv));
    document.getElementById('investForm').addEventListener('submit', (e) => {
        e.preventDefault();
        update(dbRef(`investments/${id}`), {
            name: document.getElementById('iName').value.trim(),
            ticker: document.getElementById('iTicker').value.trim().toUpperCase(),
            shares: parseFloat(document.getElementById('iShares').value),
            avgCost: parseFloat(document.getElementById('iAvgCost').value),
            currentValue: parseFloat(document.getElementById('iCurrent').value) || null,
            notes: document.getElementById('iNotes').value.trim(),
            updatedAt: Date.now()
        }).then(() => { hideModal(); showToast('Investment updated'); });
    });
};

window._deleteInvestment = (id) => {
    if (!confirm('Delete this investment?')) return;
    remove(dbRef(`investments/${id}`)).then(() => showToast('Investment deleted'));
};

// ===== Settings =====
document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('settingsIncome').value = data.settings.monthlyIncome || '';
    document.getElementById('settingsCurrency').value = data.settings.currency || '$';
    const spenders = data.settings.spenders;
    document.getElementById('settingsSpenders').value = Array.isArray(spenders) ? spenders.join(', ') : (spenders || '');
    showOverlay('settingsOverlay');
});

document.getElementById('settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const spendersRaw = document.getElementById('settingsSpenders').value;
    const spenders = spendersRaw.split(',').map(s => s.trim()).filter(Boolean);
    set(dbRef('settings'), {
        monthlyIncome: parseFloat(document.getElementById('settingsIncome').value) || 0,
        currency: document.getElementById('settingsCurrency').value.trim() || '$',
        spenders
    }).then(() => {
        hideOverlay('settingsOverlay');
        showToast('Settings saved');
    });
});

document.getElementById('settingsClose').addEventListener('click', () => hideOverlay('settingsOverlay'));

// ===== Backup & Restore (Encrypted) =====
document.getElementById('backupBtn').addEventListener('click', () => {
    document.getElementById('backupError').textContent = '';
    document.getElementById('backupSuccess').textContent = '';
    showOverlay('backupOverlay');
});

document.getElementById('backupClose').addEventListener('click', () => hideOverlay('backupOverlay'));

async function deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

document.getElementById('doBackupBtn').addEventListener('click', async () => {
    const password = document.getElementById('backupPassword').value;
    const errorEl = document.getElementById('backupError');
    const successEl = document.getElementById('backupSuccess');
    errorEl.textContent = '';
    successEl.textContent = '';

    if (!password || password.length < 4) {
        errorEl.textContent = 'Password must be at least 4 characters';
        return;
    }

    try {
        // Get all data
        const snap = await get(ref(db, `households/${currentUser.uid}`));
        const json = JSON.stringify(snap.val() || {});
        const enc = new TextEncoder();
        const plaintext = enc.encode(json);

        // Encrypt
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await deriveKey(password, salt);
        const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);

        // Combine: salt (16) + iv (12) + ciphertext
        const blob = new Blob([salt, iv, new Uint8Array(ciphertext)]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const date = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `walletwatch_backup_${date}.enc`;
        a.click();
        URL.revokeObjectURL(url);
        successEl.textContent = 'Backup downloaded!';
    } catch (err) {
        errorEl.textContent = 'Backup failed: ' + err.message;
    }
});

document.getElementById('restoreFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const password = document.getElementById('backupPassword').value;
    const errorEl = document.getElementById('backupError');
    const successEl = document.getElementById('backupSuccess');
    errorEl.textContent = '';
    successEl.textContent = '';

    if (!password) {
        errorEl.textContent = 'Enter the password used to create this backup';
        return;
    }

    try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        // Check if it's a plain JSON file (legacy support)
        try {
            const text = new TextDecoder().decode(bytes);
            const parsed = JSON.parse(text);
            if (typeof parsed === 'object') {
                if (!confirm('This appears to be an unencrypted backup. Restore it?')) return;
                await set(ref(db, `households/${currentUser.uid}`), parsed);
                successEl.textContent = 'Restored from unencrypted backup!';
                e.target.value = '';
                return;
            }
        } catch (_) { /* Not plain JSON, proceed with decryption */ }

        // Decrypt: salt (16) + iv (12) + ciphertext
        const salt = bytes.slice(0, 16);
        const iv = bytes.slice(16, 28);
        const ciphertext = bytes.slice(28);

        const key = await deriveKey(password, salt);
        const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
        const json = new TextDecoder().decode(plaintext);
        const restored = JSON.parse(json);

        if (!confirm('This will replace ALL your current data. Continue?')) return;
        await set(ref(db, `households/${currentUser.uid}`), restored);
        successEl.textContent = 'Data restored successfully!';
    } catch (err) {
        errorEl.textContent = 'Restore failed — wrong password or corrupted file';
    }
    e.target.value = '';
});

// ===== Login =====
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    errorEl.textContent = '';

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            hideOverlay('loginOverlay');
            showToast('Logged in!');
        })
        .catch(() => {
            errorEl.textContent = 'Invalid email or password';
        });
});

document.getElementById('loginClose').addEventListener('click', () => hideOverlay('loginOverlay'));

// Close modals on overlay click
['loginOverlay', 'modalOverlay', 'settingsOverlay', 'backupOverlay'].forEach(id => {
    document.getElementById(id).addEventListener('click', (e) => {
        if (e.target === e.currentTarget) hideOverlay(id);
    });
});

document.getElementById('modalClose').addEventListener('click', hideModal);

// ===== Init =====
handleRoute();
