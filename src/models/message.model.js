const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const messageSchema = new mongoose.Schema(
  {
    seen: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    seen: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    fileUrl: String,
    delivered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.plugin(mongoosePaginate);

const messageModel = mongoose.model('Message', messageSchema);
module.exports = messageModel;
