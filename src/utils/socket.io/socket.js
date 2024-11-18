const socketIO = require('socket.io');
const userStatusHandlers = require('./userStatus');
const contactEventHandlers = require('./contactEvents');
const roomEventHandlers = require('./roomEvents');
const messageEventHandlers = require('./messageEvents');
const Room = require('../../models/room.model');
const { roomsLists, broadcastUserLists } = require('./socketHandlers');
const setUserStatus = require('./userStatus');

const initSocket = (server) => {
  const io = socketIO(server, {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    cors: { origin: '*' },
  });

  io.on('connection', async (socket) => {
    const userId = getUserIdFromParams(socket);
    if (userId) {
      setUserStatus(userId, 'online', socket, io);
      // await roomsLists(io, userId);
    }

    // const roomsNamespace = io.of('/rooms');
    // roomsNamespace.on('connection', async (socket) => {
    //   const userId = getUserIdFromParams(socket);
    //   if (userId) {
    //     socket.join(userId);
    //     roomEventHandlers(socket, roomsNamespace, io, userId);
    //     // await roomsLists(io, userId);
    //   }
    // });

    socket.join(userId);
    socket.on('createRoom', async (data) => {
      try {
        const name = data?.data?.name;
        const members = data?.data?.members;
        const admin = data?.data?.admin;

        const newRoom = new Room({
          name: name,
          members: members,
          admin: [admin],
        });

        await newRoom.save();

        // ارسال اطلاعات گروه جدید به همه اعضا
        members.forEach(async (memberId) => {
          const userRooms = await Room.find({ members: memberId });
          io.to(memberId.toString()).emit('rooms', userRooms);
        });
      } catch (error) {
        console.log(error);
        handleSocketError(socket, 'Failed to create room');
      }
    });

    socket.on('disconnect', async () => {
      const userId = getUserIdFromParams(socket);
      if (userId) {
        await setUserStatus(userId, 'offline', socket, io);
      }
    });
  });

  // تنظیم فضای نام برای وضعیت کاربران
  // const userStatusNamespace = io.of('/userStatus');
  // userStatusNamespace.on('connection', (socket) => {
  //   const userId = getUserIdFromParams(socket);
  //   if (userId) {
  //     await userModel.findByIdAndUpdate(userId, { status });
  //     await broadcastUserLists(namespace);
  //     userStatusHandlers(socket, userStatusNamespace, userId);
  //   }
  // });

  // تنظیم فضای نام برای مخاطبین
  // const contactsNamespace = io.of('/contacts');
  // contactsNamespace.on('connection', (socket) => {
  //   const userId = getUserIdFromParams(socket);
  //   if (userId) {
  //     contactEventHandlers(socket, contactsNamespace, userId);
  //   }
  // });

  // تنظیم فضای نام برای گروه‌ها

  // تنظیم فضای نام برای پیام‌ها
  // const messagesNamespace = io.of('/messages');
  // messagesNamespace.on('connection', (socket) => {
  //   // const userId = getUserIdFromParams(socket);
  //   // if (userId) {
  //   messageEventHandlers(socket, messagesNamespace);
  //   // }
  // });

  return io;
};

// دریافت userId از params
const getUserIdFromParams = (socket) => {
  const userId = socket.handshake.query.id;
  if (!userId || typeof userId !== 'string' || !userId.match(/^[0-9a-fA-F]{24}$/)) {
    socket.emit('error', { message: 'Invalid userId' });
    return null;
  }
  return userId;
};

module.exports = initSocket;
