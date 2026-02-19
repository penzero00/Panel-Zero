# Frontend Directory

This directory contains the Next.js 15 + React 19 web application for PanelZero.

## Structure

```
frontend/
├── app/                    # Next.js App Router (pages)
│   ├── page.tsx           # Landing page
│   ├── login/page.tsx     # Login page
│   ├── dashboard/page.tsx # Main dashboard
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable React components
├── lib/                   # Utilities (API, Supabase, hooks)
├── types/                 # TypeScript interfaces
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── next.config.js        # Next.js config
├── tailwind.config.ts    # Tailwind CSS theme
└── .env.example          # Example env vars
```

## Key Files

- **pages**: User-facing application pages (Next.js App Router)
- **components**: Reusable UI components (Header, Footer, DocumentUpload, etc.)
- **lib/query-hooks.ts**: TanStack Query hooks (MANDATORY for data fetching)
- **lib/api-client.ts**: FastAPI HTTP client wrapper
- **lib/supabase.ts**: Supabase authentication client

## Development

```bash
# From root directory (uses pnpm + Turbo)
pnpm install
pnpm dev
```

Frontend will run at `http://localhost:3000`

## Important Rules

✅ **ALWAYS** use TanStack Query hooks from `lib/query-hooks.ts`
❌ **NEVER** use useState + useEffect for async operations
✅ Components use `.tsx` extension and kebab-case filenames
✅ All styling via Tailwind CSS 3.4

## TanStack Query Pattern

```typescript
import { useDocuments } from '@/lib/query-hooks';

export function MyComponent() {
  const { data: docs, isLoading } = useDocuments(token);
  
  if (isLoading) return <Spinner />;
  return <DocumentList docs={docs} />;
}
```

See `QUICK_REFERENCE.md` in root for more examples.
