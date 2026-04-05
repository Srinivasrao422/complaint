const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    message: { type: String, default: '' },
    userId: { type: String },
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
