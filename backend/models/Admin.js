const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' },
    resetOtp: { type: String },
    otpExpiry: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
