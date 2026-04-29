const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    status: { type: String, enum: ['Requested', 'Issued', 'Returned', 'Overdue', 'Rejected'], default: 'Issued' },
    fine: { type: Number, default: 0 },
    fineReason: { type: String },
    fineType: { type: String, enum: ['Late', 'Lost', 'Damaged', 'None'], default: 'None' },
    fineStatus: { type: String, enum: ['Unpaid', 'Paid', 'Waived', 'None'], default: 'None' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
