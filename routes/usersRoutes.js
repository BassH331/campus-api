const express = require('express');
const { listUsers, getUserById } = require('../controllers/usersController');

const router = express.Router();

router.get('/', listUsers);
router.get('/:id', getUserById);

module.exports = router;
