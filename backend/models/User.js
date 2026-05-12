const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String },
    subscription: {
        type: String,
        enum: ['free', 'weekly', 'monthly', 'yearly', 'group'],
        default: 'free'
    },
    subscriptionExpiry: { type: Date },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
