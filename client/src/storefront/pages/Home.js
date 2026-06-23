import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../Layout";
import ProductCard from "../ProductCard";
import CategoryCard from "../CategoryCard";
import Reveal from "../Reveal";
import Seo from "../Seo";
import BannerCarousel from "../BannerCarousel";
import { useSettings } from "../../context/SettingsContext";
import { getCategories, getProducts, getBanners } from "../../api/shop";

const Home = () => {
  const s = useSettings();
  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [heroRatio, setHeroRatio] = useState(null);

  useEffect(() => {
    getCategories().then((r) =>
      setCats((r.categories || []).filter((c) => c.status === "Active"))
    );
    getProducts().then((r) => setProducts(r.products || []));
    getBanners().then((r) => setBanners(r.banners || []));
  }, []);

  const counts = {};
  products.forEach((p) => {
    const id = p.category && (p.category._id || p.category);
    if (id) counts[id] = (counts[id] || 0) + 1;
  });
  const featured = products.filter((p) => p.isFeatured);
  const bestSellers = (featured.length ? featured : products).slice(0, 4);
  const moreProducts = products.slice(0, 8);

  // Banners drive the hero when present; otherwise the settings-based hero shows.
  // The "Our Story" image is intentionally NOT tied to banners — only to the
  // store's own hero image setting.
  const hasBanners = banners.length > 0;
  const heroImageUrl = (s.heroImage && s.heroImage.url) || null;
  const heroHeading = s.heroHeading || "Beauty That Speaks For Itself";
  const heroSub = s.heroSubheading || "Discover shades crafted for every mood.";

  // Read the hero image's natural aspect ratio so the (settings) hero section
  // height adapts to it — full image shown, no crop, no letterbox.
  useEffect(() => {
    if (!heroImageUrl) {
      setHeroRatio(null);
      return;
    }
    const im = new Image();
    im.onload = () =>
      setHeroRatio(im.naturalHeight ? im.naturalWidth / im.naturalHeight : null);
    im.src = heroImageUrl;
  }, [heroImageUrl]);

  const storeName = s.storeName || "Aura Rare";
  const siteUrl =
    (process.env.REACT_APP_SITE_URL || "").replace(/\/+$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: storeName,
    url: siteUrl || undefined,
    logo: siteUrl ? `${siteUrl}/logo.png` : undefined,
    sameAs: [s.instagramUrl, s.facebookUrl].filter(Boolean),
  };
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: storeName,
    url: siteUrl || undefined,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Layout bare>
      <Seo
        path="/"
        description={
          s.aboutUs ||
          `${storeName} — premium cosmetics & curated shades. Explore the collection and order easily over WhatsApp.`
        }
        image={(hasBanners && banners[0].image && banners[0].image.url) || heroImageUrl}
        jsonLd={[orgJsonLd, siteJsonLd]}
      />
      {/* ---------- HERO ----------
          1) Active banners → auto-rotating carousel hero (no site text).
          2) A single uploaded hero image → shown whole & clean, no overlaid
             title/CTA (the image is a self-contained design). The transparent
             nav floats over it instead of cropping the top.
          3) No image → full-viewport text hero with title + CTA. */}
      {hasBanners ? (
        <BannerCarousel banners={banners} />
      ) : heroImageUrl ? (
        <Link
          to="/category"
          className="hero-image-hero"
          aria-label={`Shop ${storeName}`}
          style={{
            // Box matches the image's own aspect ratio so the whole design
            // shows with no crop; clamped so it never exceeds the viewport.
            aspectRatio: heroRatio ? String(heroRatio) : "16 / 9",
            backgroundImage: `url(${heroImageUrl})`,
          }}
        />
      ) : (
        <section
          className="relative flex items-center hero-fallback"
          style={{ minHeight: "100vh", width: "100%" }}
        >
          <div className="aura-container w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl"
              style={{ color: "var(--ink)" }}
            >
              <div className="eyebrow mb-5" style={{ color: "var(--accent)" }}>
                {storeName} · Rare by Nature
              </div>
              <h1 className="display-hero mb-6">{heroHeading}</h1>
              <p
                className="text-lg md:text-xl mb-10 max-w-lg"
                style={{ color: "var(--muted)" }}
              >
                {heroSub}
              </p>
              <Link to="/category" className="btn-ink">
                Explore Collection
              </Link>
            </motion.div>
          </div>
          <div
            className="absolute text-xs tracking-luxe uppercase"
            style={{
              bottom: 32,
              left: "50%",
              transform: "translateX(-50%)",
              color: "var(--muted)",
            }}
          >
            Scroll
          </div>
        </section>
      )}

      {/* ---------- FEATURED CATEGORIES ---------- */}
      {cats.length > 0 && (
        <section className="section">
          <div className="aura-container">
            <Reveal className="text-center mb-16">
              <div className="eyebrow mb-3">Collections</div>
              <h2 className="display-1">Shop by Category</h2>
            </Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
              {cats.map((c, i) => (
                <CategoryCard key={c._id} category={c} count={counts[c._id]} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- BEST SELLERS ---------- */}
      {bestSellers.length > 0 && (
        <section className="section bg-sand">
          <div className="aura-container">
            <Reveal className="flex items-end justify-between mb-16">
              <div>
                <div className="eyebrow mb-3">Loved Most</div>
                <h2 className="display-1">Best Sellers</h2>
              </div>
              <Link to="/category" className="nav-link hidden md:block">View All</Link>
            </Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
              {bestSellers.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- BRAND STORY ---------- */}
      <section className="section">
        <div className="aura-container grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <Reveal>
            <div
              className="bg-sand img-zoom"
              style={{
                aspectRatio: "4 / 5",
                background: heroImageUrl
                  ? undefined
                  : "linear-gradient(135deg,var(--sand),#efe6d8)",
              }}
            >
              {heroImageUrl && (
                <div
                  className="img-zoom-inner"
                  style={{ background: `url(${heroImageUrl}) center/cover no-repeat` }}
                />
              )}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="eyebrow mb-4">Our Story</div>
            <h2 className="display-1 mb-6">Rare by Nature</h2>
            <p className="text-muted text-lg leading-relaxed mb-8">
              {s.aboutUs ||
                "Aura Rare is a premium cosmetics house crafting considered, wearable shades — made to let your natural glow lead."}
            </p>
            <Link to="/category" className="btn-outline">Discover the Range</Link>
          </Reveal>
        </div>
      </section>

      {/* ---------- MORE PRODUCTS ---------- */}
      {moreProducts.length > 4 && (
        <section className="section bg-sand">
          <div className="aura-container">
            <Reveal className="text-center mb-16">
              <div className="eyebrow mb-3">The Edit</div>
              <h2 className="display-1">Featured Shades</h2>
            </Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
              {moreProducts.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- TESTIMONIAL BAND ---------- */}
      <section className="section">
        <div className="aura-container text-center max-w-3xl">
          <Reveal>
            <div className="eyebrow mb-6">Loved by Many</div>
            <p className="display-2 leading-snug">
              “Quiet luxury you can wear every day. The shades feel considered, the
              finish effortless.”
            </p>
            <div className="text-muted text-sm tracking-luxe uppercase mt-8">
              — The {s.storeName || "Aura Rare"} Community
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- SOCIAL ---------- */}
      {(s.instagramUrl || s.facebookUrl) && (
        <section className="section bg-ink text-cream">
          <div className="aura-container text-center">
            <Reveal>
              <div className="eyebrow mb-4" style={{ color: "#e8d6c0" }}>Follow</div>
              <h2 className="display-1 mb-8">Join the Aura</h2>
              <div className="flex justify-center gap-4">
                {s.instagramUrl && (
                  <a href={s.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-accent">
                    Instagram
                  </a>
                )}
                {s.facebookUrl && (
                  <a
                    href={s.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline"
                    style={{ borderColor: "#fff", color: "#fff" }}
                  >
                    Facebook
                  </a>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Home;
