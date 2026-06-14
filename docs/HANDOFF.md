# Aura Rare — Project Context Handout

You are the lead engineer continuing work on **Aura Rare**, a premium cosmetics e-commerce site. Read this fully before acting.

## What it is
Forked from a MERN template ("Hayroo"), now fully rebuilt into a **luxury beauty brand storefront + admin panel** with **WhatsApp checkout** (no payments, no customer accounts, no orders/stock). Single admin.

## Stack & layout
- **Monorepo**: `D:\work\aura-rare-beauty` — `client/` (React 16.14 + CRA 3.4.1) and `server/` (Express + Mongoose 5 + MongoDB Atlas + Cloudinary).
- **Run servers** via `.claude/launch.json` (preview_start): `server` (:8000), `client` (:3000). Do NOT use Bash for dev servers.
- Storefront code lives in `client/src/storefront/` (pages in `pages/`); admin in `client/src/components/admin/`; API clients `client/src/api/{shop,admin}.js`; contexts in `client/src/context/`.

## Data model (source of truth: `server/docs/AURA_RARE_ARCHITECTURE.md`)
**Category → Product → Shade** (separate `shades` collection — shade is the purchasable unit with price/mrp/images). **Review** belongs to shade (moderated, `approved`). **Banner** + **StoreSettings** (singleton: storeName, whatsappNumber, hero, about, socials). Images are Cloudinary `{url, publicId}`. **No SEO fields in DB** — SEO is done in-app. API routes are plural: `/api/{categories,products,shades,reviews,banners,settings,search,stats}` + `/api/signin`.

## Current state (all on `master`, pushed; PR #1 merged)
Phases 1–5 + a P0–P2 hardening/polish pass are **done and committed**. Storefront (editorial hero, category/product cards, 60-shade swatch selector, search, cart, WhatsApp checkout, mega footer, mobile drawer), admin (categories/products/shades-with-bulk/banners/reviews/settings), security (no public signup — use `node scripts/createAdmin.js <email> <pw>`; JWT env+expiry; helmet/rate-limit/CORS), ratings, related products, About/Contact/ThankYou pages.

## Critical gotchas (read before coding)
- **framer-motion is v4** (React 16) — it has NO `whileInView`. Use `client/src/storefront/useInView.js` (IntersectionObserver) + `animate`.
- **Prebuilt Tailwind** (`client/public/style.css`) is a purged legacy build missing many utilities (transforms, `space-x-7/9`, `backdrop-blur`, responsive gaps). Compat utilities are appended in `client/src/styles/aura.css`; **prefer that file's classes or inline styles** for new UI. Brand tokens (cream `#FAF7F2`, accent `#B88A5A`, ink `#1F1F1F`) + Playfair/Inter live there.
- **CRA on Node 24** needs `NODE_OPTIONS=--openssl-legacy-provider` — already baked into client `start`/`build` scripts via `cross-env`.
- **`.env` files are gitignored and local-only** (`server/.env`, `client/.env`). Don't delete them. `DNS_SERVERS=8.8.8.8,1.1.1.1` in server `.env` fixes a `querySrv ECONNREFUSED` on this machine's IPv6 DNS — keep it.
- Verify changes by building (`CI=true`) and via preview_eval DOM checks — **the preview_screenshot tool is flaky/timeouts often.**

## Live data
Atlas DB `Aura-Rare-Beauty`, seeded (`node scripts/seed.js`, ~199 shades). Admin: `admin@aurarare.in` / `aurarare123` at `/admin/login`. Logo at `client/public/logo.png`.

## Open items
1. **SECURITY (user action)**: rotate the Atlas password + Cloudinary secret — the originals were exposed.
2. **Phase 6 (next)**: SEO (dynamic titles/meta/OG via react-helmet, sitemap.xml, robots.txt) + deploy (Vercel client w/ `vercel.json`; Render server env: DATABASE, CLOUDINARY_*, JWT_SECRET, CORS_ORIGINS, NODE_ENV=production; set client `REACT_APP_API_URL`).
3. Future: Vite + React 18 migration (drops the OpenSSL flag, unlocks framer-motion v11).

## Working style
Concise, table-driven. Before each major change: state goal (3 lines), files, risks, then implement. Don't redesign the architecture or backend models. Commit only when asked.
