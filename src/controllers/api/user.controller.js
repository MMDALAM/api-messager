const userModel = require('../../models/user.model');
const { isValidMongoId } = require('../../utils/function');
const controller = require('../contoller');

class userController extends controller {
  async findMany(req, res, next) {
    try {
      const users = await userModel.find({}, { username: 1, status: 1 });
      if (!users) return res.status(404).json({ message: 'User not found' });
      return res.status(200).json({ users: users });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      if (!isValidMongoId(id)) return res.status(200).json({ message: 'Not Valid MongoDB' });
      const users = await userModel.findOneAndDelete({ _id: id });
      if (!users) return res.status(404).json({ message: 'User not found' });
      return res.status(200).json({ message: 'User Deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new userController();
