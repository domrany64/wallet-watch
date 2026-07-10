// ===== Firebase Config =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getDatabase, ref, push, set, update, remove, onValue, get } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { CATEGORY_MAPPINGS_GROUPED, DEFAULT_CATEGORY_MAPPINGS } from "./categories.js";

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
let txnFilters = { card: '', spender: '', category: '', type: '', sort: 'amount-desc' };
let dateRangeMode = false;
let dateRangeFrom = '';
let dateRangeTo = '';

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
    camping: { icon: '🔥', label: 'Camping' },
    childcare: { icon: '👶', label: 'Childcare' },
    pets: { icon: '🐾', label: 'Pets' },
    donation: { icon: '🤲', label: 'Donation' },
    other: { icon: '📦', label: 'Other' }
};

// Category mappings imported from js/categories.js

function matchDescriptionCategory(description) {
    if (!description) return null;
    const upper = description.toUpperCase().trim();

    // Check user custom mappings first (from Firebase)
    const userMappings = data.settings?.categoryMappings || {};
    for (const [pattern, category] of Object.entries(userMappings)) {
        if (upper.includes(pattern.toUpperCase())) return category;
    }

    // Check built-in defaults
    for (const [pattern, category] of Object.entries(DEFAULT_CATEGORY_MAPPINGS)) {
        if (upper.includes(pattern.toUpperCase())) return category;
    }

    return null;
}

const RECURRING_TYPES = {
    income: { icon: '💰', label: 'Income' },
    bill: { icon: '📄', label: 'Bills' },
    subscription: { icon: '📱', label: 'Subscriptions' },
    savings: { icon: '🏦', label: 'Savings' },
    investment: { icon: '📈', label: 'Investments' }
};

const ACCOUNT_TYPES = {
    debit: { label: 'Debit / Checking', color: 'var(--primary)' },
    credit: { label: 'Credit Card', color: 'var(--info)' },
    savings: { label: 'Savings', color: '#8b5cf6' },
    investment: { label: 'Investment', color: '#f59e0b' },
    loan: { label: 'Loan / Mortgage', color: '#ef4444' },
    other: { label: 'Other', color: 'var(--text-muted)' }
};

const INSTITUTIONS = {
    keybank: { icon: '🔑', label: 'Key Bank' },
    usbank: { icon: '🏦', label: 'US Bank' },
    onpoint: { icon: '📍', label: 'OnPoint' },
    upgrade: { icon: '⬆️', label: 'Upgrade' },
    chase: { icon: '🏛️', label: 'Chase' },
    citi: { icon: '🌐', label: 'Citi' },
    amex: { icon: '💎', label: 'Amex' },
    gap: { icon: '👔', label: 'Gap' },
    nordstrom: { icon: '🛍️', label: 'Nordstrom' },
    etrade: { icon: '📊', label: 'E*Trade' },
    fidelity: { icon: '🏢', label: 'Fidelity' },
    embark: { icon: '🎓', label: 'Embark Oregon' },
    intel: { icon: '💻', label: 'Intel (MyPaymentVault)' },
    paypal: { icon: '🅿️', label: 'PayPal' },
    mrcooper: { icon: '🏠', label: 'Mr. Cooper' },
    nelnet: { icon: '🎓', label: 'Nelnet' },
    bofa: { icon: '🏦', label: 'Bank of America' },
    wellsfargo: { icon: '🐴', label: 'Wells Fargo' },
    capitalone: { icon: '🏦', label: 'Capital One' },
    discover: { icon: '🟠', label: 'Discover' },
    other: { icon: '🏦', label: 'Other' }
};

const PRESET_ACCOUNTS = [
    { name: 'Key Bank Checking', institution: 'keybank', type: 'debit' },
    { name: 'US Bank Checking', institution: 'usbank', type: 'debit' },
    { name: 'OnPoint Checking', institution: 'onpoint', type: 'debit' },
    { name: 'Chase Credit Card', institution: 'chase', type: 'credit' },
    { name: 'Citi Credit Card', institution: 'citi', type: 'credit' },
    { name: 'Amex Credit Card', institution: 'amex', type: 'credit' },
    { name: 'Gap Credit Card', institution: 'gap', type: 'credit' },
    { name: 'Nordstrom Credit Card', institution: 'nordstrom', type: 'credit' },
    { name: 'Intel Recognition', institution: 'intel', type: 'other' },
];

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
    const inst = INSTITUTIONS[c.institution];
    const icon = inst ? inst.icon + ' ' : '';
    return `${icon}${c.name}${c.lastFour ? ' ••' + c.lastFour : ''}`;
}

function getInstitutionIcon(instKey) {
    return INSTITUTIONS[instKey]?.icon || '🏦';
}

function accountTypeOptions(selected) {
    return Object.entries(ACCOUNT_TYPES)
        .map(([k, v]) => `<option value="${k}" ${selected === k ? 'selected' : ''}>${v.label}</option>`)
        .join('');
}

