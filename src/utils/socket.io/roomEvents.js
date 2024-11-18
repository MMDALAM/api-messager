const Room = require('../../models/room.model');
const { handleSocketError, roomsLists } = require('./socketHandlers');
const userModel = require('../../models/user.model');
const userSocketMap = {};

const roomEventHandlesdsdrs = (socket, namespace, io, userId) => {
  socket.on('createRoom', async (data) => {
    try {
      const name = data?.data?.name;
      const members = data?.data?.members;
      const admin = data?.data?.admin;
      const newRoom = new Room({ name, members, admin });
      await newRoom.save();
      members.forEach(async (e) => {
        await userModel.findByIdAndUpdate(e, {
          $push: {
            rooms: newRoom._id,
          },
        });
      });
      namespace.emit('rooms', newRoom);
      console.log('send new room');
      await roomsLists(io, userId);
    } catch (error) {
      console.log(error);
      handleSocketError(socket, 'Failed to create room');
    }
  });
};

const roomEventHandlers = (socket, namespace, io, userId) => {
  // ایجاد گروه جدید
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
        namespace.to(memberId.toString()).emit('rooms', userRooms);
      });
    } catch (error) {
      console.log(error);
      handleSocketError(socket, 'Failed to create room');
    }
  });
};

module.exports = roomEventHandlers;
