const express = require('express');
const {
  signup,
  login,
  loadMe,
  protect,
} = require('../controllers/authController');

const router = express.Router();

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/loadme').get(protect, loadMe);

module.exports = router;
