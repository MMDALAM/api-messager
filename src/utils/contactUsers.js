const socketIO = require('socket.io');
const userModel = require('../models/user.model');

const initSocket = (server) => {
  const io = socketIO(server, {
    reconnectionAttempts: 5, // تعداد تلاش مجدد
    reconnectionDelay: 1000, // فاصله زمانی بین تلاش‌ها به میلی‌ثانیه
    cors: { origin: '*' },
  });
  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.id}`);

    // event get userOnline
    socket.on('userOnline', async (users) => {
      const userId = users?.data?.userId;

      if (!userId || typeof userId !== 'string' || !userId.match(/^[0-9a-fA-F]{24}$/)) {
        console.error(`Invalid userId: ${userId}`);
        socket.emit('error', { message: 'Invalid userId format or userId not provided' });
        return;
      }

      try {
        // به‌روزرسانی وضعیت کاربر به 'online' در MongoDB
        await userModel.findByIdAndUpdate(userId, { status: 'online' });

        // ارسال لیست به‌روز شده کاربران آنلاین به همه کلاینت‌ها
        const onlineUsers = await userModel.find({ status: 'online' }, { username: 1, status: 1 });
        //events onlineUsers
        io.emit('onlineUsers', onlineUsers);
      } catch (error) {
        console.error('Error updating user status:', error);
        socket.emit('error', { message: 'Failed to update user status' });
      }
    });

    socket.on('error', (err) => {
      console.error('error in connect socket', err);
      // اقدامات لازم برای ارور
    });

    // مدیریت قطع ارتباط کاربر
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.id}`);

      // پیدا کردن کاربر با استفاده از socket.id و تغییر وضعیت به 'offline'
      const user = await userModel.findOneAndUpdate({ status: 'online' }, { status: 'offline' });

      if (user) {
        const onlineUsers = await userModel.find({ status: 'online' }, { username: 1, status: 1 });
        io.emit('onlineUsers', onlineUsers);
        console.log(`User ${user.username} went offline`);
      }
    });
  });
  return io;
};

module.exports = initSocket;
