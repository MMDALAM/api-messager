const router = require('express').Router();

//****controllers****
const userController = require('../../controllers/api/user.controller');

//****api****
router.get('/users', userController.findMany);

module.exports = { apiRouter: router };
