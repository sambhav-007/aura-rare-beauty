export const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

// Lowest active shade price for a product's shade list.
export const fromPrice = (shades = []) => {
  const prices = shades
    .filter((s) => s.status !== "Disabled")
    .map((s) => s.price);
  return prices.length ? Math.min(...prices) : null;
};
