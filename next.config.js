const withPWA = require("next-pwa");

module.exports = withPWA({
  pwa: {
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    // register: true,
    // scope: "/",
    // sw: "service-worker.js",
  },
});
