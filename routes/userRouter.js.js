const express = require('express');
const { protect } = require('../controllers/authController');
const { getUsers } = require('../controllers/userController');

const router = express.Router();

router.use(protect);

router.route('/').get(getUsers);

module.exports = router;
