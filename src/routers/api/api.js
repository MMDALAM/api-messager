const router = require('express').Router();

//****controllers****
const userController = require('../../controllers/api/user.controller');
const roomController = require('../../controllers/api/room.controller');
const messageController = require('../../controllers/api/message.controller');

//****api****
//****users****
router.get('/users', userController.findMany);
//****rooms****
router.get('/rooms/:id', roomController.findManyRooms);
router.delete('/rooms/:room/:id', roomController.deleteRooms);
//****message****
router.get('/msg/:id', messageController.findMany);

module.exports = { apiRouter: router };
