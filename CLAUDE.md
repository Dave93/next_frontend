# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 e-commerce platform (Chopar Pizza food delivery) with multi-language (ru/uz/en) and multi-city support. Uses Pages Router, not App Router.

## Commands

- `bun dev` - Start dev server on port 5656 (with Node inspect)
- `bun run build` - Production build
- `bun run start` - Start production server on port 5656
- `bun run server` - Run production server on port 4646 (wraps `next start`)
- `bun run prettier-fix` - Format codebase
- `bun run generate` - Generate GraphQL types
- `bun run analyze` - Bundle analysis (opens both client/server reports)
- `npx next-unused` - Find unused components/exports

## Code Style

- Prettier: no semicolons, single quotes, 2-space indent
- Pre-commit hook (Husky + lint-staged) runs Prettier on staged files
- TypeScript strict mode enabled

## Architecture

### Commerce Provider System

Pluggable commerce backend via `framework/` directory. The active provider is set by `COMMERCE_PROVIDER` env var (defaults to `local`). TypeScript path aliases route `@framework/*` to the selected provider and `@commerce/*` to the base types in `framework/commerce/`. Non-active providers are excluded from TS compilation in `tsconfig.json`.

### Path Aliases (tsconfig.json)

- `@lib/*` -> `lib/`
- `@utils/*` -> `utils/`
- `@config/*` -> `config/`
- `@assets/*` -> `assets/`
- `@components/*` -> `components/` (legacy)
- `@components_new/*` -> `components_new/` (primary UI)
- `@commerce/*` -> `framework/commerce/`
- `@framework/*` -> `framework/local/`

### Component Layers

- `components/` - Legacy components (auth, cart, checkout, product, search, UI primitives)
- `components_new/` - Primary UI components (header, product, order, profile, etc.)

### State Management

- **UI state:** React Context via `ManagedUIContext` (`components/ui/context.tsx`) - manages sidebar, modals, user data, location/delivery data, active city
- **Server state:** @tanstack/react-query v5 and SWR v2
- **HTTP:** Axios to backend API (`API_URL` env var, currently `https://api.choparpizza.uz`)
- **Persistence:** Cookies (js-cookie) for auth tokens and active city (base64-encoded JSON); localStorage fallback for OTP tokens

### Routing

Pages Router with `[city]` dynamic segments for multi-city support:

- `pages/[city]/` - City-scoped pages (cart, profile, orders, etc.)
- `pages/product/[id]` - Product pages
- `pages/[...pages]` - Catch-all for CMS pages
- `pages/api/` - API routes

### i18n

`next-translate` with locales loaded dynamically from the backend API (`/api/get_langs?lang={lang}`). Default locale is Russian. Config in `i18n.js`.

### Key Integrations

- **Maps:** React Leaflet v4 for delivery location picking
- **Analytics:** Google Tag Manager, Facebook Pixel
- **Auth:** OTP-based phone authentication
- **PWA:** next-pwa (currently commented out in config)
- **Images:** Sharp for optimization; allowed domains in `next.config.js`

## Environment

- `API_URL` - Backend API base URL
- `COMMERCE_PROVIDER` - Active commerce provider
- `NEXT_PUBLIC_*` - Client-exposed variables
- See `.env.local.example` for full list

### App Provider Hierarchy (`_app.tsx`)

Every page renders within this wrapper chain (outermost first):
`GoogleReCaptchaProvider` → `ManagedUIContext` → `QueryClientProvider` → `Layout` → `Page`

Pages can define a custom `Layout` via `Component.Layout`; defaults to passthrough. `ManagedUIContext` receives `pageProps` and provides all UI/user/location/city state.

## Deployment

PM2 with Bun runtime. `server.js` wraps `next start` on port 4646. Next.js 16 does not support custom Express servers with Pages Router — use `next start` directly.
