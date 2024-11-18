const userModel = require('../../models/user.model');
const { handleSocketError } = require('./socketHandlers');

const contactEventHandlers = (socket, namespace, userId) => {
  socket.on('getContacts', async () => {
    try {
      const contacts = await userModel.find({}, { username: 1, status: 1 });
      socket.emit('contacts', contacts);
    } catch (error) {
      handleSocketError(socket, 'Failed to fetch contacts');
    }
  });
};

module.exports = contactEventHandlers;
