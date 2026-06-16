# SEO (Phase 6)

What's implemented and the one thing you must wire at deploy.

## What's in place

- **`react-helmet-async`** + a reusable `<Seo>` component (`client/src/storefront/Seo.js`).
  Every storefront page sets a unique `<title>`, meta description, canonical
  link, and Open Graph + Twitter card tags.
- **Structured data (JSON-LD):**
  - Home → `Organization` + `WebSite` (with site search action).
  - Product → `Product` (+ `AggregateOffer`, `AggregateRating` when reviews exist)
    and `BreadcrumbList`.
- **noindex** on non-content routes: cart, checkout, thank-you, search, 404, admin login.
- **Static fallback** OG/Twitter tags in `client/public/index.html` so link
  shares render a branded card even where JS doesn't run (see caveat below).
- **`client/public/robots.txt`** (static, served by the storefront host).
- **Dynamic `sitemap.xml` + `robots.txt`** generated from the DB on the API
  server: `server/controller/sitemap.js`, mounted at `/sitemap.xml` and
  `/robots.txt` in `server/app.js`.

## Environment variables

| Var | Where | Example | Purpose |
|-----|-------|---------|---------|
| `REACT_APP_SITE_URL` | client build | `https://aurarare.in` | Absolute canonical/OG URLs. Falls back to `window.location.origin` at runtime if unset. |
| `SITE_URL` | server | `https://aurarare.in` | Storefront origin used in `sitemap.xml` URLs. Falls back to the request host. |

## ⚠️ Important caveat — no SSR

This is a CRA single-page app with **no server-side rendering**. Helmet injects
tags **client-side**:

- **Google** executes JS, so it sees the per-page titles, descriptions, and
  JSON-LD → rankings and rich results work.
- **Non-JS social crawlers** (WhatsApp, Facebook, some Twitter paths) do **not**
  run JS, so a shared product link shows the **static default** card from
  `index.html`, not the product-specific one.

To get per-product social cards you need SSR or prerendering. Recommended
follow-ups (Phase 10 / the planned Vite + React 18 migration):
- Prerender with `react-snap`, or
- Move the storefront to Next.js, or
- Add a bot-only meta-injection layer in front of the static host.

## Deploy wiring (Vercel storefront)

`robots.txt` is served statically from `client/public`. For `sitemap.xml` to
live on the **storefront** domain (where search engines expect it), add a
rewrite **before** the SPA catch-all in `client/vercel.json`, pointing at the
API:

```json
{
  "rewrites": [
    { "source": "/sitemap.xml", "destination": "https://<your-api-host>/sitemap.xml" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Then update the `Sitemap:` line in `client/public/robots.txt` to your real
domain. Set `REACT_APP_SITE_URL` (client) and `SITE_URL` (server) to the
production storefront origin.
