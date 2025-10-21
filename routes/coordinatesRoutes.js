const express = require('express');
const router = express.Router();
const { getCoordinates } = require('../controllers/coordinatesController');

// GET /coordinates?name=... or /coordinates?buildingId=...
router.get('/', getCoordinates);

module.exports = router;
