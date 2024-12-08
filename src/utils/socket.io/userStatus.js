const userModel = require('../../models/user.model');

const setUserStatus = async (userId, status, socket, io) => {
  try {
    await userModel.findByIdAndUpdate(userId, { status });
    const users = await userModel.find({}, { username: 1, status: 1 }).sort({
      status: -1,
    });
    if (!users) return socketMessage(socket, 'error', 'users', 'این گروه قبلاً ایجاد شده است');

    io.emit('users', users);
  } catch (error) {
    return socketMessage(socket, 'error', 'user', error.message);
  }
};

module.exports = setUserStatus;
