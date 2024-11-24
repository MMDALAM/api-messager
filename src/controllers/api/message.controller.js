const controller = require('../contoller');
const { isValidMongoId } = require('../../utils/function');
const Message = require('../../models/message.model');

class messageController extends controller {
  async findManyRooms(req, res, next) {
    try {
      const { id } = req.params;
      if (!isValidMongoId(id)) return res.status(200).json({ message: 'Not Valid MongoDB' });

      let page = parseInt(req.query.page) || 1;
      let options = { sort: { createdAt: -1 }, limit: 10 };

      const messages = await Message.paginate(
        { members: id },
        {
          options,
          page,
          populate: [
            { path: 'sender', select: ['username', 'createdAt'] },
            { path: 'room', select: ['title', 'createdAt'] },
            { path: 'lastMessage', select: ['content', 'createdAt'] },
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
