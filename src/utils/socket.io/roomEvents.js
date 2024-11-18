// const Room = require('../../models/room.model');
// const { handleSocketError, roomsLists } = require('./socketHandlers');
// const userModel = require('../../models/user.model');
// const userSocketMap = {};

// const roomEventHandlesdsdrs = (socket, namespace, io, userId) => {
//   socket.on('createRoom', async (data) => {
//     try {
//       const name = data?.data?.name;
//       const members = data?.data?.members;
//       const admin = data?.data?.admin;
//       const newRoom = new Room({ name, members, admin });
//       await newRoom.save();
//       members.forEach(async (e) => {
//         await userModel.findByIdAndUpdate(e, {
//           $push: {
//             rooms: newRoom._id,
//           },
//         });
//       });
//       namespace.emit('rooms', newRoom);
//       console.log('send new room');
//       await roomsLists(io, userId);
//     } catch (error) {
//       console.log(error);
//       handleSocketError(socket, 'Failed to create room');
//     }
//   });
// };
// module.exports = roomEventHandlers;
