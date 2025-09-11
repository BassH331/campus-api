const app = require('../index'); // your Express app
const { createServer } = require('http');

module.exports = async (req, res) => {
  const server = createServer(app);
  server.emit('request', req, res);
};
