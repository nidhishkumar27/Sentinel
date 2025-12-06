const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: {
        type: String,
        enum: ['TOURIST', 'AUTHORITY', 'AGENCY'],
        default: 'TOURIST'
    },

    // Agency Specific Fields
    agencyType: { type: String, enum: ['Police', 'Emergency', 'Tourism', 'Hospital', 'Volunteer'] },
    officialEmail: { type: String },
    officialPhone: { type: String },
    jurisdiction: { type: String },
    officerName: { type: String },
    designation: { type: String },
    officerId: { type: String },
    geoRadius: { type: Number },
    isOnline: { type: Boolean, default: true },

    agencyId: { type: String }, // Keep for backward compat or generic ID
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
