const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // no need for service worker in dev
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/], // Avoid extra workbox calls
});

module.exports = withPWA({
  turbopack: {},
  // other Next.js configurations
});
