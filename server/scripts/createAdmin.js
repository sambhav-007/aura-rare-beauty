/*
 * Create (or reset) the single admin account.
 * Usage: node scripts/createAdmin.js <email> <password> [name]
 */
require("dotenv").config();
const dns = require("dns");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userModel = require("../models/users");

// Same DNS workaround as app.js: mongodb+srv needs an SRV lookup, which fails
// with querySrv ECONNREFUSED on some machines (Windows IPv6 link-local DNS).
// Override with DNS_SERVERS="1.1.1.1,8.8.8.8", or DNS_SERVERS="off" to skip.
if (process.env.DNS_SERVERS !== "off") {
  try {
    dns.setServers(
      (process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
  } catch (e) {
    /* ignore — fall back to system DNS */
  }
}

async function run() {
  const [email, password, name = "Aura Admin"] = process.argv.slice(2);
  if (!email || !password || password.length < 8) {
    console.error("Usage: node scripts/createAdmin.js <email> <password(8+ chars)> [name]");
    process.exit(1);
  }
  await mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  const hash = bcrypt.hashSync(password, 10);
  const existing = await userModel.findOne({ email });
  if (existing) {
    existing.password = hash;
    existing.userRole = 1;
    await existing.save();
    console.log(`Admin password reset for ${email}`);
  } else {
    await userModel.create({ name, email, password: hash, userRole: 1 });
    console.log(`Admin created: ${email}`);
  }
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
