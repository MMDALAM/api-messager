const userModel = require('../../models/user.model');
const Room = require('../../models/room.model');

// مدیریت خطاها
const handleSocketError = (socket, message) => {
  console.error(message);
  socket.emit('error', { message });
};

// ارسال لیست کاربران به همه کلاینت‌ها
const broadcastUserLists = async (io) => {
  try {
    const onlineUsers = await userModel.find({ status: 'online' }, { username: 1, status: 1 });
    const allUsers = await userModel.find({}, { username: 1, status: 1 });

    io.emit('onlineUsers', onlineUsers);
    io.emit('allUsers', allUsers);
  } catch (error) {
    console.error('Error broadcasting user lists:', error);
  }
};

const roomsLists = async (io, id) => {
  try {
    const rooms = await Room.find({ members: id });
    io.emit('rooms', rooms);
  } catch (error) {
    console.error('Error broadcasting user lists:', error);
  }
};

// اعتبارسنجی userId
const validateUserId = (socket) => {
  const userId = socket.handshake.query.id;
  if (!userId || typeof userId !== 'string' || !userId.match(/^[0-9a-fA-F]{24}$/)) {
    socket.emit('error', { message: 'Invalid userId' });
    return null;
  }
  return userId;
};

module.exports = {
  handleSocketError,
  broadcastUserLists,
  validateUserId,
  roomsLists,
};
