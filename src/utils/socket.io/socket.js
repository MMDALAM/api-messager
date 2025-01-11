const socketIO = require('socket.io');
const Room = require('../../models/room.model');
const { socketMessage } = require('./socketHandlers');
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
        if (!data?.data) {
          return socketMessage(socket, 'error', 'room', 'Invalid data format');
        }
        const title = data?.data?.title;
        const members = data?.data?.members;
        const admin = data?.data?.admin;
        const description = data?.data?.description;

        if (members.length < 2) return socketMessage(socket, 'error', 'Room', 'members must be at least two member');

        if (!title) return socketMessage(socket, 'error', 'Room', 'Title is empty');

        const validateMember = await findUser(socket, members);
        if (!validateMember) return socketMessage(socket, 'error', 'members', `Not Found UserID`);
        const validateAdmin = await findUser(socket, admin);
        if (!validateAdmin) return socketMessage(socket, 'error', 'admin', `Not Found UserID`);

        const newRoom = new Room({
          title: title,
          members: members,
          admin: admin,
          description: description || '',
        });

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
        return socketMessage(socket, 'error', 'room', error.message);
      }
    });

    socket.on('sendMessage', async (data) => {
      try {
        const roomId = data?.data?.roomId;
        const content = data?.data?.content;

        // بررسی عضویت کاربر در روم
        const room = await Room.findById(roomId);
        if (!room) {
          return socketMessage(socket, 'error', 'message', 'Room not found');
        }

        if (!room.members.includes(userId)) {
          return socketMessage(socket, 'error', 'message', 'You are not a member of this room');
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
        room.members.forEach(async (memberId) => {
          io.to(memberId.toString()).emit('newMsg', newMsg);
          const userRooms = await Room.find({ members: memberId })
            .sort({ lastMessage: -1 })
            .populate('members', ['username', 'createdAt'])
            .populate('admin', ['username', 'createdAt'])
            .populate('lastMessage', ['content', 'createdAt'])
            .sort({ 'lastMessage.createdAt': -1 })
            .exec();
          io.to(memberId.toString()).emit('rooms', userRooms);
        });
      } catch (error) {
        return socketMessage(socket, 'error', 'message', error.message);
      }
    });

    socket.on('deleteRoom', async (data) => {
      try {
        const roomId = data?.data?.roomId;
        const adminId = data?.data?.adminId;

        const rooms = await Room.findById(roomId);
        if (!rooms) return socketMessage(socket, 'error', 'deleteRoom', 'Room not found');

        const user = await User.findById(adminId);
        if (!user) return socketMessage(socket, 'error', 'deleteRoom', 'User not found');

        const members = rooms.members;

        if (rooms.admin.includes(user.id)) {
          await Message.deleteMany({ room: rooms.id });

          await Room.findByIdAndDelete(rooms.id);

          members.forEach(async (memberId) => {
            const userRooms = await Room.find({ members: memberId })
              .sort({ lastMessage: -1 })
              .populate('members', ['username', 'createdAt'])
              .populate('admin', ['username', 'createdAt'])
              .populate('lastMessage', ['content', 'createdAt'])
              .sort({ 'lastMessage.createdAt': -1 })
              .exec();
            io.to(memberId.toString()).emit('rooms', userRooms);
          });
          return socketMessage(socket, 'success', 'deleteRoom', 'Room deleted');
        }

        return socketMessage(socket, 'error', 'deleteRoom', 'No Access to delete room');
      } catch (error) {
        return socketMessage(socket, 'error', 'deletRoom', error.message);
      }
    });

    socket.on('disconnect', async () => {
      try {
        const userId = await getUserIdFromParams(socket);
        if (userId) {
          await setUserStatus(userId, 'offline', socket, io);
        }
      } catch (error) {
        return socketMessage(socket, 'error', 'offline', 'error to disconnect');
      }
    });
  });
  return io;
};

const getUserIdFromParams = async (socket) => {
  const userId = socket.handshake.query.id;
  const users = await User.findById(userId);
  if (!userId || typeof userId !== 'string' || !userId.match(/^[0-9a-fA-F]{24}$/) || !users) {
    return socketMessage(socket, 'error', 'online', 'Invalid userId');
  }
  return userId;
};

const findUser = async (socket, users) => {
  try {
    await Promise.all(
      users.map(async (userId) => {
        const user = await User.findById(userId);
        if (!user) throw new Error(`Not Found UserID : ${userId}`);
      })
    );
    return true;
  } catch (error) {
    socketMessage(socket, 'error', 'users', error.message);
    return false;
  }
};

module.exports = initSocket;
