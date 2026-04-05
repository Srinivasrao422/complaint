const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 5000 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);
