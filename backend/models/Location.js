const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

// Index for faster queries on specific users and time ranges
LocationSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Location', LocationSchema);
