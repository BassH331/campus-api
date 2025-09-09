const serverless = require("serverless-http");
const app = require("../index"); // your exported Express app

module.exports = serverless(app);
