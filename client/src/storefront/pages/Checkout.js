import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Layout from "../Layout";
import Seo from "../Seo";
import { useCart } from "../../context/CartContext";
import { useSettings } from "../../context/SettingsContext";
import { money } from "../format";
import { createOrder } from "../../api/shop";

const Checkout = () => {
  const { items, total, setQty, clear } = useCart();
  const settings = useSettings();
  const history = useHistory();
  const [f, setF] = useState({ name: "", phone: "", address: "", pincode: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Order reference shown to the customer + matched in admin (= the order's
  // Mongo id, last 6 chars upper, e.g. #A1B2C3).
  const refFromId = (id) => (id ? `#${id.slice(-6).toUpperCase()}` : "");

  const buildMessage = (ref) => {
    const store = settings.storeName || "Aura Rare";
    let m = `• *New Order — ${store}*\n`;
    if (ref) m += `*Ref:* ${ref}\n`;
    m += `━━━━━━━━━━━━━━━\n\n`;
    m += `*Customer:* ${f.name}\n`;
    m += `*Phone:* ${f.phone}\n`;
    m += `*Address:* ${f.address}\n`;
    m += `*Pincode:* ${f.pincode}\n\n`;
    m += `*Order Details:*\n\n`;
    items.forEach((it, i) => {
      m += `${i + 1}. *${it.productName}*\n`;
      m += `    Shade: ${it.shadeName}\n`;
      m += `    Qty: ${it.qty} × ${money(it.price)} = ${money(it.price * it.qty)}\n\n`;
    });
    m += `━━━━━━━━━━━━━━━\n`;
    m += `*Subtotal: ${money(total)}*\n`;
    m += `_+ nominal shipping charges (varies by pincode — we'll confirm)_`;
    return m;
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!f.name.trim() || !f.phone.trim() || !f.address.trim())
      return setErr("Please fill in name, phone and address.");
    // Indian mobile: 10 digits (optionally with +91/0 prefix we strip).
    const phoneDigits = f.phone.replace(/\D/g, "").replace(/^(0|91)/, "");
    if (phoneDigits.length !== 10)
      return setErr("Please enter a valid 10-digit phone number.");
    if (!/^\d{6}$/.test(f.pincode.trim()))
      return setErr("Please enter a valid 6-digit pincode.");
    const number = (settings.whatsappNumber || "").replace(/\D/g, "");
    if (!number) return setErr("Store WhatsApp number is not configured.");

    setErr("");
    setBusy(true);
    // Record the order for admin tracking (best-effort; never blocks checkout).
    let ref = "";
    try {
      const res = await createOrder({
        items: items.map((it) => ({
          variantId: it.shadeId,
          variantName: it.shadeName,
          productName: it.productName,
          productSlug: it.productSlug,
          price: it.price,
          qty: it.qty,
        })),
        customer: { ...f, phone: phoneDigits },
        total,
        paymentMethod: "whatsapp",
      });
      if (res && res.order && res.order._id) ref = refFromId(res.order._id);
    } catch (err) {
      /* order recording is best-effort — proceed to WhatsApp regardless */
    }
    const url = `https://wa.me/${number}?text=${encodeURIComponent(
      buildMessage(ref)
    )}`;
    window.open(url, "_blank");
    clear();
    history.push(ref ? `/thank-you?ref=${encodeURIComponent(ref)}` : "/thank-you");
  };

  if (items.length === 0)
    return (
      <Layout>
        <div className="aura-container py-24 text-center">
          <p className="text-muted mb-6">Your cart is empty.</p>
          <Link to="/category" className="btn-accent">Browse Collections</Link>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <Seo title="Checkout" path="/checkout" noindex />
      <div className="aura-container py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="eyebrow mb-3">Almost There</div>
          <h1 className="display-1 mb-10">Checkout</h1>
          <form onSubmit={placeOrder}>
            <label className="block mb-4">
              <span className="text-sm text-muted">Name</span>
              <input
                className="lux-input mt-1"
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
              />
            </label>
            <label className="block mb-4">
              <span className="text-sm text-muted">Phone</span>
              <input
                className="lux-input mt-1"
                value={f.phone}
                onChange={(e) => setF({ ...f, phone: e.target.value })}
              />
            </label>
            <label className="block mb-4">
              <span className="text-sm text-muted">Address</span>
              <textarea
                rows="3"
                className="lux-input mt-1"
                value={f.address}
                onChange={(e) => setF({ ...f, address: e.target.value })}
              />
            </label>
            <label className="block mb-6">
              <span className="text-sm text-muted">Pincode</span>
              <input
                className="lux-input mt-1"
                value={f.pincode}
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit PIN code"
                onChange={(e) =>
                  setF({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })
                }
              />
            </label>
            {err && <p className="text-sm text-red-600 mb-4">{err}</p>}
            <button className="btn-accent w-full" disabled={busy}>
              {busy ? "Opening WhatsApp…" : "Place Order via WhatsApp"}
            </button>
            <p className="text-xs text-muted mt-3 text-center">
              You'll be redirected to WhatsApp to confirm your order. No online payment.
            </p>
          </form>
        </div>

        <div className="lux-card p-8 rounded h-fit">
          <h2 className="font-display text-2xl mb-5">Order Summary</h2>
          {items.map((it) => (
            <div
              key={it.shadeId}
              className="flex justify-between items-center gap-3 text-sm py-3 hairline-b"
            >
              <span className="flex-1">
                {it.productName} — {it.shadeName}
              </span>
              <div className="flex items-center border border-hairline rounded">
                <button
                  type="button"
                  className="px-2 leading-none text-base"
                  aria-label="Decrease quantity"
                  onClick={() => setQty(it.shadeId, it.qty - 1)}
                >
                  −
                </button>
                <span className="px-2">{it.qty}</span>
                <button
                  type="button"
                  className="px-2 leading-none text-base"
                  aria-label="Increase quantity"
                  onClick={() => setQty(it.shadeId, it.qty + 1)}
                >
                  +
                </button>
              </div>
              <span className="w-20 text-right">{money(it.price * it.qty)}</span>
            </div>
          ))}
          <div className="flex justify-between mt-4 text-sm">
            <span className="text-muted">Subtotal</span>
            <span>{money(total)}</span>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-muted">Shipping</span>
            <span className="text-accent">+ Nominal (by pincode)</span>
          </div>
          <div className="flex justify-between mt-3 pt-3 hairline-t font-medium">
            <span>Total</span>
            <span>
              {money(total)}{" "}
              <span className="text-muted text-sm font-normal">+ shipping</span>
            </span>
          </div>
          <p className="text-xs text-muted mt-3">
            Shipping is a small charge that varies by pincode — we'll confirm it
            with you on WhatsApp.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
