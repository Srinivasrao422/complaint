const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 5000 },
    category: { type: String, required: true, maxlength: 80 },
    adminResponse: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Suggestion', suggestionSchema);
