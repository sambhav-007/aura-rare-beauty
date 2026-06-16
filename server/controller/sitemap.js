const Product = require("../models/products");
const Category = require("../models/categories");

/*
 * SEO: dynamic sitemap.xml + robots.txt.
 *
 * URLs point at the STOREFRONT, not the API. Set SITE_URL to the public
 * storefront origin (e.g. https://aurarare.in). If unset we fall back to the
 * request host, which is correct only when these routes are served from (or
 * proxied through) the storefront domain — see docs/SEO.md.
 */

const siteUrl = (req) =>
  (process.env.SITE_URL || "").replace(/\/+$/, "") ||
  `${req.protocol}://${req.get("host")}`;

const xmlEscape = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const urlTag = (loc, lastmod, priority) =>
  `  <url>\n    <loc>${xmlEscape(loc)}</loc>` +
  (lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString()}</lastmod>` : "") +
  (priority ? `\n    <priority>${priority}</priority>` : "") +
  `\n  </url>`;

exports.sitemap = async (req, res) => {
  try {
    const base = siteUrl(req);
    const [products, categories] = await Promise.all([
      Product.find({ status: "Active" }).select("slug updatedAt").lean(),
      Category.find({ status: "Active" }).select("slug updatedAt").lean(),
    ]);

    const urls = [
      urlTag(`${base}/`, null, "1.0"),
      urlTag(`${base}/category`, null, "0.8"),
      urlTag(`${base}/about`, null, "0.5"),
      urlTag(`${base}/contact`, null, "0.5"),
      ...categories.map((c) =>
        urlTag(`${base}/category/${c.slug}`, c.updatedAt, "0.7")
      ),
      ...products.map((p) =>
        urlTag(`${base}/product/${p.slug}`, p.updatedAt, "0.9")
      ),
    ];

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.join("\n") +
      `\n</urlset>\n`;

    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600");
    return res.send(xml);
  } catch (err) {
    return res.status(500).send("Failed to build sitemap");
  }
};

exports.robots = (req, res) => {
  const base = siteUrl(req);
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /checkout",
    "Disallow: /thank-you",
    "Disallow: /cart",
    "",
    `Sitemap: ${base}/sitemap.xml`,
    "",
  ].join("\n");
  res.header("Content-Type", "text/plain");
  return res.send(body);
};
