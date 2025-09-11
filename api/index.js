// api/index.js
const serverless = require("serverless-http");
const app = require("../index"); // Your Express app

module.exports = serverless(app);

app.use((err, req, res, next) => {
  console.error("❌ API Error:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

