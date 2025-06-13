const helmet = require("helmet");

const helmetMiddleware = helmet({
  contentSecurityPolicy: false,
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true }
});

module.exports = helmetMiddleware;
