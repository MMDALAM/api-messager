const Message = require('../../models/message.model');
const { handleSocketError } = require('./socketHandlers');
const Room = require('../../models/room.model');

const messageEventHandlers = (socket, namespace) => {
  socket.on('sendMessage', async ({ data }) => {
    try {
      const content = data?.content;
      const sender = data?.userId;
      const roomId = data?.roomId;
      const newMessage = new Message({ content, sender: sender, room: roomId });
      await newMessage.save();
      await Room.findByIdAndUpdate(roomId, {
        $push: {
          messages: newMessage._id,
        },
      });
      console.log(roomId);
      socket.join(roomId);
      namespace.to(roomId).emit('messages', newMessage);
    } catch (error) {
      handleSocketError(socket, 'Failed to send message');
    }
  });

  socket.on('getMessages', async (roomId) => {
    try {
      const messages = await Message.find({ room: roomId });
      socket.emit('messages', messages);
    } catch (error) {
      handleSocketError(socket, 'Failed to fetch messages');
    }
  });
};

module.exports = messageEventHandlers;
