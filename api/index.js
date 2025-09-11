// api/index.js
const serverless = require("serverless-http");
const app = require("../index"); // Your Express app

module.exports = serverless(app);
