const mongoose = require('mongoose');

function maskAadhaar(digits) {
  const d = String(digits || '').replace(/\D/g, '');
  if (d.length < 4) return '';
  return `********${d.slice(-4)}`;
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    /** Set when the user signs in with Google (sub from ID token). */
    googleId: { type: String, sparse: true, unique: true, trim: true },
    password: {
      type: String,
      select: false,
      required: function reqPassword() {
        return !this.googleId;
      },
    },
    /** Optional normalized phone number for OTP / SMS logins */
    phoneNumber: { type: String, unique: true, sparse: true, trim: true, maxlength: 30, default: '' },
    /** One-time password and expiry for phone login */
    otp: { type: String, select: false, default: '' },
    otpExpiry: { type: Date, select: false },
    googleId: { type: String, sparse: true, unique: true, trim: true },
    password: {
      type: String,
      select: false,
      required: function reqPassword() {
        return !this.googleId;
      },
    },
    role: { type: String, enum: ['member', 'admin', 'user'], default: 'member' },
    adminRole: { type: String, default: null },
    phone: { type: String, default: '', maxlength: 30 },
    accountStatus: { type: String, enum: ['active', 'blocked'], default: 'active' },
    aadhaar: { type: String, default: '', select: false },
    govIdType: { type: String, default: '', maxlength: 40 },
    city: { type: String, default: '', maxlength: 80 },
    district: { type: String, default: '', maxlength: 80 },
    state: { type: String, default: '', maxlength: 80 },
    policeStationName: { type: String, default: '', maxlength: 200 },
    policeContactName: { type: String, default: '', maxlength: 120 },
    policeContactPhone: { type: String, default: '', maxlength: 30 },
    hospitalName: { type: String, default: '', maxlength: 200 },
    hospitalPhone: { type: String, default: '', maxlength: 30 },
    hospitalAddress: { type: String, default: '', maxlength: 500 },
    /** Full residential / mailing address (member portal) */
    residentialAddress: { type: String, default: '', maxlength: 500 },
    /** Free-form notes (accessibility, alternate contact, etc.) */
    additionalDetails: { type: String, default: '', maxlength: 1000 },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    const ad = String(ret.aadhaar || '').replace(/\D/g, '');
    if (ad.length >= 4) {
      ret.aadhaarMasked = maskAadhaar(ret.aadhaar);
    }
    delete ret.aadhaar;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);