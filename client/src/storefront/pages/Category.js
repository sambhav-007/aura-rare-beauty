import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../Layout";
import ProductCard from "../ProductCard";
import Reveal from "../Reveal";
import { getCategory } from "../../api/shop";

const Category = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    getCategory(slug).then((r) => setData(r));
  }, [slug]);

  return (
    <Layout>
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
            {data.products.length === 0 ? (
              <p className="text-center text-muted py-16">No products yet.</p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
                {data.products.map((p, i) => (
                  <ProductCard key={p._id} product={p} index={i} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Category;
