const express = require('express');
const { getAllBuildings } = require('../controllers/buildingController');
const router = express.Router();

router.get('/', getAllBuildings);

module.exports = router;