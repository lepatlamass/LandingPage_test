# QWEN.md — Project Context

## Project Overview

**Name:** `refindocs`
**Type:** Next.js 14 web application (AI Studio-generated landing page + tool suite)
**Purpose:** A multi-language landing page for a document management/productivity tool, featuring AI-powered file conversion and document processing capabilities. The app serves as both a marketing landing site and a functional tool platform (e.g., PDF, image, and document conversion).

### Key Features
- **Landing page** with sections for businesses, accountants, students, and designers
- **Document tools** (file conversion, processing) powered by libraries like `@ffmpeg/ffmpeg`, `pdf-lib`, `docx`, `xlsx`, `mammoth`, `papaparse`, `heic-to`
- **AI integration** via Google Gemini (`@google/genai`)
- **Internationalization (i18n)** supporting 6 locales: `en`, `es`, `fr`, `pt-PT`, `pt-BR`, `it`
- **Firebase Google Auth** (integration guide provided; setup documented in `FIREBASE_AUTH_GUIDE.md`)
- **Standalone output** for containerized / serverless deployment

---

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion / Motion |
| **i18n** | `next-intl` |
| **Auth** | Firebase (Google Sign-In) |
| **AI** | Google Gemini SDK (`@google/genai`) |
| **Document Processing** | `pdf-lib`, `pdfjs-dist`, `docx`, `xlsx`, `mammoth`, `papaparse`, `@ffmpeg/ffmpeg`, `heic-to`, `jszip` |
| **UI Icons** | `lucide-react` |
| **Linting** | ESLint (`eslint-config-next`) |
| **Build** | Vite config present but app is Next.js-based |

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── [locale]/          # Locale-routed pages
│   │   │   ├── layout.tsx     # Locale layout with NextIntlClientProvider + AuthProvider
│   │   │   ├── page.tsx       # Landing page (Server Component)
│   │   │   ├── account/
│   │   │   ├── contact/
│   │   │   ├── imprint/
│   │   │   ├── login/
│   │   │   ├── privacy/
│   │   │   ├── terms/
│   │   │   └── tools/         # Document tool pages
│   │   ├── layout.tsx         # Root layout (RSC)
│   │   └── page.tsx           # Root page redirect
│   ├── components/            # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── i18n/
│   │   ├── config.ts          # Locale definitions
│   │   └── request.ts         # next-intl request config (loads messages/*.json)
│   ├── lib/                   # Shared utilities (Firebase init goes here)
│   ├── providers/             # React context providers (AuthProvider)
│   ├── types/                 # TypeScript type definitions
│   ├── middleware.ts           # next-intl routing middleware
│   └── navigation.ts           # Locale-aware Link/Router exports
├── messages/                  # i18n translation JSON files
├── public/                    # Static assets
├── next.config.mjs            # Next.js config (standalone output, headers, webpack aliases)
├── tailwind.config.ts         # Tailwind CSS config
├── tsconfig.json              # TypeScript config
└── package.json               # Dependencies and scripts
```

---

## Building and Running

### Prerequisites
- Node.js
- `.env.local` file with required environment variables:
  ```bash
  GEMINI_API_KEY=your-gemini-api-key
  # Firebase (if auth is enabled):
  NEXT_PUBLIC_FIREBASE_API_KEY=...
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
  NEXT_PUBLIC_FIREBASE_APP_ID=...
  ```

### Commands

| Command | Description |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build (outputs `standalone`) |
| `npm run start` | Start production server on port 3000 |
| `npm run lint` | Run ESLint |

---

## Internationalization (i18n)

- **Supported locales:** `en` (default), `es`, `fr`, `pt-PT`, `pt-BR`, `it`
- **Routing:** Always prefixed in URLs (e.g., `/en/tools`, `/fr/contact`)
- **Translation files:** `messages/{locale}.json`
- **Middleware:** `src/middleware.ts` handles locale detection and redirects
- **Navigation:** Use `src/navigation.ts` exports (`Link`, `useRouter`, etc.) instead of Next.js built-in — they are locale-aware

---

## Key Configuration Notes

1. **`output: 'standalone'`** — The build produces a standalone deployment bundle.
2. **COOP/COEP headers** — Applied **only** to `/tools` routes (required for `SharedArrayBuffer` used by ffmpeg). These headers will block Firebase Auth popups on tool pages; use `signInWithRedirect` there.
3. **Webpack aliases** — `canvas` is aliased to `false` to avoid pdfjs-related resolution issues.
4. **ESLint & TypeScript errors** — Ignored during builds (`ignoreDuringBuilds`, `ignoreBuildErrors`).

---

## Firebase Auth Integration

A comprehensive integration guide is available in `FIREBASE_AUTH_GUIDE.md`. Key files:
- `src/lib/firebase.ts` — Firebase initialization
- `src/providers/AuthProvider.tsx` — Auth context provider
- `src/components/auth/GoogleSignInButton.tsx` — Sign-in UI component

All routes are currently **public**. Route protection can be added later using the `ProtectedRoute` component pattern.

---

## Development Conventions

- **Server vs. Client Components:** Pages (`page.tsx`) and layouts (`layout.tsx`) are Server Components by default. Components using hooks, browser APIs, or Firebase must be marked `'use client'`.
- **i18n in components:** Use `next-intl` hooks (`useTranslations`) for text; never hardcode English strings in shared components.
- **Navigation:** Always import `Link`, `useRouter`, `redirect` from `src/navigation.ts` (locale-aware), not from `next/navigation`.
- **TypeScript:** Strict mode enabled. `skipLibCheck: true`. Path alias `@/*` maps to `src/*`.

---

## Relevant Documentation

- [FIREBASE_AUTH_GUIDE.md](./FIREBASE_AUTH_GUIDE.md) — Firebase Google Auth step-by-step
- [next-intl docs](https://next-intl-docs.vercel.app/) — i18n library reference
- [Next.js App Router](https://nextjs.org/docs/app) — Framework documentation
