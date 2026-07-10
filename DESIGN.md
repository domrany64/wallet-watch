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
Monthly Income (from recurring income items, fallback to settings)
  − Sum of expense transactions for the current month
  = Remaining Budget
```

Income is calculated dynamically from recurring items of type "income". The dashboard shows how much has been received vs still pending. Falls back to the manual `monthlyIncome` setting if no income recurring items exist.

Transactions are the **source of truth** for spending. Recurring items are informational — they show what to expect each month but are not deducted separately (to avoid double-counting when a recurring payment also appears as a transaction).

The dashboard "Still Expected" card intelligently matches recurring items against the selected month's transactions. The logic is time-aware:

| Viewing | Transaction found | No transaction, due day passed | No transaction, due day upcoming |
|---------|-------------------|-------------------------------|----------------------------------|
| **Future month** | Paid ✓ | Expected | Expected |
| **Current month** | Paid ✓ | Late ⚠️ | Expected |
| **Past month** | Paid ✓ | Late ⚠️ | Late ⚠️ |

Transaction matching uses two strategies:
1. Close amount (±20%) + description keyword match
2. Exact amount match for non-round numbers (handles renamed bills, e.g. mortgage servicer changes)

Round numbers ($50, $100, $500, etc.) require description match to avoid false positives. Each matched transaction is **consumed** from the pool so it can only satisfy one recurring item — prevents double-matching for biweekly items like paychecks.

Subtitle shows e.g. "2 of 3 paid • 1 late". Clicking the "Still Expected" card expands a detail panel listing each recurring item with its status (✅ Paid, ⚠️ Late, ⏳ Expected), amount, due day, and linked account.

### Transaction Classification (during CSV import)

| Type | Description | Example |
|------|-------------|--------|
| `expense` | Money going out (purchases, bills) | Costco $50, Ziply $75 |
| `income` | Money coming in (paychecks, interest) | Paycheck $3,690 |
| `refund` | Money returned (store returns, cancellations) | Costco return $37.97 |
| `transfer` | Money between own accounts (auto-skipped) | Citi Card Payment $1,356 |

Refunds display with blue badge and +$ amount, and subtract from spending totals.

Credit card presets (Chase, Citi, Amex, Gap, Nordstrom) have `creditCard: true` flag. On credit cards, positive non-payment amounts are always classified as `refund`, never `income` (credit cards have no income).

### Duplicate Detection (during import)

Dedup key: `date|amount|description|txnType|cardId`. Same transaction on different cards = not a duplicate. Count-based: if DB has 1 matching row and CSV has 2, second one imports (handles real duplicates like two dental copays same day).

### Transfer Detection Patterns

Auto-skipped as inter-account transfers (not spending):
- Credit card payments: `citi card`, `chase credit`, `barclaycard`, `amex epayment`, `credit crd`, `nordstrom payment`
- Inter-bank transfers: `real time payment`, `rtp rec`, `rtp-`, `funds tran`, `internet trf`, `onpoint ccu`, `upgrade crb`, `upgrade.*transfer`
- Payment descriptions: `payment thank`, `online payment`, `autopay`, `bill pay`, `pymt`

Note: PayPal is NOT imported separately. PayPal activity captured from Key Bank side:
- `PAYPAL TRANSFER` (incoming) = income
- `PAYPAL INST XFER` / `PAYPAL PURCHASE` (outgoing) = expense

### Auto-Categorization

Transactions are auto-categorized by matching description text against patterns:
1. **User custom mappings** (stored in Firebase `settings.categoryMappings`) — checked first
2. **Built-in defaults** (100+ patterns) — Costco Gas = transport, Trader Joe = groceries, etc.

When a user edits a transaction's category in the app, a prompt offers to save the description pattern as a new mapping. The suggested pattern auto-strips store numbers and state codes for broader matching.

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
- Budget summary cards: Income (click for received/pending detail), Spent, Remaining, Still Expected (click for paid/late detail)
- Visual budget progress bar: spent as % of income (green → yellow → red)
- Per-category spending chart (horizontal bars, expenses only)
- Per-spender breakdown (expenses only)
- Recent transactions (last 10, income shown with green badge)

### Transactions View
- Month selector
- Date range mode (toggle checkbox, custom from/to dates)
- Quick-add form (inline, always visible)
- Filter bar: by card, spender, category, type (expenses/income/refunds), sort (date/amount asc/desc) — all persistent across month navigation
- Transaction list sorted by date (newest first)
- Income transactions shown with green +$ and INCOME badge
- Refund transactions shown with blue +$ and REFUND badge
- Separate totals: Spent (red) and Income (green)

### Re-categorize Tool (/recategorize.html)
- Scans all transactions against current mappings (built-in + user custom)
- Option to only re-evaluate "Other" category (safe default)
- Preview table: date, description, old category (strikethrough), new category
- Selectable per-row, bulk apply in single Firebase write

### Delete by Card Tool (/delete-by-card.html)
- Select a card/account from dropdown (shows transaction count per card)
- Scans and shows how many transactions will be deleted
- Confirmation required, then bulk deletes all matching transactions
- Useful for cleaning up before re-importing a corrected CSV

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
