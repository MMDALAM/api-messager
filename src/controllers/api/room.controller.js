const userModel = require('../../models/user.model');
const controller = require('../contoller');
const Room = require('../../models/room.model');

class roomController extends controller {
  async findManyRooms(req, res, next) {
    try {
      const { id } = req.params;
      const room = await Room.find({ members: id });
      return res.status(200).json({ room: room });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'Invalid user ID' });
      const users = await userModel.findOneAndDelete({ _id: id });
      if (!users) return res.status(404).json({ message: 'User not found' });
      return res.status(200).json({ message: 'User Deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new roomController();