function institutionOptions(selected) {
    return '<option value="">— select —</option>' + Object.entries(INSTITUTIONS)
        .map(([k, v]) => `<option value="${k}" ${selected === k ? 'selected' : ''}>${v.icon} ${v.label}</option>`)
        .join('');
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

// Check if recurring item applies to a given month (YYYY-MM)
function isRecurringActiveForMonth(r, month) {
    if (r.active === false) return false;
    if (r.startDate && month < r.startDate) return false;
    if (r.endDate && month > r.endDate) return false;
    return true;
}

function getActiveRecurringTotal() {
    return Object.values(data.recurring)
        .filter(r => isRecurringActiveForMonth(r, selectedMonth) && r.type !== 'income')
        .reduce((sum, r) => sum + Number(r.amount || 0), 0);
}

function getMonthSpending() {
    const txns = getMonthTransactions();
    const expenses = txns.filter(t => t.txnType === 'expense' || (!t.txnType && t.txnType !== 'income' && t.txnType !== 'refund'))
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const refunds = txns.filter(t => t.txnType === 'refund')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    return expenses - refunds;
}

function getMonthIncome() {
    return getMonthTransactions()
        .filter(t => t.txnType === 'income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
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

window._viewCategory = (cat) => {
    txnFilters.category = cat;
    txnFilters.type = 'expense';
    window.location.hash = '#/transactions';
};

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
            ${selectedMonth !== getCurrentMonth() ? `<button class="month-today-btn" onclick="window._goToday()">Today</button>` : ''}
        </div>`;
}

window._prevMonth = () => { selectedMonth = prevMonth(selectedMonth); handleRoute(); };
window._nextMonth = () => { selectedMonth = nextMonth(selectedMonth); handleRoute(); };
window._goToday = () => { selectedMonth = getCurrentMonth(); handleRoute(); };
window._toggleRecurringDetail = () => {
    const el = document.getElementById('recurringDetail');
    if (el) el.style.display = el.style.display === 'none' ? '' : 'none';
};
window._toggleIncomeDetail = () => {
    const el = document.getElementById('incomeDetail');
    if (el) el.style.display = el.style.display === 'none' ? '' : 'none';
};

// ===== RENDER: Welcome =====
function renderWelcome() {
    mainContent.innerHTML = `
        <div class="welcome">
            <h1>💰 Wallet<span>Watch</span></h1>
            <p>Track your family's spending, manage bills, and always know how much you can still spend this month.</p>
            <button class="btn btn-primary" onclick="document.getElementById('loginOverlay').classList.add('active')">Login to Get Started</button>
        </div>`;
}

// ===== Recurring Status Helpers =====

// Shared matching: finds a matching transaction and removes it from the pool so it can't match twice
function findMatchingTxn(rName, rAmount, txnPool) {
    const rWords = rName.toUpperCase().replace(/\s+/g, ' ').trim().split(/\s+/).filter(w => w.length > 2);
    const isRoundNumber = rAmount === Math.round(rAmount) && rAmount % 50 === 0;

    for (let i = 0; i < txnPool.length; i++) {
        const t = txnPool[i];
        const tDesc = (t.description || '').toUpperCase();
        const tAmount = Number(t.amount || 0);
        const amountClose = rAmount > 0 && Math.abs(tAmount - rAmount) / rAmount < 0.2;
        const amountExact = rAmount > 0 && Math.abs(tAmount - rAmount) < 0.01;
        const descMatch = rWords.some(w => tDesc.includes(w));

        if ((amountClose && descMatch) || (amountExact && !isRoundNumber)) {
            txnPool.splice(i, 1); // consume this transaction
            return true;
        }
    }
    return false;
}

function getRecurringStatus() {
    const recurringItems = Object.values(data.recurring).filter(r => isRecurringActiveForMonth(r, selectedMonth) && r.type !== 'income');
    const txnPool = [...getMonthTransactions().filter(t => t.txnType !== 'income')];
    const isCurrentMonth = selectedMonth === getCurrentMonth();
    const isFutureMonth = selectedMonth > getCurrentMonth();
    const isPastMonth = selectedMonth < getCurrentMonth();
    const today = dayOfMonth();

    let paidCount = 0, paidTotal = 0, lateCount = 0, lateTotal = 0, unpaidTotal = 0;
    const items = [];

    recurringItems.forEach(r => {
        const rAmount = Number(r.amount || 0);
        const found = findMatchingTxn(r.name || '', rAmount, txnPool);

        let status;
        if (found) {
            status = 'paid';
            paidCount++;
            paidTotal += rAmount;
        } else if (isFutureMonth) {
            status = 'expected';
            unpaidTotal += rAmount;
        } else if (isPastMonth) {
            status = 'late';
            lateCount++;
            lateTotal += rAmount;
        } else {
            if (r.dueDay && r.dueDay <= today) {
                status = 'late';
                lateCount++;
                lateTotal += rAmount;
            } else {
                status = 'expected';
                unpaidTotal += rAmount;
            }
        }

        items.push({ name: r.name, amount: rAmount, status, dueDay: r.dueDay, cardId: r.cardId });
    });

    return {
        total: recurringItems.length,
        paidCount, paidTotal,
        lateCount, lateTotal,
        unpaidCount: recurringItems.length - paidCount - lateCount,
        unpaidTotal,
        items
    };
}

function getIncomeStatus() {
    const incomeItems = Object.values(data.recurring).filter(r => isRecurringActiveForMonth(r, selectedMonth) && r.type === 'income');
    const txnPool = [...getMonthTransactions().filter(t => t.txnType === 'income')];
    const isCurrentMonth = selectedMonth === getCurrentMonth();
    const isFutureMonth = selectedMonth > getCurrentMonth();
    const isPastMonth = selectedMonth < getCurrentMonth();
    const today = dayOfMonth();

    let totalExpected = 0, receivedTotal = 0, receivedCount = 0, pendingTotal = 0;
    const items = [];

    incomeItems.forEach(r => {
        const rAmount = Number(r.amount || 0);
        totalExpected += rAmount;
        const found = findMatchingTxn(r.name || '', rAmount, txnPool);

        let status;
        if (found) {
            status = 'received';
            receivedCount++;
            receivedTotal += rAmount;
        } else if (isFutureMonth) {
            status = 'pending';
            pendingTotal += rAmount;
        } else if (isPastMonth) {
            status = 'missed';
            pendingTotal += rAmount;
        } else {
            if (r.dueDay && r.dueDay <= today) {
                status = 'missed';
            } else {
                status = 'pending';
            }
            pendingTotal += rAmount;
        }

        items.push({ name: r.name, amount: rAmount, status, dueDay: r.dueDay, cardId: r.cardId });
    });

    return { totalExpected, receivedTotal, receivedCount, pendingTotal, total: incomeItems.length, items };
}

// ===== RENDER: Dashboard =====
function renderDashboard() {
    const incomeStatus = getIncomeStatus();
    const actualMonthIncome = getMonthIncome();
    const income = actualMonthIncome || incomeStatus.totalExpected || Number(data.settings.monthlyIncome || 0);
    const recurStatus = getRecurringStatus();
    const spent = getMonthSpending();
    const remaining = income - spent;
    const txns = getMonthTransactions().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    // Budget bar: spent as % of income
    const pct = income > 0 ? Math.min((spent / income) * 100, 100) : 0;
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

    // Per-spender breakdown (expenses minus refunds)
    const expenseTxns = txns.filter(t => t.txnType !== 'income');
    const spenderTotals = {};
    getSpenders().forEach(s => spenderTotals[s] = 0);
    expenseTxns.forEach(t => {
        if (t.spender && spenderTotals[t.spender] !== undefined) {
            const sign = t.txnType === 'refund' ? -1 : 1;
            spenderTotals[t.spender] += sign * Number(t.amount || 0);
        }
    });

    // Per-category breakdown (expenses minus refunds)
    const catTotals = {};
    expenseTxns.forEach(t => {
        const cat = t.category || 'other';
        const sign = t.txnType === 'refund' ? -1 : 1;
        catTotals[cat] = (catTotals[cat] || 0) + sign * Number(t.amount || 0);
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
            <div class="summary-card${incomeStatus.total > 0 ? ' clickable' : ''}" ${incomeStatus.total > 0 ? 'onclick="window._toggleIncomeDetail()"' : ''}>
                <div class="label">Income</div>
                <div class="value neutral">${fmt(income)}</div>
                ${incomeStatus.total > 0 ? `<div class="sub">${fmt(incomeStatus.receivedTotal)} received${incomeStatus.pendingTotal > 0 ? ` • ${fmt(incomeStatus.pendingTotal)} pending` : ''}</div>` : ''}
            </div>
            <div class="summary-card">
                <div class="label">Spent</div>
                <div class="value negative">${fmt(spent)}</div>
                <div class="sub">${expenseTxns.length} expenses</div>
            </div>
            <div class="summary-card">
                <div class="label">Remaining</div>
                <div class="value ${overBudget ? 'negative' : 'positive'}">${fmt(remaining)}</div>
                <div class="sub">${isCurrentMonth ? `Day ${currentDay} of ${totalDays}` : 'Past month'}</div>
            </div>
            <div class="summary-card clickable" onclick="window._toggleRecurringDetail()">
                <div class="label">Still Expected</div>
                <div class="value ${recurStatus.unpaidTotal > 0 ? 'warning' : 'positive'}">${fmt(recurStatus.unpaidTotal)}</div>
                <div class="sub">${recurStatus.paidCount} of ${recurStatus.total} paid${recurStatus.lateCount > 0 ? ` • <span style="color:var(--danger)">${recurStatus.lateCount} late</span>` : ''} • <span style="color:var(--primary)">click for details</span></div>
            </div>
        </div>

        <div class="recurring-detail" id="recurringDetail" style="display:none">
            <div class="card" style="margin-bottom:1.5rem">
                <div class="card-header">
                    <span class="card-title">Recurring Status — ${monthLabel(selectedMonth)}</span>
                    <button class="btn-icon" onclick="window._toggleRecurringDetail()">✕</button>
                </div>
                ${recurStatus.items.map(item => {
                    const statusIcon = item.status === 'paid' ? '✅' : item.status === 'late' ? '⚠️' : '⏳';
                    const statusLabel = item.status === 'paid' ? 'Paid' : item.status === 'late' ? 'Late' : 'Expected';
                    const statusColor = item.status === 'paid' ? 'var(--primary)' : item.status === 'late' ? 'var(--danger)' : 'var(--warning)';
                    return `
                    <div class="recurring-detail-row">
                        <span class="recurring-detail-icon">${statusIcon}</span>
                        <span class="recurring-detail-name">${escapeHtml(item.name)}</span>
                        ${item.dueDay ? `<span class="recurring-detail-meta">Day ${item.dueDay}</span>` : ''}
                        ${item.cardId ? `<span class="recurring-detail-meta">${getCardName(item.cardId)}</span>` : ''}
                        <span class="recurring-detail-amount">${fmt(item.amount)}</span>
                        <span class="recurring-detail-status" style="color:${statusColor}">${statusLabel}</span>
                    </div>`;
                }).join('')}
            </div>
        </div>

        ${incomeStatus.total > 0 ? `
        <div class="recurring-detail" id="incomeDetail" style="display:none">
            <div class="card" style="margin-bottom:1.5rem">
                <div class="card-header">
                    <span class="card-title">Income Status — ${monthLabel(selectedMonth)}</span>
                    <button class="btn-icon" onclick="window._toggleIncomeDetail()">✕</button>
                </div>
                ${incomeStatus.items.map(item => {
                    const statusIcon = item.status === 'received' ? '✅' : item.status === 'missed' ? '⚠️' : '⏳';
                    const statusLabel = item.status === 'received' ? 'Received' : item.status === 'missed' ? 'Missed' : 'Pending';
                    const statusColor = item.status === 'received' ? 'var(--primary)' : item.status === 'missed' ? 'var(--danger)' : 'var(--warning)';
                    return `
                    <div class="recurring-detail-row">
                        <span class="recurring-detail-icon">${statusIcon}</span>
                        <span class="recurring-detail-name">${escapeHtml(item.name)}</span>
                        ${item.dueDay ? `<span class="recurring-detail-meta">Day ${item.dueDay}</span>` : ''}
                        ${item.cardId ? `<span class="recurring-detail-meta">${getCardName(item.cardId)}</span>` : ''}
                        <span class="recurring-detail-amount" style="color:var(--primary)">+${fmt(item.amount)}</span>
                        <span class="recurring-detail-status" style="color:${statusColor}">${statusLabel}</span>
                    </div>`;
                }).join('')}
            </div>
        </div>` : ''}

        <div class="budget-bar-container">
            <div class="budget-bar-labels">
                <span>Budget: ${fmt(income)}</span>
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
                            <div class="category-bar-row" style="cursor:pointer" onclick="window._viewCategory('${cat}')">
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
    const isIncome = t.txnType === 'income';
    const isRefund = t.txnType === 'refund';
    const badgeHtml = isIncome ? ' <span class="txn-type-badge income">INCOME</span>'
        : isRefund ? ' <span class="txn-type-badge refund">REFUND</span>' : '';
    const amountClass = isIncome ? 'txn-amount-income' : isRefund ? 'txn-amount-refund' : '';
    const sign = isIncome || isRefund ? '+' : '-';
    return `
        <div class="txn-item ${isIncome ? 'txn-income' : ''} ${isRefund ? 'txn-refund' : ''}">
            <div class="txn-icon">${getCategoryIcon(t.category)}</div>
            <div class="txn-details">
                <div class="txn-desc">${escapeHtml(t.description || getCategoryLabel(t.category))}${badgeHtml}</div>
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
            <div class="txn-amount ${amountClass}">${sign}${fmt(t.amount)}</div>
            <div class="txn-actions">
                <button class="btn-icon" onclick="window._editTxn('${t.id}')" title="Edit">✏️</button>
                <button class="btn-icon" onclick="window._deleteTxn('${t.id}')" title="Delete">🗑️</button>
            </div>
        </div>`;
}

// ===== RENDER: Transactions =====
function renderTransactions() {
    let txns;
    let periodLabel;

    if (dateRangeMode && dateRangeFrom && dateRangeTo) {
        txns = Object.entries(data.transactions)
            .filter(([, t]) => t.date >= dateRangeFrom && t.date <= dateRangeTo)
            .map(([id, t]) => ({ id, ...t }));
        periodLabel = `${dateRangeFrom} to ${dateRangeTo}`;
    } else {
        txns = getMonthTransactions();
        periodLabel = monthLabel(selectedMonth);
    }

    txns.sort((a, b) => {
        if (a.date !== b.date) return (b.date || '').localeCompare(a.date || '');
        return (b.createdAt || 0) - (a.createdAt || 0);
    });

    // Apply persistent filters
    let filtered = txns;
    if (txnFilters.card) filtered = filtered.filter(t => t.cardId === txnFilters.card);
    if (txnFilters.spender) filtered = filtered.filter(t => t.spender === txnFilters.spender);
    if (txnFilters.category) filtered = filtered.filter(t => t.category === txnFilters.category);
    if (txnFilters.type) filtered = filtered.filter(t => (t.txnType || 'expense') === txnFilters.type);

    // Apply sort
    const sort = txnFilters.sort || 'date-desc';
    filtered.sort((a, b) => {
        if (sort === 'date-asc') return (a.date || '').localeCompare(b.date || '') || (a.createdAt || 0) - (b.createdAt || 0);
        if (sort === 'amount-desc') return Number(b.amount || 0) - Number(a.amount || 0);
        if (sort === 'amount-asc') return Number(a.amount || 0) - Number(b.amount || 0);
        return (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0);
    });

    const expensesOnly = filtered.filter(t => t.txnType === 'expense' || (!t.txnType && t.txnType !== 'income' && t.txnType !== 'refund')).reduce((s, t) => s + Number(t.amount || 0), 0);
    const refundTotal = filtered.filter(t => t.txnType === 'refund').reduce((s, t) => s + Number(t.amount || 0), 0);
    const expenseTotal = expensesOnly - refundTotal;
    const incomeTotal = filtered.filter(t => t.txnType === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
    const today = new Date().toISOString().split('T')[0];

    mainContent.innerHTML = `
        ${dateRangeMode ? '' : monthNavHtml()}

        <div class="filter-bar" style="margin-bottom:1rem">
            <label class="check" style="font-size:0.8rem">
                <input type="checkbox" id="dateRangeToggle" ${dateRangeMode ? 'checked' : ''} onchange="window._toggleDateRange()">
                Date range
            </label>
            ${dateRangeMode ? `
                <input type="date" id="dateFrom" value="${dateRangeFrom}" onchange="window._updateDateRange()" style="padding:0.4rem;background:var(--surface);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:0.8rem">
                <span style="color:var(--text-muted)">to</span>
                <input type="date" id="dateTo" value="${dateRangeTo}" onchange="window._updateDateRange()" style="padding:0.4rem;background:var(--surface);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:0.8rem">
            ` : ''}
        </div>

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
            <h2 class="section-title">Transactions (${filtered.length})</h2>
        </div>

        ${filtered.length > 0 ? `
        <div class="totals-bar" style="margin-bottom:1rem">
            <span class="total-label">Spent in ${periodLabel}</span>
            <span class="total-value" style="color:var(--danger)">-${fmt(expenseTotal)}</span>
        </div>
        ${incomeTotal > 0 ? `<div class="totals-bar" style="margin-bottom:1rem;margin-top:-0.5rem">
            <span class="total-label">Income in ${periodLabel}</span>
            <span class="total-value" style="color:var(--primary)">+${fmt(incomeTotal)}</span>
        </div>` : ''}` : ''}

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
            <select id="filterType" onchange="window._applyTxnFilter()">
                <option value="">All Types</option>
                <option value="expense">Expenses only</option>
                <option value="income">Income only</option>
                <option value="refund">Refunds only</option>
            </select>
            <select id="filterSort" onchange="window._applyTxnFilter()">
                <option value="date-desc">Date (newest)</option>
                <option value="date-asc">Date (oldest)</option>
                <option value="amount-desc">Amount (highest)</option>
                <option value="amount-asc">Amount (lowest)</option>
            </select>
        </div>

        <div class="txn-list" id="txnList">
            ${filtered.length === 0 ? '<div class="empty-state"><div class="emoji">📝</div><p>No transactions found.</p></div>' :
                filtered.map(t => txnItemHtml(t)).join('')}
        </div>
    `;

    document.getElementById('quickAddForm').addEventListener('submit', handleQuickAdd);

    // Restore persistent filter values
    if (txnFilters.card) document.getElementById('filterCard').value = txnFilters.card;
    if (txnFilters.spender) document.getElementById('filterSpender').value = txnFilters.spender;
    if (txnFilters.category) document.getElementById('filterCategory').value = txnFilters.category;
    if (txnFilters.type) document.getElementById('filterType').value = txnFilters.type;
    if (txnFilters.sort) document.getElementById('filterSort').value = txnFilters.sort;
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
        txnType: 'expense',
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
    txnFilters.card = document.getElementById('filterCard')?.value || '';
    txnFilters.spender = document.getElementById('filterSpender')?.value || '';
    txnFilters.category = document.getElementById('filterCategory')?.value || '';
    txnFilters.type = document.getElementById('filterType')?.value || '';
    txnFilters.sort = document.getElementById('filterSort')?.value || 'date-desc';
    renderTransactions();
};

window._toggleDateRange = () => {
    dateRangeMode = document.getElementById('dateRangeToggle')?.checked || false;
    if (dateRangeMode && !dateRangeFrom) {
        const d = new Date();
        dateRangeTo = d.toISOString().split('T')[0];
        d.setMonth(d.getMonth() - 1);
        dateRangeFrom = d.toISOString().split('T')[0];
    }
    renderTransactions();
};

window._updateDateRange = () => {
    dateRangeFrom = document.getElementById('dateFrom')?.value || '';
    dateRangeTo = document.getElementById('dateTo')?.value || '';
    renderTransactions();
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
        const newCategory = document.getElementById('etCategory').value;
        const oldCategory = t.category || 'other';
        const desc = document.getElementById('etDesc').value.trim();

        // Ask about mapping BEFORE async update (browser blocks prompt in async callbacks)
        let patternInput = null;
        if (newCategory !== oldCategory && desc) {
            const suggestedPattern = desc.replace(/\s*#\d+.*$/, '').replace(/\s+(OR|WA|CA|TX|NY|FL|AZ|CO|WI|NV|CH|IT)\s*$/i, '').trim();
            patternInput = prompt(
                `Save mapping so future "${desc}" transactions auto-categorize as "${getCategoryLabel(newCategory)}"?\n\nEdit the pattern to match (shorter = matches more):`,
                suggestedPattern
            );
        }

        update(dbRef(`transactions/${id}`), {
            amount: parseFloat(document.getElementById('etAmount').value),
            category: newCategory,
            description: desc,
            cardId: document.getElementById('etCard').value,
            spender: document.getElementById('etSpender').value,
            date,
            month: `${y}-${m}`
        }).then(() => {
            hideModal();
            showToast('Transaction updated');

            if (patternInput && patternInput.trim()) {
                const mappings = data.settings?.categoryMappings || {};
                mappings[patternInput.trim()] = newCategory;
                update(dbRef('settings'), { categoryMappings: mappings }).then(() => {
                    showToast(`Mapping saved: "${patternInput.trim()}" = ${getCategoryLabel(newCategory)}`);
                });
            }
        });
    });
};

// Delete transaction
window._deleteTxn = (id) => {
    if (!confirm('Delete this transaction?')) return;
    remove(dbRef(`transactions/${id}`)).then(() => showToast('Transaction deleted'));
};

window._hideModal = hideModal;

// ===== Smart Suggestions Engine =====
function detectRecurringSuggestions() {
    const allTxns = Object.values(data.transactions);
    if (allTxns.length < 3) return [];

    // Group transactions by normalized description
    const groups = {};
    allTxns.forEach(t => {
        let key = (t.description || '').toUpperCase()
            .replace(/\s+/g, ' ')
            .replace(/#\d+/g, '')
            .replace(/\s+(OR|WA|CA|TX|NY|FL|AZ|CO)\s*$/i, '')
            .replace(/\s+\d{5,}$/, '')
            .trim();
        if (!key || key.length < 3) return;
        if (!groups[key]) groups[key] = [];
        groups[key].push(t);
    });

    const suggestions = [];
    const existingNames = new Set(
        Object.values(data.recurring).map(r => (r.name || '').toUpperCase().trim())
    );

    for (const [key, txns] of Object.entries(groups)) {
        if (txns.length < 2) continue;
        const months = new Set(txns.map(t => t.month));
        if (months.size < 2) continue;

        const amounts = txns.map(t => Number(t.amount || 0));
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const maxDiff = Math.max(...amounts.map(a => Math.abs(a - avgAmount)));
        const isFixed = maxDiff < avgAmount * 0.15;
        if (avgAmount < 1) continue;
        if (existingNames.has(key)) continue;

        const isIncome = txns[0].txnType === 'income';
        const category = txns[0].category || 'other';

        const cardCounts = {};
        const spenderCounts = {};
        txns.forEach(t => {
            if (t.cardId) cardCounts[t.cardId] = (cardCounts[t.cardId] || 0) + 1;
            if (t.spender) spenderCounts[t.spender] = (spenderCounts[t.spender] || 0) + 1;
        });
        const topCard = Object.entries(cardCounts).sort((a, b) => b[1] - a[1])[0];
        const topSpender = Object.entries(spenderCounts).sort((a, b) => b[1] - a[1])[0];

        const days = txns.map(t => t.date ? parseInt(t.date.split('-')[2]) : null).filter(Boolean);
        const avgDay = days.length > 0 ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : null;

        let recurType = 'bill';
        if (/subscri|netflix|hulu|spotify|disney|youtube|amazon prime|apple\s/i.test(key)) recurType = 'subscription';
        else if (/savings|transfer|upgrade|401|ira|invest/i.test(key)) recurType = 'savings';

        suggestions.push({
            name: txns[0].description || key,
            amount: Math.round(avgAmount * 100) / 100,
            category, type: recurType, isIncome, isFixed,
            months: months.size, occurrences: txns.length,
            cardId: topCard ? topCard[0] : '',
            spender: topSpender ? topSpender[0] : '',
            dueDay: avgDay
        });
    }

    suggestions.sort((a, b) => {
        if (a.isFixed !== b.isFixed) return a.isFixed ? -1 : 1;
        return b.occurrences - a.occurrences;
    });
    return suggestions;
}

window._addSuggestion = (name) => {
    const suggestions = detectRecurringSuggestions();
    const s = suggestions.find(x => x.name === name);
    if (!s) return;
    const item = {
        name: s.name, amount: s.amount, category: s.category,
        type: s.isIncome ? 'income' : s.type,
        dueDay: s.dueDay, cardId: s.cardId,
        active: true, notes: '',
        createdAt: Date.now()
    };
    set(push(dbRef('recurring')), item).then(() => showToast(`Added "${s.name}" as recurring`));
};

window._dismissSuggestion = (name) => {
    const dismissed = data.settings.dismissedSuggestions || [];
    dismissed.push(name.toUpperCase().trim());
    update(dbRef('settings'), { dismissedSuggestions: dismissed }).then(() => showToast('Suggestion dismissed'));
};

function renderSuggestionItem(s) {
    const icon = s.isIncome ? '💰' : getCategoryIcon(s.category);
    const badge = s.isFixed ? '<span class="suggest-badge fixed">Fixed</span>' : '<span class="suggest-badge variable">Variable</span>';
    const typeBadge = s.isIncome ? '<span class="suggest-badge income">Income</span>' : '';
    const safeName = escapeHtml(s.name).replace(/'/g, '&#39;');
    return `
        <div class="recurring-item suggestion-item">
            <div class="txn-icon">${icon}</div>
            <div class="recurring-info">
                <div class="recurring-name">${escapeHtml(s.name)} ${badge} ${typeBadge}</div>
                <div class="recurring-meta">
                    ${s.months} months • ${s.occurrences} times
                    ${s.dueDay ? ` • ~Day ${s.dueDay}` : ''}
                    ${s.cardId ? ` • ${getCardName(s.cardId)}` : ''}
                </div>
            </div>
            <div class="recurring-amount">${s.isIncome ? '+' : ''}${fmt(s.amount)}</div>
            <div class="recurring-actions" style="opacity:1">
                <button class="btn-icon" onclick="window._addSuggestion('${safeName}')" title="Add as recurring" style="color:var(--primary)">✅</button>
                <button class="btn-icon" onclick="window._dismissSuggestion('${safeName}')" title="Dismiss">❌</button>
            </div>
        </div>`;
}

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

    const totalExpenses = items.filter(r => isRecurringActiveForMonth(r, selectedMonth) && r.type !== 'income').reduce((s, r) => s + Number(r.amount || 0), 0);
    const totalIncome = items.filter(r => isRecurringActiveForMonth(r, selectedMonth) && r.type === 'income').reduce((s, r) => s + Number(r.amount || 0), 0);

    // Generate suggestions (filter out dismissed ones)
    const dismissed = new Set((data.settings.dismissedSuggestions || []).map(s => s.toUpperCase()));
    const allSuggestions = detectRecurringSuggestions().filter(s => !dismissed.has(s.name.toUpperCase().trim()));
    const expenseSuggestions = allSuggestions.filter(s => !s.isIncome);
    const incomeSuggestions = allSuggestions.filter(s => s.isIncome);

    mainContent.innerHTML = `
        <div class="section-header">
            <h2 class="section-title">🔄 Recurring Commitments</h2>
            <button class="btn btn-primary btn-sm" onclick="window._addRecurring()">+ Add</button>
        </div>

        <div class="totals-bar" style="margin-bottom: 1.5rem">
            <span class="total-label">Monthly Expenses</span>
            <span class="total-value" style="color:var(--danger)">-${fmt(totalExpenses)}</span>
        </div>
        ${totalIncome > 0 ? `<div class="totals-bar" style="margin-bottom: 1.5rem;margin-top:-0.75rem">
            <span class="total-label">Monthly Income</span>
            <span class="total-value" style="color:var(--primary)">+${fmt(totalIncome)}</span>
        </div>` : ''}

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
                                    ${r.dueDay ? ` • Day ${r.dueDay}` : ''}
                                    ${r.cardId ? ` • ${getCardName(r.cardId)}` : ''}
                                    ${r.startDate || r.endDate ? ` • ${r.startDate || '...'} to ${r.endDate || 'ongoing'}` : ''}
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
                <p>Add your monthly bills, subscriptions, savings plans, and investments. Or check the suggestions below!</p>
            </div>` : ''}

        ${allSuggestions.length > 0 ? `
            <div class="recurring-group" style="margin-top: 2rem">
                <div class="recurring-group-title">💡 Suggested Recurring (based on your transactions)</div>
                ${incomeSuggestions.length > 0 ? `
                    <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem;margin-top:0.5rem">Income</div>
                    ${incomeSuggestions.map(s => renderSuggestionItem(s)).join('')}
                ` : ''}
                ${expenseSuggestions.length > 0 ? `
                    <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem;margin-top:0.75rem">Bills & Expenses</div>
                    ${expenseSuggestions.map(s => renderSuggestionItem(s)).join('')}
                ` : ''}
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
                    <label for="rStartDate">Start Date</label>
                    <input type="month" id="rStartDate" value="${r.startDate || ''}" placeholder="Leave empty for no start">
                </div>
                <div class="form-group">
                    <label for="rEndDate">End Date</label>
                    <input type="month" id="rEndDate" value="${r.endDate || ''}" placeholder="Leave empty for ongoing">
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
            startDate: document.getElementById('rStartDate').value || null,
            endDate: document.getElementById('rEndDate').value || null,
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
            startDate: document.getElementById('rStartDate').value || null,
            endDate: document.getElementById('rEndDate').value || null,
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

    // Per-card spending (expenses minus refunds)
    const cardSpending = {};
    monthTxns.filter(t => t.txnType !== 'income').forEach(t => {
        if (t.cardId) {
            const sign = t.txnType === 'refund' ? -1 : 1;
            cardSpending[t.cardId] = (cardSpending[t.cardId] || 0) + sign * Number(t.amount || 0);
        }
    });

    // Group cards by type
    const grouped = {};
    Object.keys(ACCOUNT_TYPES).forEach(t => grouped[t] = []);
    cards.forEach(c => {
        const type = c.type || 'other';
        if (!grouped[type]) grouped[type] = [];
        grouped[type].push(c);
    });

    mainContent.innerHTML = `
        <div class="section-header">
            <h2 class="section-title">💳 Accounts & Cards</h2>
            <div style="display:flex;gap:0.5rem">
                ${cards.length === 0 ? `<button class="btn btn-secondary btn-sm" onclick="window._setupPresets()">⚡ Quick Setup</button>` : ''}
                <button class="btn btn-primary btn-sm" onclick="window._addCard()">+ Add</button>
            </div>
        </div>

        ${monthNavHtml()}

        ${cards.length === 0 ? `
            <div class="empty-state">
                <div class="emoji">💳</div>
                <h2>No accounts added</h2>
                <p>Click <strong>Quick Setup</strong> to add all your accounts at once, or add them one by one.</p>
            </div>` :
            Object.entries(ACCOUNT_TYPES).map(([type, cfg]) => {
                const group = grouped[type] || [];
                if (group.length === 0) return '';
                return `
                    <div class="recurring-group">
                        <div class="recurring-group-title">${cfg.label} (${group.length})</div>
                        <div class="cards-grid">
                            ${group.map(c => {
                                const spent = cardSpending[c.id] || 0;
                                const isCredit = c.type === 'credit';
                                const limit = Number(c.creditLimit || 0);
                                const utilPct = isCredit && limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                                const utilClass = utilPct < 30 ? 'safe' : utilPct < 70 ? 'caution' : 'over';
                                const inst = INSTITUTIONS[c.institution];
                                const instIcon = inst ? inst.icon : '';
                                const instLabel = inst ? inst.label : '';
                                return `
                                    <div class="card-item ${c.type}">
                                        <div class="card-item-actions">
                                            <button class="btn-icon" onclick="window._editCard('${c.id}')" title="Edit">✏️</button>
                                            <button class="btn-icon" onclick="window._deleteCard('${c.id}')" title="Delete">🗑️</button>
                                        </div>
                                        <div class="card-item-header">
                                            <span class="card-item-name">${instIcon ? instIcon + ' ' : ''}${escapeHtml(c.name)}</span>
                                            <span class="card-type-badge ${c.type}">${ACCOUNT_TYPES[c.type]?.label || c.type}</span>
                                        </div>
                                        <div class="card-item-details">
                                            ${instLabel ? `<span>${instLabel}</span>` : ''}
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
                    </div>`;
            }).join('')}
    `;
}

function cardFormHtml(c = {}) {
    return `
        <form id="cardForm" class="modal-form">
            <div class="form-group">
                <label for="cInstitution">Institution</label>
                <select id="cInstitution">${institutionOptions(c.institution)}</select>
            </div>
            <div class="form-group">
                <label for="cName">Account Name</label>
                <input type="text" id="cName" required value="${escapeHtml(c.name || '')}" placeholder="e.g. Chase Checking">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="cType">Type</label>
                    <select id="cType" required>${accountTypeOptions(c.type || 'debit')}</select>
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
    showModal('Add Account', cardFormHtml());
    document.getElementById('cardForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const card = {
            name: document.getElementById('cName').value.trim(),
            institution: document.getElementById('cInstitution').value,
            type: document.getElementById('cType').value,
            lastFour: document.getElementById('cLastFour').value.trim(),
            holder: document.getElementById('cHolder').value,
            creditLimit: parseFloat(document.getElementById('cLimit').value) || null,
            active: true,
            createdAt: Date.now()
        };
        set(push(dbRef('cards')), card).then(() => { hideModal(); showToast('Account added'); });
    });
};

