const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    apartmentNumber: { type: String, required: true, trim: true, maxlength: 50 },
    block: { type: String, required: true, trim: true, maxlength: 50 },
    name: { type: String, required: true, trim: true, maxlength: 120 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Apartment', apartmentSchema);
