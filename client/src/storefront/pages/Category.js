import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../Layout";
import ProductCard from "../ProductCard";
import Reveal from "../Reveal";
import Seo from "../Seo";
import { getCategory } from "../../api/shop";

const SORTS = {
  newest: { label: "Newest", fn: () => 0 },
  priceAsc: { label: "Price: Low to High", fn: (a, b) => (a.minPrice || 0) - (b.minPrice || 0) },
  priceDesc: { label: "Price: High to Low", fn: (a, b) => (b.minPrice || 0) - (a.minPrice || 0) },
};

const Category = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [sort, setSort] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    setData(null);
    setSort("newest");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    getCategory(slug).then((r) => setData(r));
  }, [slug]);

  const products = data && data.products ? data.products : [];

  // Price bounds across the collection (drives the input placeholders).
  const bounds = useMemo(() => {
    const prices = products.map((p) => p.minPrice).filter((v) => v != null);
    return prices.length
      ? { lo: Math.min(...prices), hi: Math.max(...prices) }
      : { lo: 0, hi: 0 };
  }, [products]);

  // A product is "in stock" (orderable) when it has at least one shade.
  const isInStock = (p) => (p.shadeCount || 0) > 0;

  const min = minPrice === "" ? null : Number(minPrice);
  const max = maxPrice === "" ? null : Number(maxPrice);
  const filtersActive =
    inStockOnly || minPrice !== "" || maxPrice !== "";

  const visible = [...products]
    .filter((p) => {
      if (inStockOnly && !isInStock(p)) return false;
      const mp = p.minPrice;
      if (min != null && (mp == null || mp < min)) return false;
      if (max != null && (mp == null || mp > max)) return false;
      return true;
    })
    .sort(SORTS[sort].fn);

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
  };

  const cat = data && !data.error ? data.category : null;

  return (
    <Layout>
      {cat && (
        <Seo
          title={cat.name}
          description={
            cat.description ||
            `Shop the ${cat.name} collection — premium shades and beauty essentials, order easily over WhatsApp.`
          }
          image={cat.image && cat.image.url}
          path={`/category/${cat.slug}`}
        />
      )}
      <div className="aura-container py-16 md:py-24">
        {!data ? (
          <p className="text-center text-muted py-24">Loading…</p>
        ) : data.error ? (
          <p className="text-center text-muted py-24">Category not found.</p>
        ) : (
          <>
            <Reveal className="text-center mb-16 max-w-2xl mx-auto">
              <div className="eyebrow mb-3">Collection</div>
              <h1 className="display-hero">{data.category.name}</h1>
              {data.category.description && (
                <p className="text-muted text-lg mt-5">{data.category.description}</p>
              )}
            </Reveal>
            {products.length === 0 ? (
              <p className="text-center text-muted py-16">No products yet.</p>
            ) : (
              <>
                <div className="cat-toolbar">
                  <div className="cat-filters">
                    <label className="cat-instock">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                      />
                      <span>In stock only</span>
                    </label>
                    <div className="cat-price">
                      <span className="cat-price-label">Price</span>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        className="cat-price-input"
                        placeholder={`₹${bounds.lo}`}
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        aria-label="Minimum price"
                      />
                      <span className="cat-price-dash">–</span>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        className="cat-price-input"
                        placeholder={`₹${bounds.hi}`}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        aria-label="Maximum price"
                      />
                    </div>
                    {filtersActive && (
                      <button
                        type="button"
                        className="cat-clear"
                        onClick={clearFilters}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="cat-toolbar-right">
                    <span className="cat-count">
                      {visible.length}{" "}
                      {visible.length === 1 ? "product" : "products"}
                    </span>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="lux-input"
                      style={{ width: "auto", padding: "0.5rem 1rem" }}
                      aria-label="Sort products"
                    >
                      {Object.entries(SORTS).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {visible.length === 0 ? (
                  <p className="text-center text-muted py-16">
                    No products match your filters.{" "}
                    <button
                      type="button"
                      className="cat-clear-inline"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </button>
                  </p>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
                    {visible.map((p, i) => (
                      <ProductCard key={p._id} product={p} index={i} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Category;
