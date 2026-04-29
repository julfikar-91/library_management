const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const Member = require('../models/Member');
const Notification = require('../models/Notification');

// Request Book (Student Action)
exports.requestBook = async (req, res) => {
    const { bookId, memberId } = req.body;
    try {
        const book = await Book.findById(bookId);
        if (!book || book.availableCopies <= 0) {
            return res.status(400).json({ message: 'Book not available for request' });
        }

        const member = await Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        const transaction = new Transaction({
            book: book._id,
            member: member._id,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 14 days later
            status: 'Requested'
        });

        await transaction.save();

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Issue Book
exports.issueBook = async (req, res) => {
    const { bookId, memberId, dueDate } = req.body;
    try {
        const book = await Book.findOne({ bookId: bookId });
        if (!book || book.availableCopies <= 0) {
            return res.status(400).json({ message: 'Book not available for issue' });
        }

        const member = await Member.findOne({ memberId: memberId });
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        const transaction = new Transaction({
            book: book._id,
            member: member._id,
            dueDate: new Date(dueDate)
        });

        await transaction.save();

        // Update Book availability
        book.availableCopies -= 1;
        await book.save();

        // Add to member's borrowed books
        member.borrowedBooks.push(book._id);
        await member.save();

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.approveRequest = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id).populate('book');
        if (!transaction || transaction.status !== 'Requested') {
            return res.status(400).json({ message: 'Invalid transaction' });
        }

        transaction.status = 'Issued';
        transaction.issueDate = new Date();
        await transaction.save();

        const book = await Book.findById(transaction.book._id);
        book.availableCopies -= 1;
        await book.save();

        const member = await Member.findById(transaction.member);
        member.borrowedBooks.push(book._id);
        await member.save();

        const notification = new Notification({
            userId: member._id,
            message: `Your request for the book "${book.title}" has been Approved!`,
            type: 'success'
        });
        await notification.save();

        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.rejectRequest = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id).populate('book');
        if (!transaction || transaction.status !== 'Requested') {
            return res.status(400).json({ message: 'Invalid transaction' });
        }

        transaction.status = 'Rejected';
        await transaction.save();

        const notification = new Notification({
            userId: transaction.member,
            message: `Your request for the book "${transaction.book.title}" has been Rejected.`,
            type: 'error'
        });
        await notification.save();

        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Return Book
exports.returnBook = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction || transaction.status === 'Returned') {
            return res.status(400).json({ message: 'Invalid transaction or already returned' });
        }

        transaction.returnDate = new Date();
        transaction.status = 'Returned';
        
        const { condition, customFine, customReason } = req.body || {};

        // Simple fine calculation from FineConfig
        const FineConfig = require('../models/FineConfig');
        let config = await FineConfig.findOne();
        const lateRate = config ? config.lateFinePerDay : 5;
        const lostRate = config ? config.lostBookFine : 500;
        const damageRate = config ? config.damagedBookFine : 200;

        const overDueDays = Math.max(0, Math.floor((new Date() - transaction.dueDate) / (1000 * 60 * 60 * 24)));
        let calculatedFine = overDueDays * lateRate;

        if (condition === 'Lost') {
            calculatedFine += lostRate;
            transaction.fineType = 'Lost';
            transaction.fineReason = `Lost book penalty${overDueDays > 0 ? ` + ${overDueDays} days late fee` : ''} applied at return`;
            transaction.fineStatus = 'Unpaid';
        } else if (condition === 'Damaged') {
            calculatedFine += damageRate;
            transaction.fineType = 'Damaged';
            transaction.fineReason = `Damaged book penalty${overDueDays > 0 ? ` + ${overDueDays} days late fee` : ''} applied at return`;
            transaction.fineStatus = 'Unpaid';
        } else if (calculatedFine > 0) {
            transaction.fineType = 'Late';
            transaction.fineReason = `${overDueDays} days late submission fine applied at return`;
            transaction.fineStatus = 'Unpaid';
        } else {
            transaction.fineType = 'None';
            transaction.fineStatus = 'None';
            transaction.fineReason = '';
        }

        if (customFine !== undefined && customFine !== null) {
            transaction.fine = Number(customFine);
            if (customReason) transaction.fineReason = customReason;
            if (transaction.fine > 0 && (transaction.fineType === 'None' || !transaction.fineType)) {
                transaction.fineType = condition !== 'Good' ? condition : 'Late';
                transaction.fineStatus = 'Unpaid';
            } else if (transaction.fine === 0) {
                transaction.fineStatus = 'None';
                transaction.fineType = 'None';
            }
        } else {
            transaction.fine = calculatedFine;
        }
        await transaction.save();

        // Update Book availability
        const book = await Book.findById(transaction.book);
        book.availableCopies += 1;
        await book.save();

        // Remove from member's borrowed books
        const member = await Member.findById(transaction.member);
        member.borrowedBooks = member.borrowedBooks.filter(id => id.toString() !== transaction.book.toString());
        await member.save();

        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        let transactions = await Transaction.find().populate('book').populate('member');
        
        const FineConfig = require('../models/FineConfig');
        let config = await FineConfig.findOne();
        const lateRate = config ? config.lateFinePerDay : 5;

        for (let t of transactions) {
            if ((t.status === 'Issued' || t.status === 'Overdue') && new Date() > t.dueDate && t.fineStatus !== 'Paid' && t.fineStatus !== 'Waived') {
                t.status = 'Overdue';
                const overDueDays = Math.floor((new Date() - t.dueDate) / (1000 * 60 * 60 * 24));
                t.fine = Math.max(0, overDueDays * lateRate);
                t.fineType = 'Late';
                if (t.fineStatus === 'None') t.fineStatus = 'Unpaid';
                t.fineReason = `${overDueDays} days overdue fine accrued`;
                await t.save();
            }
        }
        
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStudentTransactions = async (req, res) => {
    try {
        let transactions = await Transaction.find({ member: req.params.memberId }).populate('book');
        
        const FineConfig = require('../models/FineConfig');
        let config = await FineConfig.findOne();
        const lateRate = config ? config.lateFinePerDay : 5;

        for (let t of transactions) {
            if ((t.status === 'Issued' || t.status === 'Overdue') && new Date() > t.dueDate && t.fineStatus !== 'Paid' && t.fineStatus !== 'Waived') {
                t.status = 'Overdue';
                const overDueDays = Math.floor((new Date() - t.dueDate) / (1000 * 60 * 60 * 24));
                t.fine = Math.max(0, overDueDays * lateRate);
                t.fineType = 'Late';
                if (t.fineStatus === 'None') t.fineStatus = 'Unpaid';
                t.fineReason = `${overDueDays} days overdue fine accrued`;
                await t.save();
            }
        }
        
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
