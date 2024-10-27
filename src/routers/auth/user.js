const router = require('express').Router();

//****controllers****
const userController = require('../../controllers/api/user.controller');
const { verify } = require('../../middlewares/auth.widdleware');

//****user****
router.get('/', verify, userController.findMany);
router.delete('/:id', verify, userController.delete);

module.exports = { userRouter: router };
