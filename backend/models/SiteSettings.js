const mongoose = require('mongoose');

const hospitalEntry = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  { _id: false }
);

const siteSettingsSchema = new mongoose.Schema(
  {
    /** Society-level note (e.g. ID verification policy) — shown to admins & optionally members */
    govIdRegistryNote: { type: String, default: '', maxlength: 2000 },
    policeStationName: { type: String, default: '', maxlength: 200 },
    policeStationPhone: { type: String, default: '', maxlength: 30 },
    policeStationAddress: { type: String, default: '', maxlength: 500 },
    hospitals: { type: [hospitalEntry], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
