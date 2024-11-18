const { broadcastUserLists, handleSocketError } = require('./socketHandlers');

const userStatusHandlers = (socket, io, userId) => {
  setUserStatus(userId, 'online', socket, io);

  socket.on('disconnect', async () => {
    await setUserStatus(userId, 'offline', socket, io);
  });
};
const userModel = require('../../models/user.model');

const setUserStatus = async (userId, status, socket, io) => {
  try {
    await userModel.findByIdAndUpdate(userId, { status });
    const onlineUsers = await userModel.find({ status: 'online' }, { username: 1, status: 1 });
    const allUsers = await userModel.find({}, { username: 1, status: 1 });

    io.emit('onlineUsers', onlineUsers);
    io.emit('allUsers', allUsers);
  } catch (error) {
    handleSocketError(socket, 'Failed to update user status');
  }
};

module.exports = setUserStatus;
