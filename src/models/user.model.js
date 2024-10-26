const { default: mongoose } = require('mongoose');

const user = mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, unique: true },
    avatar: { type: String },
    status: { type: String, default: 'offline' },
    role: { type: String, default: 'user' },
    last_login: { type: Date },
  },
  { timestamps: true }
);

const userModel = mongoose.model('User', user);
module.exports = userModel;
