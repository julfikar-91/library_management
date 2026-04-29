const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    memberId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    password: { type: String, required: true },
    role: { type: String, default: 'student' },
    department: { type: String },
    semester: { type: String },
    membershipDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Active', 'Suspended', 'Expired'], default: 'Active' },
    borrowedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }]
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);
