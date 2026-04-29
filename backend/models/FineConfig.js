const mongoose = require('mongoose');

const fineConfigSchema = new mongoose.Schema({
    lateFinePerDay: { type: Number, default: 5 },
    lostBookFine: { type: Number, default: 500 },
    damagedBookFine: { type: Number, default: 200 }
}, { timestamps: true });

module.exports = mongoose.model('FineConfig', fineConfigSchema);
