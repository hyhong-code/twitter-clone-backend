const express = require('express');
const { protect } = require('../controllers/authController');
const { createComment } = require('../controllers/commentController');

const router = express.Router({ mergeParams: true });

router.route('/').post(protect, createComment);

module.exports = router;
