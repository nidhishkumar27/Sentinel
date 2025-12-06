const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    type: {
        type: String,
        enum: ['PANIC', 'HARASSMENT', 'MEDICAL', 'LOST', 'OTHER'],
        required: true
    },
    description: String,
    location: {
        x: Number,
        y: Number,
        lat: Number,
        lng: Number
    },
    status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED'],
        default: 'PENDING'
    },
    riskScore: Number,
    timestamp: { type: Number, default: Date.now },

    // Agency Response Fields
    responder: {
        name: String,
        designation: String,
        contact: String
    },
    timeline: [{
        status: String,
        note: String,
        timestamp: { type: Number, default: Date.now }
    }],
    resolutionNotes: String
});

module.exports = mongoose.model('Alert', AlertSchema);
