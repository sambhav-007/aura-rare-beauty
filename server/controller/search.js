const Shade = require("../models/shades");
const Product = require("../models/products");
const Category = require("../models/categories");

// GET /api/search?q=...
// Returns matching shades, products and categories. Shade matches are
// prioritised (listed first) since shades are the purchasable unit.
class SearchController {
  async search(req, res) {
    try {
      const q = (req.query.q || "").trim();
      if (!q) return res.json({ shades: [], products: [], categories: [] });
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

      const [shadeMatches, products, categories] = await Promise.all([
        Shade.find({ name: rx, status: "Active" })
          .populate({
            path: "product",
            select: "name slug category status",
            populate: { path: "category", select: "name slug" },
          })
          .limit(40),
        Product.find({ name: rx, status: "Active" })
          .populate("category", "name slug")
          .limit(20),
        Category.find({ name: rx, status: "Active" }).limit(10),
      ]);

      // Hide shades whose parent product is disabled (or missing).
      const shades = shadeMatches
        .filter((s) => s.product && s.product.status === "Active")
        .slice(0, 20);

      return res.json({ query: q, shades, products, categories });
    } catch (err) {
      return res.status(500).json({ error: "Search failed" });
    }
  }
}

module.exports = new SearchController();
