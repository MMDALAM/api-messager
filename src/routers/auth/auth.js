const router = require('express').Router();

//****controllers****
const authController = require('../../controllers/api/auth.controller');
const { verify, verifyUser } = require('../../middlewares/auth.widdleware');

//****api****
router.post('/', authController.auth);
router.get('/users', verify, authController.findMany);
router.delete('/users/:id', verify, authController.delete);
router.post('/verify', verifyUser);

module.exports = { authRouter: router };
