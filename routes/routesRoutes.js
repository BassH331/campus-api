const express = require('express');
const router = express.Router();
const { getRouteByName } = require('../controllers/routeController');

router.get('/:name', getRouteByName);

module.exports = router;
