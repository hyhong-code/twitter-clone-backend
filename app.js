const express = require('express');
const morgan = require('morgan');

const errorHandler = require('./controllers/errorController');

const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter.js');
const tweetRouter = require('./routes/tweetRouter');

const app = express();

// MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

// MOUNT ROUTERS
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tweets', tweetRouter);

// HANDLE ERROR
app.use(errorHandler);

module.exports = app;
