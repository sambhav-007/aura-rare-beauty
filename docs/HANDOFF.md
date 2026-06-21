# Aura Rare — Project Context Handout

You are the lead engineer continuing work on **Aura Rare**, a premium cosmetics e-commerce site. Read this fully before acting. (Last updated 2026-06-21.)

## What it is
Forked from a MERN template ("Hayroo"), now fully rebuilt into a **luxury beauty brand storefront + admin panel** with **WhatsApp checkout** (no payments, no customer accounts, no online stock). Single admin. Orders ARE now recorded (best-effort) for admin tracking.

## Stack & layout
- **Monorepo**: `D:\work\aura-rare-beauty` — `client/` (React 16.14 + CRA 3.4.1) and `server/` (Express + Mongoose 5 + MongoDB Atlas + Cloudinary).
- **Run servers** via `.claude/launch.json` (preview_start): `server` (:8000), `client` (:3000). Do NOT use Bash for dev servers.
- Storefront code lives in `client/src/storefront/` (pages in `pages/`); admin in `client/src/components/admin/`; API clients `client/src/api/{shop,admin}.js`; contexts in `client/src/context/`.

## Data model (source of truth: `server/docs/AURA_RARE_ARCHITECTURE.md`)
**Category → Product → Shade** (separate `shades` collection — shade is the purchasable unit with price/mrp/images). **Review** belongs to shade (moderated, `approved`). **Order** (items snapshot + customer{name,phone,address,pincode} + total + status pending→confirmed→fulfilled/cancelled). **Banner** + **StoreSettings** (singleton: storeName, whatsappNumber, hero, about, socials). Images are Cloudinary `{url, publicId}`. **No SEO fields in DB** — SEO is done in-app. API routes are plural: `/api/{categories,products,shades,reviews,banners,settings,search,stats,orders}` + `/api/signin` + `/api/products/import[/preview]`; root `/sitemap.xml` + `/robots.txt`.

