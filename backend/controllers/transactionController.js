const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const Member = require('../models/Member');

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

// Return Book
exports.returnBook = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction || transaction.status === 'Returned') {
            return res.status(400).json({ message: 'Invalid transaction or already returned' });
        }

        transaction.returnDate = new Date();
        transaction.status = 'Returned';
        
        // Simple fine calculation: $1 per day late
        const overDueDays = Math.max(0, Math.floor((transaction.returnDate - transaction.dueDate) / (1000 * 60 * 60 * 24)));
        transaction.fine = overDueDays * 1;

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
        const transactions = await Transaction.find().populate('book').populate('member');
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
