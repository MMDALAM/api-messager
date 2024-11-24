const controller = require('../contoller');
const Room = require('../../models/room.model');
const { isValidMongoId } = require('../../utils/function');
const User = require('../../models/user.model');

class roomController extends controller {
  async findManyRooms(req, res, next) {
    try {
      const { id } = req.params;
      if (!isValidMongoId(id)) return res.status(200).json({ message: 'Not Valid MongoDB' });

      const room = await Room.find({ members: id })
        .sort({ lastMessage: -1 })
        .populate('members', ['username', 'createdAt'])
        .populate('admin', ['username', 'createdAt'])
        .populate('lastMessage', ['content', 'createdAt'])
        .sort({ 'lastMessage.createdAt': -1 })
        .exec();

      return res.status(200).json({ room: room });
    } catch (err) {
      next(err);
    }
  }

  async deleteRooms(req, res, next) {
    try {
      const { id, room } = req.params;
      if (!isValidMongoId(id)) return res.status(200).json({ message: 'Not Valid MongoDB' });
      if (!isValidMongoId(room)) return res.status(200).json({ message: 'Not Valid MongoDB' });
      const rooms = await Room.findOne({ _id: room });
      if (!rooms) return res.status(404).json({ message: 'Room not found' });
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (rooms.admin.includes(id)) {
        await Room.findOneAndDelete({ _id: room });
        return res.status(200).json({ message: 'Room Deleted' });
      }
      return res.status(404).json({ message: 'No Access to delete room' });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
}

module.exports = new roomController();
