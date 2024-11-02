const router = require('express').Router();

//**********router api***********/
const { apiRouter } = require('./api/api');
router.use('/api/v1', apiRouter);

//**********router auth***********/
const { authRouter } = require('./auth/auth');
router.use('/api/v1/auth', authRouter);

//**********router user***********/
const { userRouter } = require('./auth/user');
router.use('/api/v1/users', userRouter);

module.exports = { AllRouters: router };
