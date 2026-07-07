# 💰 WalletWatch

**Live site:** [https://domrany64.github.io/wallet-watch/](https://domrany64.github.io/wallet-watch/)

A family budget and expense tracker that gives you a clear, real-time view of where your money goes each month. Know exactly how much you can still spend — before it's too late.

## Features

- **Budget dashboard** — See your monthly income, fixed commitments, discretionary spending, and remaining budget at a glance with a visual progress bar
- **Transaction tracking** — Quick-add expenses with category, amount, card, spender, and description
- **Recurring commitments** — Manage fixed monthly items: bills, subscriptions, savings, and investments (auto-deducted from budget)
- **Multi-card support** — Track debit and credit cards, see per-card spending and credit utilization
- **Multi-spender** — Track who spends what (e.g. you and your spouse)
- **Savings goals** — Set targets with progress tracking and monthly contributions
- **Investment tracking** — Log stock/investment holdings with cost basis and current value
- **Per-category breakdown** — See spending distribution across categories (groceries, dining, transport, etc.)
- **Month navigation** — Browse current and past months with full history
- **Encrypted backups** — In-app backup/restore with AES-256 password encryption (your data stays private)
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
- **Import Bank CSV:** [/import-csv.html](https://domrany64.github.io/wallet-watch/import-csv.html) — Bulk import transactions from any bank statement CSV

## License

MIT License — see [LICENSE](LICENSE) for details.
