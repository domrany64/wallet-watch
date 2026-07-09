# 💰 WalletWatch

**Live site:** [https://domrany64.github.io/wallet-watch/](https://domrany64.github.io/wallet-watch/)

A family budget and expense tracker that gives you a clear, real-time view of where your money goes each month. Know exactly how much you can still spend — before it's too late.

## Features

- **Budget dashboard** — See income (received vs pending), spending, remaining budget, and still-expected recurring items at a glance with a visual progress bar
- **Smart "Still Expected"** — Recurring items matched against this month's transactions; only shows what hasn't been paid yet (e.g. "3 of 4 paid")
- **Dynamic income tracking** — Income calculated from recurring income items; shows how much received vs still pending with clickable detail panel
- **Transaction tracking** — Quick-add expenses with category, amount, card, spender, and description; income vs expense differentiation
- **Income & expense classification** — Transactions auto-classified as income (green +$), expense (red -$), refund (blue +$, subtracts from spending), or transfer (auto-skipped to avoid double-counting)
- **Auto-categorization** — 100+ built-in description-to-category mappings (Costco Gas = transport, Trader Joe = groceries, etc.) plus user-learned custom mappings
- **Category learning** — When you change a transaction's category in the app, prompts to save the description pattern for future auto-categorization
- **Recurring commitments** — Manage fixed monthly items grouped by type: Income, Bills, Subscriptions, Savings, and Investments
- **Smart suggestions** — Analyzes transaction history to detect recurring patterns (2+ months) and suggests them as recurring items with accept/dismiss
- **Multi-account support** — Track debit, credit, savings, investment, loan, and other accounts with institution icons (Key Bank, Chase, Citi, Amex, E*Trade, Fidelity, etc.)
- **Quick Setup** — One-click preset to add all your accounts at once (16 pre-configured institutions)
- **Multi-spender** — Track who spends what (e.g. you and your spouse)
- **Savings goals** — Set targets with progress tracking and monthly contributions
- **Investment tracking** — Log stock/investment holdings with cost basis and current value
- **Per-category breakdown** — See spending distribution across 19 categories (groceries, dining, transport, etc.)
- **Per-spender breakdown** — See who's spending what on the dashboard
- **Month navigation** — Browse current and past months with full history
- **Bank CSV import** — Bulk import transactions from bank statement CSVs with auto-detection and **duplicate skipping** (re-importing the same CSV won't create duplicates)
- **Smart transfer filtering** — Auto-skips credit card payments and inter-account transfers during import to avoid double-counting
- **Encrypted backups** — In-app backup/restore with AES-256-GCM password encryption (your data stays private)
- **Secure by design** — Firebase Auth + per-user database rules; no one sees your data without your login
- **Responsive** — Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS (single-page app, no build tools, ES modules)
- **Database:** Firebase Realtime Database (modular SDK v12.15.0)
- **Auth:** Firebase Email/Password Authentication
- **Hosting:** GitHub Pages
- **CI:** GitHub Actions (weekly encrypted DB backup)

## Security & Privacy

This app handles sensitive financial data. Key protections:

1. **Firebase Auth** — Only authenticated users can read/write data
2. **Per-user database rules** — Each user can only access their own data (`/households/{uid}/`)
3. **No public database access** — Unlike other apps, the DB is fully locked down
4. **Encrypted backups** — In-app backups use AES-256-GCM encryption with a user-provided password
5. **GitHub Actions backups** — Automated backups are encrypted with a repo secret before committing — safe even on public repos
6. **Public repo is safe** — The Firebase API key in the source code is *not* a secret; it's just a project identifier. All security comes from the database rules + auth. No financial data is ever stored in the repo itself (only encrypted `.enc` backup files that are unreadable without your password)

### Firebase Security Rules

Apply these rules in your Firebase Console → Realtime Database → Rules:

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

## Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Email/Password Authentication** under Authentication → Sign-in method
3. Create a **Realtime Database** and apply the security rules above
4. Create a user account under Authentication → Users
5. Copy your Firebase config and update `js/app.js` (the `firebaseConfig` object)
6. Deploy to GitHub Pages or open `index.html` locally

## Tools

- **Helpers page:** [/helpers/](https://domrany64.github.io/wallet-watch/helpers/) — Index of all helper tools
- **Import Bank CSV:** [/import-csv.html](https://domrany64.github.io/wallet-watch/import-csv.html) — Bulk import transactions from any bank statement CSV with auto-detection for:
  - 🏛️ Chase (credit card)
  - 🌐 Citi (credit card)
  - 💎 Amex (American Express)
  - 👔 Gap (Barclays)
  - 🛍️ Nordstrom
  - 🔑 Key Bank
  - 🏦 US Bank
  - 📍 OnPoint
  - 🅿️ PayPal
  - Plus Bank of America, Capital One, Wells Fargo, Discover
- **Re-categorize:** [/recategorize.html](https://domrany64.github.io/wallet-watch/recategorize.html) — Bulk re-evaluate transactions against current category mappings after adding new patterns
- **Delete by Card:** [/delete-by-card.html](https://domrany64.github.io/wallet-watch/delete-by-card.html) — Bulk delete all transactions for a selected card/account (for clean re-import)

## License

MIT License — see [LICENSE](LICENSE) for details.
