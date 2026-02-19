# 🎯 PanelZero: Getting Started (5 Minutes)

This is the fastest path to running PanelZero locally.

## ⚠️ Current Status: Frontend Only (Mock Auth)

The frontend is fully functional with **mock authentication** (no Supabase needed).
Backend setup is optional for now.

## Requirements

- **Node.js** 18+
- **pnpm** 8.15.0+ ([install globally](https://pnpm.io/installation))
- Optional: **Python** 3.10+, **Redis**, **Supabase** (for backend later)

## 1️⃣ Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

Verify:
```bash
pnpm --version
```

## 2️⃣ Install Dependencies

From the root directory:

```bash
pnpm install
```

This installs all monorepo dependencies using pnpm.

## 3️⃣ Start Frontend Dev Server (1 min)

From the root directory:

```bash
pnpm --filter=panelzero-frontend dev
```

✅ Frontend runs at `http://localhost:3000`

## ✅ You're Ready!

Visit **http://localhost:3000** and:
1. Click "Sign In" 
2. Enter **any email and password** (mock auth accepts anything)
3. You're logged in! Start exploring the dashboard

## 🔗 Login Flow

- **Email**: `test@example.com` (or anything)
- **Password**: `password123` (or anything)
- Both will work thanks to mock Supabase client

## 📚 Next Steps

**For Backend Development** (optional for now):
- See [PROJECT_SETUP.md](./PROJECT_SETUP.md) → Backend Setup section
- Requires Python 3.10+, pip, Redis, and Supabase credentials

**For Deploying to Production**:
- Set up real Supabase database
- Deploy backend to Cloud Run or similar
- Deploy frontend to Vercel
- Configure API keys in production environment

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| `pnpm not found` | Run `npm install -g pnpm` |
| Port 3000 already in use | Change with `PORT=3001 pnpm --filter=panelzero-frontend dev` |
| Build errors | Clear cache: `rm -r frontend/.next && pnpm install` |

---
