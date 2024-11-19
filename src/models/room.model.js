const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    admin: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
    avatar: { type: String },
  },
  { timestamps: true }
);

const roomModel = mongoose.model('Room', roomSchema);
module.exports = roomModel;
