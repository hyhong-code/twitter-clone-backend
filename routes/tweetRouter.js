const express = require('express');
const {
  createTweet,
  getTweets,
  updateTweet,
  deleteTweets,
} = require('../controllers/tweetController');
const { protect } = require('../controllers/authController');

const commentRouter = require('./commentRouter');

const router = express.Router();

router.use('/:tweetId/comments', commentRouter);

router.route('/').post(protect, createTweet).get(getTweets);
router.route('/:id').patch(protect, updateTweet).delete(protect, deleteTweets);

module.exports = router;
