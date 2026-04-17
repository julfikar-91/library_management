import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AddBookModal from '../components/AddBookModal';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/books');
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAdded = (newBook) => {
    setBooks(prev => [...prev, newBook]);
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/books/${id}`);
      setBooks(prev => prev.filter(b => b._id !== id));
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <AddBookModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onBookAdded={handleBookAdded} />
      
      <div className="flex items-center justify-between bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight italic">Library Catalog</h2>
          <p className="text-text-muted mt-1 font-medium italic">Manage your book inventory and collections.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
          <Plus size={20} strokeWidth={3} />
          <span className="uppercase tracking-widest text-xs font-black">Add New Book</span>
        </button>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 relative group">
          <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors duration-300" size={18} />
            <input 
              type="text" 
              placeholder="Search by title, author or ISBN..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white placeholder-text-muted outline-none transition-all duration-300 focus:bg-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 shadow-inner"
            />
          </div>
        </div>
        <button className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-3 text-text-muted hover:text-white shadow-inner group">
          <Filter size={18} className="group-hover:text-primary transition-colors" />
          <span className="uppercase tracking-widest text-xs font-black">Filters</span>
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] w-24">ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Title</th>
              <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Author</th>
              <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Genre</th>
              <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Stock</th>
              <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-center w-32">Config</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="6" className="px-8 py-6">
                    <div className="h-12 bg-white/5 rounded-xl w-full"></div>
                  </td>
                </tr>
              ))
            ) : (
              books.map((book) => (
                <tr key={book._id} className="hover:bg-white/[0.04] transition-colors group cursor-pointer">
                  <td className="px-8 py-6 text-xs font-black text-white/50 tracking-wider font-mono">{book.bookId}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <span className="text-[10px] font-black tracking-tighter">PDF</span>
                      </div>
                      <span className="text-sm font-black text-white tracking-tight group-hover:text-primary transition-colors">{book.title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-text-muted">{book.author}</td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-text-muted uppercase tracking-widest">
                      {book.genre}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${book.availableCopies > 3 ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      {book.availableCopies} Left
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-white hover:bg-white/10 transition-all">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteBook(book._id)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Books;
