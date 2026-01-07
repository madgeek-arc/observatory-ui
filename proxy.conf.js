
const PROXY_CONFIG = [
  // websocket endpoint (keep ws: true)
  {
    context: ["/api/websocket/**"],
    target: "http://localhost:8281/",
    secure: false,
    changeOrigin: true,
    ws: true,
    logLevel: "debug"
  },

  // normal api endpoints
  {
    context: ["/api/**"],
    target: "http://localhost:8281/",
    secure: false,
    changeOrigin: true,
    logLevel: "debug"
  },

  // pages with path rewrite
  {
    context: ["/pages/**"],
    target: "https://dl001.madgik.di.uoa.gr/",
    secure: true,
    changeOrigin: true,
    logLevel: "debug",
    pathRewrite: { "^/pages": "/" }
  },

  // other static paths served by the same host
  {
    context: [
      "/templates/yootheme/**",
      "/component/content/**",
      "/media/system/**",
      "/media/vendor/**"
    ],
    target: "https://dl001.madgik.di.uoa.gr/",
    secure: true,
    changeOrigin: true,
    logLevel: "debug"
  }
];

module.exports = PROXY_CONFIG;
