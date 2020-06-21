const express = require('express');
const {
  signup,
  login,
  loadMe,
  updateInfo,
  updatePassword,
  deleteMe,
  protect,
} = require('../controllers/authController');

const router = express.Router();

router.route('/signup').post(signup);
router.route('/login').post(login);

router.route('/loadme').get(protect, loadMe);
router.route('/updateinfo').post(protect, updateInfo);
router.route('/updatepassword').post(protect, updatePassword);
router.route('/deleteme').delete(protect, deleteMe);

module.exports = router;
