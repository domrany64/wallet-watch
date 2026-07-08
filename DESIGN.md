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
        name: "Chase Credit Card"
        institution: "chase"    // key from INSTITUTIONS constant
        type: "debit" | "credit" | "savings" | "investment" | "loan" | "other"
        holder: "Damon"
        lastFour: "4521"
        creditLimit: 5000       // null for non-credit
        active: true
        createdAt: 1720000000000
    /recurring
      /<pushId>
        name: "Rent"
        amount: 2000
        category: "housing"
        type: "income" | "bill" | "subscription" | "savings" | "investment"
        dueDay: 1
        cardId: ""              // optional link to an account
        active: true
        notes: ""
        createdAt: 1720000000000
    /transactions
      /<pushId>
        amount: 54.32
        category: "groceries"
        description: "Costco"
        txnType: "expense" | "income"  // auto-classified during import
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
Monthly Income (from settings)
  − Sum of expense transactions for the current month
  = Remaining Budget
```

Transactions are the **source of truth** for spending. Recurring items are informational — they show what to expect each month but are not deducted separately (to avoid double-counting when a recurring payment also appears as a transaction).

The dashboard "Still Expected" card intelligently matches recurring items against the selected month's transactions. The logic is time-aware:

| Viewing | Transaction found | No transaction, due day passed | No transaction, due day upcoming |
|---------|-------------------|-------------------------------|----------------------------------|
| **Future month** | Paid ✓ | Expected | Expected |
| **Current month** | Paid ✓ | Late ⚠️ | Expected |
| **Past month** | Paid ✓ | Late ⚠️ | Late ⚠️ |

Transaction matching: description keywords + similar amount (±20%). Subtitle shows e.g. "2 of 3 paid • 1 late". Clicking the "Still Expected" card expands a detail panel listing each recurring item with its status (✅ Paid, ⚠️ Late, ⏳ Expected), amount, due day, and linked account.

### Transaction Classification (during CSV import)

| Type | Description | Example |
|------|-------------|--------|
| `expense` | Money going out (purchases, bills) | Costco $50, Ziply $75 |
| `income` | Money coming in (paychecks, refunds) | Paycheck $3,690 |
| `transfer` | Money between own accounts (auto-skipped) | Citi Card Payment $1,356 |

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
- App logo "💰 WalletWatch" with today's date (e.g. "Tue, Jul 8, 2026") displayed in small text
- Navigation tabs: Dashboard, Transactions, Recurring, Accounts, Savings
- Settings (⚙️) and Backup (🔒) buttons
- Login/Logout button

### Dashboard
- Month navigator (← prev / next →) with "Today" button when viewing a non-current month
- Budget summary cards: Income, Spent, Remaining, Still Expected (with "X of Y paid")
- Visual budget progress bar: spent as % of income (green → yellow → red)
- Per-category spending chart (horizontal bars, expenses only)
- Per-spender breakdown (expenses only)
- Recent transactions (last 10, income shown with green badge)

### Transactions View
- Month selector
- Quick-add form (inline, always visible)
- Filter bar: by card, spender, category
- Transaction list sorted by date (newest first)
- Income transactions shown with green +$ and INCOME badge
- Separate totals: Spent (red) and Income (green)

### Recurring View
- Grouped by type: Income, Bills, Subscriptions, Savings, Investments
- Each item shows: name, amount, category, due day, linked account
- Toggle active/inactive
- Separate totals for monthly expenses and monthly income
- **Smart suggestions** section: auto-detected recurring patterns from transaction history with Fixed/Variable badges, accept (✅) or dismiss (❌)

### Accounts View (was "Cards")
- Grouped by account type: Debit/Checking, Credit Card, Savings, Investment, Loan/Mortgage, Other
- Each account shows: institution icon, name, type badge, holder, last 4, monthly spending
- Credit cards: utilization bar (spending vs. limit)
- Quick Setup button to add all 16 preset accounts at once
- Supported institutions: Key Bank, US Bank, OnPoint, Upgrade, Chase, Citi, Amex, Gap, Nordstrom, E*Trade, Fidelity, Embark Oregon, Intel, PayPal, Mr. Cooper, Nelnet

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

3. **Public repo is safe** — Firebase API key is a project identifier, not a secret. Security comes from database rules + auth. Backup files are encrypted.

---

## Color Scheme

- Primary accent: Emerald green (#10b981) — financial/money association
- Background: Dark slate (#0f172a)
- Surface: (#1e293b)
- Same dark theme family as OneToTen for visual consistency
- Budget bar colors: Green (safe) → Yellow (caution) → Red (over budget)
