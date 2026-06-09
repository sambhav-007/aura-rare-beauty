/*
 * Aura Rare API server.
 * Images are stored on Cloudinary (no local uploads folder).
 * Admin signup: see controller/auth.js (userRole: 1 = admin).
 */

const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Active routers (Aura Rare architecture)
const authRouter = require("./routes/auth"); // admin login
const categoryRouter = require("./routes/categories");
const productRouter = require("./routes/products");
const shadeRouter = require("./routes/shades");
const reviewRouter = require("./routes/reviews");
const bannerRouter = require("./routes/banners");
const settingsRouter = require("./routes/settings");
const searchRouter = require("./routes/search");
const statsRouter = require("./routes/stats");

/*
 * SOFT-DEPRECATED (disconnected, files retained until full storefront/admin
 * cutover is verified): braintree, orders, customize, users routers.
 * Do not re-enable — see docs/AURA_RARE_ARCHITECTURE.md.
 */

// Database Connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("==== MongoDB Connected ===="))
  .catch((err) => console.log("Database Not Connected !!!", err.message));

// Middleware
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use("/api", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/shades", shadeRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/banners", bannerRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/search", searchRouter);
app.use("/api/stats", statsRouter);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Run Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log("Server is running on", PORT));
