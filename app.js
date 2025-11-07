// app.js
const express = require("express");
const path = require("path");
const compression = require("compression");
const helmet = require("helmet");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;
const catalogApiUrl = process.env.CATALOG_API_URL || "http://localhost:4000";
const distPath = path.join(__dirname, "dist");
const indexFile = path.join(distPath, "index.html");

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

app.use(
  createProxyMiddleware("/api", {
    target: catalogApiUrl,
    changeOrigin: true,
    xfwd: true,
  })
);

app.use(
  express.static(distPath, {
    index: false,
    maxAge: "1d",
    etag: true,
  })
);

app.get("*", (_req, res) => {
  res.sendFile(indexFile);
});

app.listen(PORT, () => {
  console.log(`✅ Server rodando em http://localhost:${PORT}`);
});
