const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const qrngSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    keyFileName: { type: String, required: true },
    keyFilePath: { type: String, required: true },
    currentIndex: { type: Number, default: 0, required: true },
    isExhausted: { type: Boolean, default: true },
    totalKeyLength: { type: Number, required: true },
  },
  { timestamps: true }
);

const qrngModel = mongoose.model('Qrng', qrngSchema);
module.exports = qrngModel;
