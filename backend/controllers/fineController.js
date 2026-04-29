const FineConfig = require('../models/FineConfig');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

exports.getFineConfig = async (req, res) => {
    try {
        let config = await FineConfig.findOne();
        if (!config) {
            config = await FineConfig.create({});
        }
        res.status(200).json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateFineConfig = async (req, res) => {
    const { lateFinePerDay, lostBookFine, damagedBookFine } = req.body;
    try {
        let config = await FineConfig.findOne();
        if (!config) config = new FineConfig();

        if (lateFinePerDay !== undefined) config.lateFinePerDay = lateFinePerDay;
        if (lostBookFine !== undefined) config.lostBookFine = lostBookFine;
        if (damagedBookFine !== undefined) config.damagedBookFine = damagedBookFine;

        await config.save();
        res.status(200).json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateTransactionFine = async (req, res) => {
    const { id } = req.params;
    const { fine, fineReason, fineType, fineStatus } = req.body;
    try {
        const transaction = await Transaction.findById(id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        if (fine !== undefined) transaction.fine = fine;
        if (fineReason !== undefined) transaction.fineReason = fineReason;
        if (fineType !== undefined) transaction.fineType = fineType;
        if (fineStatus !== undefined) transaction.fineStatus = fineStatus;

        if (fineStatus === 'Paid' || fineStatus === 'Waived') {
            const notification = new Notification({
                userId: transaction.member,
                message: `Your fine of ₹${transaction.fine} for the book transaction has been marked as ${fineStatus}.`,
                type: 'success'
            });
            await notification.save();
        }

        await transaction.save();
        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
