/*
 * Render keep-alive bot.
 *
 * Free Render web services spin DOWN after ~15 minutes without inbound HTTP
 * traffic, then cold-start (slow) on the next request. This module:
 *   1. Pings our own /api/health on an interval just under that window, so the
 *      instance never reaches the inactive/spun-down state.
 *   2. Logs every ping — including minutes since the last *real* (non-ping)
 *      request — so you can see it firing before the idle threshold is hit.
 *
 * It only activates when a public URL is known (RENDER_EXTERNAL_URL is set
 * automatically by Render), so it stays silent in local dev.
 *
 * Env:
 *   KEEPALIVE_URL      override the URL to ping (defaults to RENDER_EXTERNAL_URL)
 *   KEEPALIVE_MINUTES  ping interval in minutes (default 14)
 *   KEEPALIVE          set to "off" to disable even on Render
 */

const http = require("http");
const https = require("https");

const IDLE_LIMIT_MIN = 15; // Render's inactivity spin-down window.
let lastActivity = Date.now(); // last genuine (non keep-alive) request.

// Express middleware: record real traffic. Health pings are ignored so the
// "minutes since last request" figure reflects actual users, not ourselves.
function activityTracker(req, res, next) {
  if (req.path !== "/api/health") lastActivity = Date.now();
  next();
}

function startKeepAlive() {
  if (process.env.KEEPALIVE === "off") return;

  const base = (process.env.KEEPALIVE_URL || process.env.RENDER_EXTERNAL_URL || "")
    .replace(/\/+$/, "");
  if (!base) {
    // No public URL (e.g. local dev) — nothing to keep awake.
    return;
  }

  const minutes = Math.max(1, Number(process.env.KEEPALIVE_MINUTES) || 14);
  const target = `${base}/api/health`;
  const client = target.startsWith("https") ? https : http;

  const ping = () => {
    const startedAt = Date.now();
    const idleMin = ((startedAt - lastActivity) / 60000).toFixed(1);
    const approaching = startedAt - lastActivity > (IDLE_LIMIT_MIN - 2) * 60000;

    const req = client.get(target, (res) => {
      res.resume(); // drain the response
      const ms = Date.now() - startedAt;
      const tag = approaching ? "[keepalive ⚠ near-idle]" : "[keepalive]";
      console.log(
        `${tag} ${new Date().toISOString()} ping ${target} -> ${res.statusCode} ` +
          `in ${ms}ms · ${idleMin}m since last real request · ` +
          `staying warm (Render idles at ${IDLE_LIMIT_MIN}m)`
      );
    });
    req.on("error", (e) =>
      console.log(`[keepalive] ping failed: ${e.message}`)
    );
    req.setTimeout(10000, () => req.destroy(new Error("ping timeout")));
  };

  console.log(
    `[keepalive] enabled — self-pinging ${target} every ${minutes}m ` +
      `to beat Render's ${IDLE_LIMIT_MIN}m idle spin-down`
  );
  // Stagger the first ping a minute after boot, then on the interval.
  setTimeout(ping, 60 * 1000);
  setInterval(ping, minutes * 60 * 1000);
}

module.exports = { startKeepAlive, activityTracker };