window._editCard = (id) => {
    const c = data.cards[id];
    if (!c) return;
    showModal('Edit Account', cardFormHtml(c));
    document.getElementById('cHolder').value = c.holder || '';

    document.getElementById('cardForm').addEventListener('submit', (e) => {
        e.preventDefault();
        update(dbRef(`cards/${id}`), {
            name: document.getElementById('cName').value.trim(),
            institution: document.getElementById('cInstitution').value,
            type: document.getElementById('cType').value,
            lastFour: document.getElementById('cLastFour').value.trim(),
            holder: document.getElementById('cHolder').value,
            creditLimit: parseFloat(document.getElementById('cLimit').value) || null
        }).then(() => { hideModal(); showToast('Account updated'); });
    });
};

// Quick Setup: add all preset accounts at once
window._setupPresets = async () => {
    if (!confirm(`Add ${PRESET_ACCOUNTS.length} preset accounts (Key Bank, Chase, Citi, Amex, E*Trade, etc.)?`)) return;
    const promises = PRESET_ACCOUNTS.map(preset => {
        const card = {
            name: preset.name,
            institution: preset.institution,
            type: preset.type,
            lastFour: '',
            holder: getSpenders()[0] || '',
            creditLimit: null,
            active: true,
            createdAt: Date.now()
        };
        return set(push(dbRef('cards')), card);
    });
    await Promise.all(promises);
    showToast(`${PRESET_ACCOUNTS.length} accounts added!`);
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
// Show today's date in header
const headerDateEl = document.getElementById('headerDate');
if (headerDateEl) {
    headerDateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}
handleRoute();
