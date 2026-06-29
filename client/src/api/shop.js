import axios from "axios";

const base = `${process.env.REACT_APP_API_URL}/api`;
const data = (r) => r.data;
const fail = (e) => (e.response && e.response.data) || { error: "Network error" };
const get = (u) => axios.get(`${base}${u}`).then(data).catch(fail);

export const getCategories = () => get("/categories");
export const getCategory = (slug) => get(`/categories/${slug}`);
// Storefront only ever shows Active products (disabled ones are hidden in the
// navbar previews, home, etc.). Append status=Active to whatever query is given.
export const getProducts = (q = "") => {
  const sep = q.includes("?") ? "&" : "?";
  return get(`/products${q}${sep}status=Active`);
};
export const getFeaturedProducts = () =>
  get("/products?featured=true&status=Active");
export const getProduct = (slug) => get(`/products/${slug}`);
export const getReviewsByShade = (shadeId) => get(`/reviews/by-shade/${shadeId}`);
export const getBanners = () => get("/banners");
export const getSettings = () => get("/settings");
export const search = (q) => get(`/search?q=${encodeURIComponent(q)}`);

export const submitReview = (body) =>
  axios.post(`${base}/reviews`, body).then(data).catch(fail);

// Records an order at checkout (WhatsApp / COD …) for admin order tracking.
export const createOrder = (body) =>
  axios.post(`${base}/orders`, body).then(data).catch(fail);
