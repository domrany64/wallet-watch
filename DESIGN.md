# WalletWatch — Design Document

## Overview

WalletWatch is a single-page family budget and expense tracking app. It uses Firebase Realtime Database for storage, Firebase Auth for access control, and GitHub Pages for hosting. The app helps a household track monthly income against spending, manage recurring commitments, and monitor savings goals.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              GitHub Pages (Static)           │
│  ┌────────┐  ┌──────────┐  ┌────────────┐  │
│  │  HTML  │  │   CSS    │  │  JS (ESM)  │  │
│  └────────┘  └──────────┘  └─────┬──────┘  │
│                                   │         │
└───────────────────────────────────┼─────────┘
                                    │ Firebase SDK (modular v12.15.0)
                              ┌─────▼─────┐
                              │  Firebase  │
                              │ Realtime DB│
                              │ + Auth     │
                              └───────────┘
```

---

## Data Model

### Firebase Structure

```
/households
  /<uid>
    /settings
      monthlyIncome: 8000
      currency: "USD"
      spenders: ["Damon", "Sedi"]
    /cards
      /<pushId>
        name: "Chase Checking Debit"
        type: "debit" | "credit"
        holder: "Damon"
        lastFour: "4521"
        creditLimit: 5000       // null for debit
        active: true
        createdAt: 1720000000000
    /recurring
      /<pushId>
        name: "Rent"
        amount: 2000
        category: "housing"
        type: "bill" | "subscription" | "savings" | "investment"
        dueDay: 1
        cardId: ""              // optional link to a card
        active: true
        notes: ""
        createdAt: 1720000000000
    /transactions
      /<pushId>
        amount: 54.32
        category: "groceries"
        description: "Costco"
        cardId: "abc123"
        spender: "Damon"
        date: "2026-07-06"
        month: "2026-07"        // for filtering
        createdAt: 1720000000000
    /savingsGoals
      /<pushId>
        name: "Emergency Fund"
        targetAmount: 20000
        currentAmount: 12000
        monthlyContribution: 500
        deadline: "2027-06-01"
        notes: ""
        createdAt: 1720000000000
    /investments
      /<pushId>
        name: "Apple Inc."
        ticker: "AAPL"
        shares: 10
        avgCost: 150.00
        currentValue: 195.00
        notes: ""
        updatedAt: 1720000000000
        createdAt: 1720000000000
```

### Security Rules

```json
{
  "rules": {
    "households": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

Each user's data is completely isolated. No public read access.

---

## Budget Calculation

```
Monthly Income
  − Sum of active recurring items (bills + subscriptions + savings + investments)
  = Discretionary Budget
  − Sum of transactions for the current month
  = Remaining Budget
```

Recurring items are treated as **committed money** — they're always deducted from income regardless of whether a matching transaction exists. Transactions represent **actual variable spending**.

---

## URL Routing (Hash-based)

| Route | View |
|-------|------|
| `#/` or `#/dashboard` | Dashboard (default) |
| `#/transactions` | Transaction list + quick-add |
| `#/recurring` | Recurring items manager |
| `#/cards` | Cards manager |
| `#/savings` | Savings goals + investments |

---

## UI Layout

### Header
- App logo "💰 WalletWatch"
- Navigation tabs: Dashboard, Transactions, Recurring, Cards, Savings
- Login/Logout button

### Dashboard
- Month navigator (← prev / next →)
- Budget summary cards: Income, Committed, Discretionary, Spent, Remaining
- Visual budget progress bar (green → yellow → red as spending increases)
- Per-spender breakdown
- Per-category spending chart (horizontal bars)
- Recent transactions (last 10)

### Transactions View
- Month selector
- Quick-add form (inline, always visible)
- Filter bar: by card, spender, category
- Transaction list sorted by date (newest first)
- Monthly total

### Recurring View
- Grouped by type: Bills, Subscriptions, Savings, Investments
- Each item shows: name, amount, category, due day, linked card
- Toggle active/inactive
- Total monthly commitments

### Cards View
- Card grid showing each card
- Per-card: name, type badge (debit/credit), holder, last 4, this month's spending
- Credit cards: utilization bar (spending vs. limit)

### Savings View
- Savings goals with progress bars (current/target)
- Investment holdings table (ticker, shares, cost, current value, gain/loss)
- Totals: total saved, total invested, combined

---

## Spending Categories

| Key | Icon | Label |
|-----|------|-------|
| housing | 🏠 | Housing |
| utilities | 💡 | Utilities |
| groceries | 🛒 | Groceries |
| dining | 🍽️ | Dining Out |
| transport | 🚗 | Transportation |
| healthcare | 🏥 | Healthcare |
| entertainment | 🎭 | Entertainment |
| shopping | 🛍️ | Shopping |
| personal | 💇 | Personal Care |
| education | 📚 | Education |
| subscriptions | 📱 | Subscriptions |
| savings | 🏦 | Savings |
| investments | 📈 | Investments |
| insurance | 🛡️ | Insurance |
| gifts | 🎁 | Gifts |
| travel | ✈️ | Travel |
| childcare | 👶 | Childcare |
| pets | 🐾 | Pets |
| other | 📦 | Other |

---

## Backup Strategy

### Problem
Previous apps backed up plain JSON to a public GitHub repo — anyone could see the data. Financial data requires stronger protection.

### Solution

1. **In-app encrypted backup:**
   - User clicks "Backup" → enters a password → app encrypts all data with AES-256-GCM (Web Crypto API) → downloads `.enc` file
   - Restore: upload `.enc` file → enter password → decrypts and restores

2. **GitHub Actions automated backup:**
   - Weekly cron job downloads DB using a Firebase database secret (stored as GitHub repo secret)
   - Encrypts the JSON with `openssl` using a `BACKUP_PASSWORD` repo secret
   - Commits encrypted `.enc` file to `backups/` folder
   - Even if repo is public, data is unreadable without the password

3. **Recommended:** Keep the GitHub repository **private**

---

## Color Scheme

- Primary accent: Emerald green (#10b981) — financial/money association
- Background: Dark slate (#0f172a)
- Surface: (#1e293b)
- Same dark theme family as OneToTen for visual consistency
- Budget bar colors: Green (safe) → Yellow (caution) → Red (over budget)
