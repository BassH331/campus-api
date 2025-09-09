// api/index.js
const { createServer } = require('http');
const app = require('../index'); // Express app

module.exports = (req, res) => {
  const server = createServer(app);
  server.emit('request', req, res);
};
