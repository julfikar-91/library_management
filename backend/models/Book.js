const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    bookId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String },
    genre: { type: String },
    publishedYear: { type: Number },
    copies: { type: Number, default: 1 },
    availableCopies: { type: Number, default: 1 },
    location: { type: String },
    description: { type: String },
    coverImage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
