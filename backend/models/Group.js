const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    inviteCode: { type: String, unique: true },
    plan: {
        type: String,
        enum: ['none', 'individual_weekly', 'individual_monthly', 'individual_yearly', 'duo_monthly', 'duo_yearly', 'family_monthly', 'family_yearly'],
        default: 'none'
    },
    memberLimit: { type: Number, default: 5 }, // Default free/basic limit? Or 5 for family
    planExpiry: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', GroupSchema);
