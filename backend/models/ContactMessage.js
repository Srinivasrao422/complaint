const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    userId: { type: String, default: '', index: true },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    subject: { type: String, default: '' },
    body: { type: String, default: '' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
