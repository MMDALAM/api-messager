const userModel = require('../../models/user.model');

// مدیریت خطاها
const socketMessage = (socket, method, type, message) => {
  socket.emit('messages', { method: method, type, message });
};


//     const users = await userModel.find({}, { username: 1, status: 1 }).sort({
//       status: -1,
//     });
//     io.emit('users', users);

//     // io.emit('onlineUsers', onlineUsers);
//   } catch (error) {
//     console.error('Error broadcasting user lists:', error);
//   }
// };

// const roomsLists = async (io, id) => {
//   try {
//     const rooms = await Room.find({ members: id });
//     io.emit('rooms', rooms);
//   } catch (error) {
//     console.error('Error broadcasting user lists:', error);
//   }
// };

// // اعتبارسنجی userId
// const validateUserId = (socket) => {
//   const userId = socket.handshake.query.id;
//   if (!userId || typeof userId !== 'string' || !userId.match(/^[0-9a-fA-F]{24}$/)) {
//     socket.emit('error', { message: 'Invalid userId' });
//     return null;
//   }
//   return userId;
// };

module.exports = {
  socketMessage,
};
