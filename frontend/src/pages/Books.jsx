import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AddBookModal from '../components/AddBookModal';
import EditBookModal from '../components/EditBookModal';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');

  const userRole = localStorage.getItem('mrem_user_role');

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

  const handleBookUpdated = (updatedBook) => {
    setBooks(prev => prev.map(b => b._id === updatedBook._id ? updatedBook : b));
  };

  const handleDeleteBook = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/books/${id}`);
      setBooks(prev => prev.filter(b => b._id !== id));
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleRequestBook = async (e, bookId) => {
    e.stopPropagation();
    try {
      const memberId = localStorage.getItem('mrem_user_id');
      await axios.post('http://localhost:5000/api/transactions/request', {
        bookId,
        memberId
      });
      alert('Book requested successfully!');
      fetchBooks();
    } catch (error) {
      console.error('Error requesting book:', error);
      alert(error.response?.data?.message || 'Failed to request book');
    }
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <AddBookModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onBookAdded={handleBookAdded} />
      <EditBookModal isOpen={!!editingBook} onClose={() => setEditingBook(null)} onBookUpdated={handleBookUpdated} book={editingBook} />
      
      <div className="flex items-center justify-between bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight italic">Library Catalog</h2>
          <p className="text-text-muted mt-1 font-medium italic">{userRole === 'admin' ? 'Manage your book inventory and collections.' : 'Browse and request books for your studies.'}</p>
        </div>
        {userRole === 'admin' && (
          <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
            <Plus size={20} strokeWidth={3} />
            <span className="uppercase tracking-widest text-xs font-black">Add New Book</span>
          </button>
        )}
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative group">
          <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors duration-300" size={18} />
            <input 
              type="text" 
              placeholder="Search by title, author or ISBN..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white placeholder-text-muted outline-none transition-all duration-300 focus:bg-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 shadow-inner"
            />
          </div>
        </div>
        {userRole === 'student' && (
          <>
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="px-6 py-4 rounded-2xl bg-bg-dark border border-white/10 text-white outline-none focus:border-primary/50 transition-all">
              <option value="">All Depts</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
            </select>
            <select value={filterSem} onChange={(e) => setFilterSem(e.target.value)} className="px-6 py-4 rounded-2xl bg-bg-dark border border-white/10 text-white outline-none focus:border-primary/50 transition-all">
              <option value="">All Sems</option>
              <option value="1">1st</option>
              <option value="2">2nd</option>
              <option value="3">3rd</option>
              <option value="4">4th</option>
              <option value="5">5th</option>
              <option value="6">6th</option>
              <option value="7">7th</option>
              <option value="8">8th</option>
            </select>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card h-[380px] animate-pulse p-6 flex flex-col gap-4">
              <div className="h-48 bg-white/5 rounded-2xl w-full"></div>
              <div className="h-6 bg-white/5 rounded-xl w-3/4"></div>
              <div className="h-4 bg-white/5 rounded-xl w-1/2"></div>
              <div className="h-10 bg-white/5 rounded-xl w-full mt-auto"></div>
            </div>
          ))
        ) : books.filter(b => {
            const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  b.author.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  (b.isbn && b.isbn.includes(searchQuery));
            const matchesDept = filterDept ? b.department === filterDept : true;
            const matchesSem = filterSem ? b.semester === filterSem : true;
            return matchesSearch && matchesDept && matchesSem;
          }).length === 0 ? (
            <div className="col-span-full py-16 text-center text-text-muted italic text-sm font-medium">
              No books or educational assets found in matching criteria.
            </div>
          ) : (
            books.filter(b => {
              const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    b.author.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    (b.isbn && b.isbn.includes(searchQuery));
              const matchesDept = filterDept ? b.department === filterDept : true;
              const matchesSem = filterSem ? b.semester === filterSem : true;
              return matchesSearch && matchesDept && matchesSem;
            }).map((book) => (
              <div key={book._id} className="glass-card p-6 flex flex-col gap-4 group hover:bg-white/[0.06] border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden shadow-2xl">
                {/* Visual Top */}
                <div className="h-48 rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/10 to-bg-dark border border-white/5 flex flex-col items-center justify-center text-center relative group-hover:scale-[1.02] transition-transform duration-500 p-4">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500 rounded-2xl" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-transparent"></div>
                  )}
                  
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary border border-white/10 relative z-10 mb-3 shadow-lg">
                    {book.pdfUrl ? (
                      <span className="text-[9px] font-black tracking-tighter text-secondary bg-secondary/10 px-2 py-1 rounded-md border border-secondary/20">PDF</span>
                    ) : (
                      <span className="text-[9px] font-black tracking-tighter text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20 font-mono">BOOK</span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-text-muted font-mono z-10 bg-bg-dark/90 px-3 py-1 rounded-lg border border-white/10 tracking-wider">{book.bookId}</span>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 gap-1 mt-1">
                  <h4 className="text-base font-black text-white group-hover:text-primary transition-colors duration-300 tracking-tight line-clamp-2 leading-tight">{book.title}</h4>
                  <p className="text-xs text-text-muted font-semibold italic">{book.author}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-black text-text-muted uppercase tracking-wider">{book.genre}</span>
                    {book.department && <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-black text-primary uppercase tracking-wider">{book.department}</span>}
                    {book.semester && <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-black text-secondary uppercase tracking-wider">Sem-{book.semester}</span>}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] shadow-sm border ${book.availableCopies > 2 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                    {book.availableCopies} Available
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {userRole === 'admin' ? (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingBook(book); }} 
                          className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-white hover:bg-white/10 transition-all shadow"
                          title="Edit Record"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteBook(e, book._id)} 
                          className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all shadow"
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        {book.pdfUrl && (
                          <a 
                            href={book.pdfUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            onClick={(e) => e.stopPropagation()} 
                            className="px-3 py-1.5 rounded-xl bg-secondary/20 text-secondary border border-secondary/30 hover:bg-secondary/30 transition-all text-[9px] font-black uppercase tracking-widest shadow-md"
                          >
                            Read
                          </a>
                        )}
                        <button 
                          onClick={(e) => handleRequestBook(e, book._id)} 
                          disabled={book.availableCopies === 0} 
                          className="px-3 py-1.5 rounded-xl bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all text-[9px] font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                        >
                          Request
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Books;
