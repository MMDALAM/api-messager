const socketIO = require('socket.io');
const userModel = require('../models/user.model');

// تابع اصلی برای راه‌اندازی سوکت
const initSocket = (server) => {
  const io = socketIO(server, {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    cors: { origin: '*' },
  });

  const userStatus = io.of('/userStatus');

  userStatus.on('connection', async (socket) => {
    try {
      const userId = validateUserId(socket);
      if (!userId) return;

      await setUserStatus(userId, 'online', socket, userStatus);

      // تعریف رویدادها
      socket.on('contact', () => contactEvent(socket));
      socket.on('disconnect', () => disconnectEvent(socket, userId, userStatus));
    } catch (error) {
      handleSocketError(socket, 'Failed to handle connection');
    }
  });

  return io;
};

// تابعی برای اعتبارسنجی userId
const validateUserId = (socket) => {
  const userId = socket.handshake.query.id;
  if (!userId || typeof userId !== 'string' || !userId.match(/^[0-9a-fA-F]{24}$/)) {
    socket.emit('error', { message: 'Invalid userId format or userId not provided' });
    return null;
  }
  return userId;
};

// تابع برای تنظیم وضعیت کاربر
const setUserStatus = async (userId, status, socket, userStatus) => {
  try {
    const user = await userModel.findByIdAndUpdate(userId, { status });
    if (!user) {
      socket.emit('error', { message: 'User Not Found' });
      return;
    }
    await broadcastUserLists(userStatus);
  } catch (error) {
    handleSocketError(socket, 'Failed to update user status');
  }
};

// رویداد برای درخواست مخاطبین
const contactEvent = async (socket) => {
  try {
    const allUsers = await userModel.find({}, { username: 1, status: 1 });
    socket.emit('contact', allUsers);
  } catch (error) {
    handleSocketError(socket, 'Failed to fetch contacts');
  }
};

// رویداد قطع ارتباط
const disconnectEvent = async (socket, userId, userStatus) => {
  try {
    await setUserStatus(userId, 'offline', socket, userStatus);
    console.log(`User ${userId} went offline`);
  } catch (error) {
    handleSocketError(socket, 'Failed to handle disconnect');
  }
};

// تابع برای ارسال لیست کاربران آنلاین و کل کاربران به همه کلاینت‌ها
const broadcastUserLists = async (userStatus) => {
  try {
    const onlineUsers = await userModel.find({ status: 'online' }, { username: 1, status: 1 });
    const allUsers = await userModel.find({}, { username: 1, status: 1 });
    userStatus.emit('onlineUsers', onlineUsers);
    userStatus.emit('allUsers', allUsers);
  } catch (error) {
    console.error('Error broadcasting user lists:', error);
  }
};

// تابع مدیریت خطا
const handleSocketError = (socket, message) => {
  console.error(message);
  socket.emit('error', { message });
};

module.exports = initSocket;
