const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const roomSchema = new mongoose.Schema(
  {
    title: { type: String, default: null },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    admin: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
    avatar: { type: String },
  },
  { timestamps: true }
);

roomSchema.plugin(mongoosePaginate);

const roomModel = mongoose.model('Room', roomSchema);
module.exports = roomModel;