## Current state (all on `master`, pushed)
Phases 1–7 + hardening are **done**. Highlights beyond the original storefront/admin:
- **Order tracking**: every checkout records an Order; admin Orders page with status workflow + WhatsApp ref matching.
- **CSV product import** (admin): `controller/productImport.js` — header cols `category,product_name,variant_name,price,mrp,status,product_description,featured,*_image_url`. ⚠️ It always CREATES (dup slug) — it does NOT update existing products.
- **Phase 6 SEO**: `react-helmet-async` + `storefront/Seo.js` (per-page title/meta/canonical/OG/Twitter), JSON-LD (Product/Breadcrumb/Organization/WebSite), server `controller/sitemap.js` (dynamic `/sitemap.xml` + `/robots.txt`, driven by `SITE_URL`), static `public/robots.txt`. See `docs/SEO.md` — **no SSR, so social crawlers see only static index.html defaults**.
- **Phase 7 conversion**: floating WhatsApp button (`storefront/WhatsAppFab.js`), **mandatory 6-digit pincode** (validated client+server, in admin + WhatsApp msg), **order reference** `#XXXXXX` (= admin Order #) in msg + ThankYou, phone normalize/validate, editable qty in checkout, "Currently Unavailable" when a product has no active shades.
- **Banner hero carousel** (`storefront/BannerCarousel.js`): active banners REPLACE the homepage hero (auto-rotating, captions, click-through link). No banners → settings hero with title. "Our Story" image uses the settings hero image only (NOT banners).
- **Nav hover flyout** (desktop): hovering a nav link previews that page (Shop → category cards; category → product cards). **Home** link added (desktop + mobile).
- **Global busy spinner overlay** (`storefront/BusyOverlay.js` + `api/httpLoader.js`): shows during any create/update/delete request app-wide; idle edge debounced so looped bulk ops (e.g. bulk delete) stay covered.
- **Product gallery swipe**: swiping the shade image walks a flattened sequence (next image of same shade, then next shade); framer-motion slide.
- **Checkout shipping note**: bill + WhatsApp msg show "Subtotal" + "+ nominal shipping charges (varies by pincode — we'll confirm)". WhatsApp header uses a plain `•` bullet (emoji rendered as ◆ on some clients).
- Footer: "Powered by Viltrumate Technologies" → www.viltrumate.live.

## Deployment (live on Render via Blueprint)
- **`render.yaml`** at repo root defines two services: **`aura-rare-api`** (Express web service, free) + **`aura-rare-client`** (CRA static site, free/CDN, no spin-down). Use **New → Blueprint** in Render (the plain "New → Web Service" form ignores render.yaml). Fill `sync:false` env vars in the dashboard.
- **API env**: DATABASE, JWT_SECRET (auto-gen), CLOUDINARY_*, CORS_ORIGINS, SITE_URL, NODE_ENV=production, DNS_SERVERS=off. Build `npm install`, start `npm start` (a `start` script was added), health check `/api/health`. **Do NOT set PORT** (Render injects it).
- **Client env**: REACT_APP_API_URL (the API onrender URL, no trailing slash/no `/api`), REACT_APP_SITE_URL=https://www.aura-rare.com. SPA + sitemap rewrites are in render.yaml `routes`.
- **Keep-alive bot** (`server/config/keepAlive.js`): self-pings `/api/health` every ~14m using Render's `RENDER_EXTERNAL_URL` to beat the 15m idle spin-down; logs each ping. Silent locally.
- **Domain**: `www.aura-rare.com` currently lives on an **old, separate Vercel project** ("coming soon" page). To go live, remove it there and add it to the `aura-rare-client` static site, then update DNS to Render + the `Sitemap:` host in `public/robots.txt` + the sitemap rewrite host in `render.yaml`.

## Critical gotchas (read before coding)
- **framer-motion is v4** (React 16) — NO `whileInView`. Use `storefront/useInView.js` + `animate`. (AnimatePresence IS available — used by the gallery swipe.)
- **Prebuilt Tailwind** (`client/public/style.css`) is a purged legacy build missing many utilities — confirmed missing: `gap-2.5`, `space-x-7/9`, transforms, `backdrop-blur`, and **all responsive layout variants in this file** (`md:hidden`/`md:flex`/`md:block` etc.). NOTE: `md:` variants DO work at runtime because the CRA bundle ships them — but when in doubt, use inline styles or real `@media` rules in `client/src/styles/aura.css`. Brand tokens (cream `#FAF7F2`, accent `#B88A5A`, ink `#1F1F1F`) + Playfair/Inter live there.
- **Client install needs `--legacy-peer-deps`** — notistack@3 wants React 17+. There's a `client/.npmrc` (`legacy-peer-deps=true`) and the render build command passes the flag. Plain `npm install` in `client/` fails (ERESOLVE).
- **CRA on Node 24** needs `NODE_OPTIONS=--openssl-legacy-provider` — baked into client `start`/`build` via `cross-env`.
- **`.env` files are gitignored, local-only** (`server/.env`, `client/.env`). Don't delete. `DNS_SERVERS=8.8.8.8,1.1.1.1` in server `.env` fixes `querySrv ECONNREFUSED` on this machine's IPv6 DNS — keep it (the same workaround is now in `createAdmin.js`).
- Verify by building (`CI=true npx cross-env NODE_OPTIONS=--openssl-legacy-provider react-scripts build`) + preview_eval DOM checks — **preview_screenshot is flaky/timeouts often.** Bash `curl` can't reach Windows `localhost`; use preview_eval (browser fetch) for API checks.
- **Destructive DB writes via Bash/eval get blocked by the safety classifier** (e.g. bulk deletes). Use the authenticated admin API scoped to specific IDs, or have the user do it in admin.

## Live data
Atlas DB `Aura-Rare-Beauty`. **Admin password was changed by the user — `admin@aurarare.in`/`aurarare123` no longer works.** Reset/create via `node server/scripts/createAdmin.js <email> <pw(8+)> [name]` (runs locally against `DATABASE` in `server/.env`; Render free has no shell). Logo at `client/public/logo.png`.

**Catalogue update in progress** (client sent `Aura Rare Beauty.xlsx`): finalised shade lists were given as Bulk-Add paste lists. **Smile & Shine** (12 named shades) done. Others pending entry: Aura Swift Erase, Aura Bare Bear Wipes (named); **Mattitude & Rafael have NUMBERS ONLY — no shade names** in the sheet yet. Swatch badge shows the first 2 letters of the shade name (numeric-only names fall back to digits).

## Open items
1. **SECURITY (user action)**: rotate the Atlas password + Cloudinary secret — originals were exposed.
2. **Go-live**: move `www.aura-rare.com` from the old Vercel project to the Render static site (DNS + remove from Vercel); update robots/sitemap hosts; set prod env vars.
3. **Deferred Phase 7**: category price/in-stock filter (the larger piece, not yet built).
4. **Catalogue**: finish bulk-adding the remaining products; get shade NAMES for Mattitude & Rafael.
5. Future: Vite + React 18 migration (drops the OpenSSL flag, `--legacy-peer-deps`, unlocks framer-motion v11). SSR/prerender for real social cards.

## Working style
Concise, table-driven. Before each major change: state goal (3 lines), files, risks, then implement. Don't redesign the architecture or backend models. **The user wants each change committed AND pushed to `master`** (commit messages end with the Claude co-author trailer). Throwaway scripts (e.g. `server/scripts/_cleanupQA.js`) are NOT committed.
