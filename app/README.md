# 💰 SpendWise — Personal Expense Tracker

A modern, full-stack personal finance tracker built with Next.js 14, Prisma, SQLite, and Tailwind CSS. **100% free. No paid APIs.**

![SpendWise](https://img.shields.io/badge/Next.js-14-black) ![Prisma](https://img.shields.io/badge/Prisma-5-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![MIT](https://img.shields.io/badge/License-MIT-green)

## ✨ Features
- 🔐 JWT Auth with bcrypt password hashing & HTTP-only cookies
- 📊 Dashboard with real-time stats, charts, and budget progress
- 💸 Expense CRUD — add, edit, delete, duplicate, search, filter, sort
- 💰 Income management
- 🎯 Budget system with 80% / 100% / exceeded alerts
- 📈 Analytics — bar charts, pie charts, monthly trends
- 📤 Export to CSV & PDF (fully local, no APIs)
- 🌙 Dark / light / system theme
- 📱 Responsive mobile-first design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Install dependencies
```bash
npm install
```

### 2. Setup environment
```bash
cp .env.example .env
# Edit .env — set a strong JWT_SECRET
```

### 3. Setup database
```bash
npx prisma db push
# OR for migrations:
npx prisma migrate dev --name init
```

### 4. Setup shadcn/ui components
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input label select card badge avatar dialog alert-dialog dropdown-menu progress textarea separator tabs tooltip
```

### 5. Run development server
```bash
npm run dev
```
Visit **http://localhost:3000** — register a new account and start tracking!

## 🌐 Deploy to Vercel

```bash
npm install -g vercel
vercel deploy
```

**Set these env vars in Vercel dashboard:**
- `DATABASE_URL` → Use Railway/PlanetScale PostgreSQL (change Prisma provider to `postgresql`)
- `JWT_SECRET` → A long random string (generate: `openssl rand -base64 32`)

## 🐳 Docker

```bash
docker-compose up -d
```

## 📁 Project Structure
```
app/
├── (auth)/          # Login & Register pages
├── (dashboard)/     # Protected app pages
└── api/             # REST API routes
components/layout/   # Sidebar, Header
lib/                 # Auth, DB, utils, validations
types/               # TypeScript types + constants
store/               # Zustand global state
prisma/              # Database schema
```

## 🔑 Default Test Credentials
Register a new account at `/register` — no defaults needed, it's fully self-contained.

## 📝 License
MIT — Free to use, modify, and deploy.
