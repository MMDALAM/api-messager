const socketIO = require('socket.io');
const userStatusHandlers = require('./userStatus');
const contactEventHandlers = require('./contactEvents');
const roomEventHandlers = require('./roomEvents');
const messageEventHandlers = require('./messageEvents');
const Room = require('../../models/room.model');
const { roomsLists, broadcastUserLists, handleSocketError } = require('./socketHandlers');
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
        const title = data?.data?.title;
        const members = data?.data?.members;
        const admin = data?.data?.admin;
        const description = data?.data?.description;

        if (members.length < 2) {
          return handleSocketError(socket, 'room', 'members must be at least two member');
        }

        const newRoom = new Room({
          title: title,
          members: members,
          admin: [admin],
          description: description || '',
        });

        if (!title) return handleSocketError(socket, 'room', 'title cannot be empty');

        await newRoom.save();

        // ارسال اطلاعات گروه جدید به همه اعضا
        members.forEach(async (memberId) => {
          const userRooms = await Room.find({ members: memberId })
            .populate('members', ['username', 'createdAt'])
            .populate('admin', ['username', 'createdAt'])
            .exec();

          io.to(memberId.toString()).emit('rooms', userRooms);
        });
      } catch (error) {
        return handleSocketError(socket, 'room', 'Failed to create room');
      }
    });

    socket.on('disconnect', async () => {
      const userId = getUserIdFromParams(socket);
      if (userId) {
        await setUserStatus(userId, 'offline', socket, io);
      }
    });
  });

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
    return handleSocketError(socket, 'error', 'Invalid userId');
  }
  return userId;
};

module.exports = initSocket;
