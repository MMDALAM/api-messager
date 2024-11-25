const controller = require('../contoller');
const { isValidMongoId } = require('../../utils/function');
const Message = require('../../models/message.model');
const Room = require('../../models/room.model');

class messageController extends controller {
  async findMany(req, res, next) {
    try {
      const { id } = req.params;
      if (!isValidMongoId(id)) return res.status(200).json({ message: 'Not Valid MongoDB' });

      const room = await Room.findById(id);

      let page = parseInt(req.query.page) || 1;

      const messages = await Message.paginate(
        { room: room.id },
        {
          sort: { createdAt: 1 },
          limit: 30,
          page,
          populate: [
            { path: 'sender', select: ['username', 'createdAt'] },
            { path: 'room', select: ['title', 'createdAt'], populate: [{ path: 'lastMessage', select: ['content', 'createdAt'] }] },
          ],
        }
      );
      return res.status(200).json({ messages: messages });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new messageController();
