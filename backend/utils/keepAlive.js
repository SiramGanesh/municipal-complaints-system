// ============================================
// Keep-Alive Utility
// ============================================
// Render's free tier spins down web services
// after ~15 minutes of no incoming traffic.
// To prevent the cold-start delay, this
// utility pings both the backend and the
// frontend every 14 minutes so Render sees
// them as "active" and keeps the instances
// running.
//
// The cron job is started once from
// server.js after the Express app is up.
// ============================================

const { CronJob } = require('cron');
const http = require('node:http');
const https = require('node:https');

// Ping a single URL and log the result.
// Uses the appropriate http/https client
// based on the URL scheme.
const ping = (url) => {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https:') ? https : http;
      const req = client.get(url, (res) => {
        // Drain the response so the socket can be released
        res.resume();
        if (res.statusCode === 200) {
          console.log(`✅ Keep-alive ping OK: ${url}`);
        } else {
          console.log(`⚠️  Keep-alive ping returned ${res.statusCode}: ${url}`);
        }
        resolve();
      });
      req.on('error', (err) => {
        console.error(`❌ Keep-alive ping error for ${url}: ${err.message}`);
        resolve();
      });
      // Don't let a slow/hung server hold us up
      req.setTimeout(10000, () => {
        req.destroy();
        console.error(`⏱️  Keep-alive ping timed out: ${url}`);
        resolve();
      });
    } catch (err) {
      console.error(`❌ Keep-alive ping threw for ${url}: ${err.message}`);
      resolve();
    }
  });
};

// Build the list of targets to ping.
// 1. Self: backend's own /health endpoint (keeps the Node service warm)
// 2. Frontend: optional, if FRONTEND_URL is set
const buildTargets = () => {
  const targets = [];

  // Self-ping: use RENDER_EXTERNAL_URL (set by Render on every service)
  // and fall back to localhost for local dev.
  const selfHost =
    process.env.RENDER_EXTERNAL_URL ||
    `http://localhost:${process.env.PORT || 5000}`;
  targets.push(new URL('/health', selfHost).href);

  // Optional frontend ping
  if (process.env.FRONTEND_URL) {
    targets.push(process.env.FRONTEND_URL);
  }

  return targets;
};

// The cron job: every 14 minutes, ping all targets.
const job = new CronJob('*/14 * * * *', async function () {
  const targets = buildTargets();
  for (const url of targets) {
    await ping(url);
  }
});

// Start the job. Called once from server.js.
const start = () => {
  job.start();
  console.log('⏰ Keep-alive cron job started (every 14 minutes)');
};

module.exports = { start, job };
