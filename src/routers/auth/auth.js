const router = require('express').Router();

//****controllers****
const authController = require('../../controllers/api/auth.controller');
const { verifyUser } = require('../../middlewares/auth.widdleware');

//****auth****
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify', verifyUser);

module.exports = { authRouter: router };
