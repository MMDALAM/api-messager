const { default: mongoose } = require('mongoose');

const user = mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String },
    avatar: { type: String },
    status: { type: String, default: 'offline' },
    role: { type: String, default: 'user' },
    token: { type: String },
    last_login: { type: Date },
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
    avatar: { type: String },
  },
  { timestamps: true }
);

const userModel = mongoose.model('User', user);
module.exports = userModel;
