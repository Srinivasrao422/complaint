const mongoose = require('mongoose');

const statusHistoryEntry = new mongoose.Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, required: true },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const victimDetailsSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    apartmentNumber: { type: String, default: '' },
    block: { type: String, default: '' },
    address: { type: String, default: '' },
    additionalDetails: { type: String, default: '' },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 5000 },
    category: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    imageUrl: { type: String, default: '' },
    statusHistory: { type: [statusHistoryEntry], default: [] },
    adminNotes: { type: String, default: '' },
    assignedDepartment: { type: String, default: '' },
    feedbackProvided: { type: Boolean, default: false },
    /** Snapshot of complainant details at submission time */
    victimDetails: { type: victimDetailsSchema, default: undefined },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
