const express = require('express');
const { protect, authorize } = require('../controllers/authController');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

// ALL ROUTES FOR ADMIN ONLY
router.use(protect);
router.use(authorize('admin'));

router.route('/').get(getUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
