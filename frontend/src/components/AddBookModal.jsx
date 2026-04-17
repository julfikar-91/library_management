import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const AddBookModal = ({ isOpen, onClose, onBookAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    bookId: '',
    genre: '',
    availableCopies: 1,
    copies: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/books', formData);
      onBookAdded(response.data);
      onClose();
      setFormData({ title: '', author: '', bookId: '', genre: '', availableCopies: 1, copies: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-md p-8 relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-text-muted hover:text-white hover:bg-white/10 transition-all z-10">
          <X size={20} />
        </button>

        <h3 className="text-2xl font-black text-white mb-6 relative z-10">Add New Book</h3>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {error && <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-bold">{error}</div>}
          
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Book ID / ISBN</label>
            <input required type="text" name="bookId" value={formData.bookId} onChange={handleChange} placeholder="B004" className="input-field" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Title</label>
            <input required type="text" name="title" value={formData.title} onChange={handleChange} placeholder="The Great Gatsby" className="input-field" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Author</label>
            <input required type="text" name="author" value={formData.author} onChange={handleChange} placeholder="F. Scott Fitzgerald" className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Genre</label>
              <input required type="text" name="genre" value={formData.genre} onChange={handleChange} placeholder="Classic" className="input-field" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Total Copies</label>
              <input required type="number" min="1" name="copies" value={formData.copies} onChange={(e) => {
                handleChange(e);
                setFormData(prev => ({ ...prev, availableCopies: e.target.value }));
              }} className="input-field" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary py-4 justify-center mt-4">
            <span className="uppercase tracking-[0.2em] text-xs font-black">{loading ? 'Adding...' : 'Save Book'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBookModal;
