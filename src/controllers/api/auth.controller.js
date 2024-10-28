const userModel = require('../../models/user.model');
const { jwtSign, hashPass, comparePass } = require('../../utils/function');
const controller = require('../contoller');
const { authSchema } = require('../../validators/auth.validator');

class authController extends controller {
  async register(req, res, next) {
    try {
      await authSchema.validateAsync(req.body);
      const { username, password } = req.body;
      const hashPassword = await hashPass(password);
      const NewUser = new userModel({ username, password: hashPassword });
      await NewUser.save();
      const token = await jwtSign(NewUser._id);
      return res.status(201).json({
        message: 'User Register successfully',
        method: 'Register',
        token: token,
        user: NewUser,
      });
    } catch (err) {
      if (err.code == 11000) return res.status(401).json({ message: 'Username already exists' });
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      await authSchema.validateAsync(req.body);
      const { username, password } = req.body;
      const user = await userModel.findOne({ username }, { __v: 0, token: 0, updatedAt: 0 });
      if (!user || !(await comparePass(password, user.password))) return res.status(401).json({ message: 'Invalid username or password' });
      const token = await jwtSign(user.id);
      return res.status(200).json({
        message: 'User Login successfully',
        method: 'Login',
        token: token,
        user: user,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new authController();
