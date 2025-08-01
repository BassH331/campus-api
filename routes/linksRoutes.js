const express = require('express');
const { getLinkByName } = require('../controllers/linksController');
const router = express.Router();

router.get('/', getLinkByName);

module.exports = router;