import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const AddMemberModal = ({ isOpen, onClose, onMemberAdded }) => {
  const [formData, setFormData] = useState({
    memberId: '',
    name: '',
    email: '',
    phone: '',
    status: 'Active'
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
      const response = await axios.post('http://localhost:5000/api/members', formData);
      onMemberAdded(response.data);
      onClose();
      setFormData({ memberId: '', name: '', email: '', phone: '', status: 'Active' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-md p-8 relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-text-muted hover:text-white hover:bg-white/10 transition-all z-10">
          <X size={20} />
        </button>

        <h3 className="text-2xl font-black text-white mb-6 relative z-10">Register Member</h3>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {error && <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-bold">{error}</div>}
          
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Member ID</label>
            <input required type="text" name="memberId" value={formData.memberId} onChange={handleChange} placeholder="M004" className="input-field" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Full Name</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Zainab Rashid" className="input-field" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Email Address</label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="zainab@example.com" className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Phone</label>
              <input required type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91..." className="input-field" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input-field text-sm">
                <option value="Active" className="bg-bg-dark text-white">Active</option>
                <option value="Suspended" className="bg-bg-dark text-white">Suspended</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary py-4 justify-center mt-4 bg-gradient-to-r from-secondary to-primary shadow-secondary/25 hover:shadow-secondary/40">
            <span className="uppercase tracking-[0.2em] text-xs font-black">{loading ? 'Saving...' : 'Register Member'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
