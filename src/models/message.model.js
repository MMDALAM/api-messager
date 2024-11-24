const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    content: { type: String, required: true },
    seen: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  },
  { timestamps: true }
);

messageSchema.plugin(mongoosePaginate);

const messageModel = mongoose.model('Message', messageSchema);
module.exports = messageModel;
