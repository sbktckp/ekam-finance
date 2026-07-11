# Ekam Finance

> **एकम् — "The One."** One place for every rupee: budgets, bills, goals, and investments, built for how Indians actually manage money.

<p>
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth%20%2B%20RLS-3ECF8E?style=flat-square&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white" />
</p>

---

## Overview

Ekam Finance is a personal finance web app built INR-first for the Indian market — not a US budgeting tool with the currency symbol swapped. It brings transactions, budgets, bills, goals, and investments into a single dashboard with a rich, exportable reports view.

## ✨ Features

| Module | What it does |
|---|---|
| **Dashboard** | At-a-glance net worth, spend trends, and account balances |
| **Transactions** | Categorized income/expense tracking with stable, predictable sort ordering |
| **Accounts** | Multi-account support (bank, cash, wallet) with server-side balance guards |
| **Budgets** | Category-wise monthly budgets with live progress tracking |
| **Goals** | Savings goals with target dates and contribution tracking |
| **Bills** | Recurring bill reminders so nothing is missed |
| **Investments** | Track holdings and portfolio value over time |
| **Reports** | Rich, exportable breakdowns of spending and income by category/time |

## 🧱 Tech Stack

- **Framework:** Next.js 15 (App Router, Server Components by default)
- **Language:** TypeScript, strict mode
- **Backend:** Supabase — PostgreSQL, Auth, and Row-Level Security
- **Styling:** Tailwind CSS v3
- **State:** Zustand
- **Validation:** Zod
- **Charts:** Recharts
- **Deployment:** Vercel

## 🏗️ Architecture Notes

- **Data integrity first** — mandatory fields, server-side balance guards, and stable sort ordering are enforced at the database and server-action layer, not just the UI.
- **Supabase queries use `.maybeSingle()` over `.single()`** to avoid unnecessary throws on zero-row results.
- **Partial unique indexes** enforce NULL-safe uniqueness constraints where Postgres's default behavior would let duplicates slip through.
- **Route groups** (`(auth)`, `(dashboard)`) separate authenticated and public flows cleanly at the App Router level.

## 📁 Project Structure

```
app/
├── (auth)/              # Login, signup, auth flows
├── (dashboard)/
│   └── dashboard/
│       ├── accounts/
│       ├── bills/
│       ├── budget/
│       ├── goals/
│       ├── investments/
│       ├── reports/
│       ├── settings/
│       └── transactions/
├── actions/             # Server actions
├── auth/                # Auth route handlers
└── page.tsx             # Landing page
components/
lib/
types/
middleware.ts            # Session/auth middleware
```

## 🚀 Getting Started

```bash
git clone https://github.com/sbktckp/ekam-finance.git
cd ekam-finance
npm install
cp .env.example .env.local
# fill in your Supabase project URL and anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🗺️ Roadmap

- [ ] Bank statement import (CSV/PDF parsing)
- [ ] Multi-currency support for NRIs
- [ ] Shared/family budgets
- [ ] Mobile app (React Native)

---

<p align="center">Built by <a href="https://github.com/sbktckp">Smit</a>, mentored by <a href="https://linkedin.com/in/pakshal-tated-706155318/">Pakshal Tated</a>.</p>