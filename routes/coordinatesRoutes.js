const express = require('express');
const { getCoordinatesByName } = require('../controllers/coordinatesController');
const router = express.Router();

router.get('/', getCoordinatesByName);

module.exports = router;