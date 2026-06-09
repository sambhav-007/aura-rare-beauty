# Soft-Deprecated Modules

Disconnected from `app.js` but retained until storefront + admin cutover is verified.
**Do not re-enable.** Delete only after Phases 3–4 pass end-to-end.

| File | Reason | Replaced by |
|---|---|---|
| `routes/braintree.js`, `controller/braintree.js` | No payments | WhatsApp checkout (client-side) |
| `routes/orders.js`, `controller/orders.js`, `models/orders.js` | No order workflow | — |
| `routes/customize.js`, `controller/customize.js`, `models/customize.js` | Slider/stats | `banners` + `settings` |
| `routes/users.js`, `controller/users.js` | No customer accounts | — (admin login via `routes/auth.js`) |
| `config/uploadFolderCreateScript.js` | Local disk uploads | Cloudinary |

Retained & active: `routes/auth.js`, `controller/auth.js`, `models/users.js`, `middleware/auth.js` (admin login only).
