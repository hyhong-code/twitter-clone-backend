const express = require('express');
const { protect } = require('../controllers/authController');
const { getUsers, getUser } = require('../controllers/userController');

const router = express.Router();

router.use(protect);

router.route('/').get(getUsers);
router.route('/:id').get(getUser);

module.exports = router;
