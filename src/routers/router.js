const router = require('express').Router();

//**********router api***********/
const { apiRouter } = require('./api/api');
router.use('/api/v1', apiRouter);

const { authRouter } = require('./auth/auth');
router.use('/api/v1/auth', authRouter);

module.exports = { AllRouters: router };
