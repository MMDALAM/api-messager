const { handleSocketError } = require('./socketHandlers');

const userModel = require('../../models/user.model');

const setUserStatus = async (userId, status, socket, io) => {
  try {
    await userModel.findByIdAndUpdate(userId, { status });
    const onlineUsers = await userModel.find({ status: 'online' }, { username: 1, status: 1 });

    io.emit('onlineUsers', onlineUsers);
  } catch (error) {
    handleSocketError(socket, 'users', 'Failed to update user status');
  }
};

module.exports = setUserStatus;
