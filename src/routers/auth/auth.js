const router = require('express').Router();

//****controllers****
const authController = require('../../controllers/api/auth.controller');
const { verify } = require('../../middlewares/auth.widdleware');

//****api****
router.post('/', authController.auth);
router.post('/verify', verify, authController.verify);
router.post('/user', verify);

module.exports = { authRouter: router };
