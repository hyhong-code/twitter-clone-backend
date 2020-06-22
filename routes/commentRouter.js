const express = require('express');
const { protect } = require('../controllers/authController');
const {
  createComment,
  getComments,
} = require('../controllers/commentController');

const router = express.Router({ mergeParams: true });

router.route('/').get(getComments).post(protect, createComment);

module.exports = router;
