const mongoose = require('mongoose');

const complaintFeedbackSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    userId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ComplaintFeedback', complaintFeedbackSchema);
