const socketIO = require('socket.io');
const Room = require('../../models/room.model');
const { handleSocketError } = require('./socketHandlers');
const setUserStatus = require('./userStatus');
const User = require('../../models/user.model');
const Message = require('../../models/message.model');

const initSocket = (server) => {
  const io = socketIO(server, {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    cors: { origin: '*' },
  });

  io.on('connection', async (socket) => {
    const userId = await getUserIdFromParams(socket);
    if (userId) {
      setUserStatus(userId, 'online', socket, io);
    }

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
            .populate('lastMessage', ['content', 'createdAt'])
            .exec();
          io.to(memberId.toString()).emit('rooms', userRooms);
        });
      } catch (error) {
        return handleSocketError(socket, 'room', error.message);
      }
    });

    socket.on('sendMessage', async (data) => {
      try {
        const roomId = data?.data?.roomId;
        const content = data?.data?.content;

        // بررسی عضویت کاربر در روم
        const room = await Room.findById(roomId);
        if (!room) {
          return handleSocketError(socket, 'message', 'Room not found');
        }

        if (!room.members.includes(userId)) {
          return handleSocketError(socket, 'message', 'You are not a member of this room');
        }

        // ایجاد پیام جدید
        const newMessage = new Message({
          room: roomId,
          sender: userId,
          content,
          // seen: [userId], // فرستنده پیام رو دیده
        });

        await newMessage.save();

        room.lastMessage = newMessage._id;
        await room.save();
        // پاپیولیت کردن اطلاعات فرستنده
        const newMsg = await Message.findById(newMessage._id, { room: 1, sender: 1, content: 1, createdAt: 1 })
          .populate('sender', ['username', 'createdAt'])
          .populate({
            path: 'room',
            select: ['title', 'createdAt', 'admin', 'lastMessage'],
            populate: [
              {
                path: 'lastMessage',
                select: ['content', 'createdAt'],
              },
              {
                path: 'admin',
                select: ['username', 'createdAt'],
              },
            ],
          })
          .exec();

        // ارسال پیام به همه اعضای روم
        room.members.forEach((memberId) => {
          io.to(memberId.toString()).emit('newMsg', newMsg);
        });
      } catch (error) {
        return handleSocketError(socket, 'message', error.message);
      }
    });

    socket.on('disconnect', async () => {
      const userId = getUserIdFromParams(socket);
      if (userId) {
        await setUserStatus(userId, 'offline', socket, io);
      }
    });
  });
  return io;
};

const getUserIdFromParams = async (socket) => {
  const userId = socket.handshake.query.id;
  const users = await User.findById(userId);
  if (!userId || typeof userId !== 'string' || !userId.match(/^[0-9a-fA-F]{24}$/) || !users) {
    // if (users) return true;
    return handleSocketError(socket, 'error', 'Invalid userId');
  }
  return userId;
};

module.exports = initSocket;
