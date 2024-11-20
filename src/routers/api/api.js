const router = require('express').Router();

//****controllers****
const userController = require('../../controllers/api/user.controller');
const roomController = require('../../controllers/api/room.controller');

//****api****
router.get('/users', userController.findMany);
router.get('/rooms/:id', roomController.findManyRooms);
router.delete('/rooms/:id', roomController.deleteRooms);

module.exports = { apiRouter: router };
