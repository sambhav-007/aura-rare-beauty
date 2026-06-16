import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

// Absolute base URL of the storefront. Set REACT_APP_SITE_URL in production
// (e.g. https://aurarare.in) so canonical/OG URLs are absolute; falls back to
// the browser origin at runtime.
const SITE_URL = (process.env.REACT_APP_SITE_URL || "").replace(/\/+$/, "");

const origin = () =>
  SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");

// Resolve a path or already-absolute URL to an absolute URL.
const abs = (pathOrUrl) => {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = origin();
  if (!base) return undefined;
  return `${base}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
};

/**
 * Per-page SEO: title, meta description, canonical, Open Graph + Twitter cards,
 * and optional JSON-LD structured data.
 *
 * Note: this is client-rendered. Google executes JS and will pick these up
 * (rankings + rich results). Non-JS social crawlers (WhatsApp, Facebook) see
 * the static defaults in public/index.html — see docs/SEO.md.
 */
const Seo = ({
  title,
  description,
  image,
  path,
  type = "website",
  noindex = false,
  jsonLd,
}) => {
  const settings = useSettings();
  const location = useLocation();
  const storeName = settings.storeName || "Aura Rare";

  const canonicalPath = path || location.pathname;
  const url = abs(canonicalPath);
  const fullTitle = title
    ? `${title} · ${storeName}`
    : `${storeName} — Premium Cosmetics & Beauty`;
  const desc =
    description ||
    `Discover ${storeName}: premium cosmetics, curated shades and beauty essentials. Browse the collection and order easily over WhatsApp.`;
  const img = abs(image) || abs("/logo.png");

  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {url && <link rel="canonical" href={url} />}
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />

      {/* Open Graph */}
      <meta property="og:site_name" content={storeName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      {img && <meta property="og:image" content={img} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {img && <meta name="twitter:image" content={img} />}

      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(b)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;
