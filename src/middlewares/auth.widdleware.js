const JWT = require('jsonwebtoken');
const createError = require('http-errors');
const userModel = require('../models/user.model');

exports.verify = async (req, res, next) => {
  try {
    const token = req?.headers['authorization'].split(' ')[1] || [];
    if (!token) throw createError(401, 'Access denied. No token provided.');
    JWT.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_USER, async (err, paylod) => {
      if (err) return res.status(403).json({ error: 'Invalid token.' });
      const user = await userModel.findById(paylod.id);
      return res.status(200).json({ message: 'Token is valid', user: user });
    });
  } catch (err) {
    next(err);
  }
};
