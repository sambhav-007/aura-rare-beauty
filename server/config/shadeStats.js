const Shade = require("../models/shades");

// Attach { shadeCount, minPrice } to a list of lean product objects.
async function attachShadeStats(products) {
  if (!products || !products.length) return products;
  const ids = products.map((p) => p._id);
  const stats = await Shade.aggregate([
    { $match: { product: { $in: ids } } },
    {
      $group: {
        _id: "$product",
        count: { $sum: 1 },
        minPrice: { $min: "$price" },
      },
    },
  ]);
  const map = {};
  stats.forEach((s) => (map[s._id] = s));
  products.forEach((p) => {
    const st = map[p._id];
    p.shadeCount = st ? st.count : 0;
    p.minPrice = st ? st.minPrice : null;
  });
  return products;
}

module.exports = { attachShadeStats };
