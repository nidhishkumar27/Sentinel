const mongoose = require('mongoose');

const OfficerSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Agency Details
    agencyName: { type: String, required: true }, // Equivalent to 'name'
    agencyType: { type: String, enum: ['Police', 'Emergency', 'Tourism Department', 'Hospital', 'Volunteer', 'Fire'] },

    // Contact & Jurisdiction
    officialEmail: { type: String },
    officialPhone: { type: String },
    jurisdiction: { type: String },
    geoRadius: { type: Number, default: 5 },

    // Officer Specifics
    officerName: { type: String, required: true },
    designation: { type: String },
    officerId: { type: String, required: true, unique: true },

    role: { type: String, default: 'AUTHORITY' },
    isOnline: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Officer', OfficerSchema);
