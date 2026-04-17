import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowUpRight, ArrowDownLeft, Clock, Search, RotateCcw } from 'lucide-react';

const Transactions = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [transactions, setTransactions] = useState([]);
  const [actionForm, setActionForm] = useState({ memberId: '', bookId: '', dueDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchTransactions();
    // Default due date to 14 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 14);
    setActionForm(prev => ({ ...prev, dueDate: defaultDate.toISOString().split('T')[0] }));
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/transactions');
      setTransactions(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post('http://localhost:5000/api/transactions', actionForm);
      setActionForm({ memberId: '', bookId: '', dueDate: actionForm.dueDate });
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (transactionId) => {
    if (!window.confirm('Confirm return of this book?')) return;
    try {
      await axios.put(`http://localhost:5000/api/transactions/return/${transactionId}`);
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Issues') return t.status === 'Issued';
    if (activeTab === 'Returns') return t.status === 'Returned';
    if (activeTab === 'Overdue') return t.status === 'Overdue';
    return true;
  });

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-white tracking-tight">Circulation Control</h2>
        <p className="text-text-muted font-medium italic">Track every movement of your library's assets.</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-10">
        <div className="flex-1 space-y-8">
          <div className="flex items-center gap-3 p-1.5 bg-white/5 w-fit rounded-2xl border border-white/5">
            {['All', 'Issues', 'Returns', 'Overdue'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  activeTab === tab 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20' 
                  : 'text-text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredTransactions.map(t => (
              <div key={t._id} className="glass-card p-6 group hover:bg-white/[0.07] border-white/5 hover:border-white/10 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-[1.25rem] transition-transform duration-500 group-hover:rotate-6 ${t.status === 'Issued' ? 'bg-sky-500/10 text-sky-400' : 'bg-primary/10 text-primary'}`}>
                    {t.status === 'Issued' ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white mb-0.5 group-hover:text-primary transition-colors tracking-tight">{t.book?.title || 'Unknown Book'}</h4>
                    <p className="text-xs text-text-muted font-medium italic">Issued to <span className="text-white font-bold not-italic">{t.member?.name || 'Unknown'}</span></p>
                  </div>
                </div>
                
                <div className="flex items-center gap-12">
                  <div className="text-right hidden md:block border-r border-white/5 pr-12">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1 opacity-60">Due Date</p>
                    <div className="flex items-center gap-2 text-white font-bold italic">
                      <Clock size={12} className="text-primary" />
                      <span className="text-xs">{new Date(t.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
                      t.status === 'Returned' ? 'bg-primary/10 text-primary border border-primary/20' : 
                      t.status === 'Overdue' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                      'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    }`}>
                      {t.status}
                    </div>
                    {t.status === 'Issued' && (
                      <button onClick={(e) => { e.stopPropagation(); handleReturnBook(t._id); }} className="text-[10px] font-bold text-text-muted hover:text-white flex items-center gap-1 uppercase tracking-widest">
                        <RotateCcw size={12} /> Return
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredTransactions.length === 0 && (
              <p className="text-center text-text-muted py-8 font-medium">No transactions found.</p>
            )}
          </div>
        </div>

        <div className="w-full xl:w-96 space-y-8">
          <form onSubmit={handleIssueBook} className="glass-card p-8 bg-gradient-to-br from-white/[0.03] to-transparent border-primary/20">
            <h3 className="text-xl font-black text-white mb-6 tracking-tight">Quick Action</h3>
            <div className="space-y-4">
              {error && <div className="text-xs font-bold text-rose-400 bg-rose-500/10 p-3 rounded-xl">{error}</div>}
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Member Credential</label>
                <input required type="text" value={actionForm.memberId} onChange={e => setActionForm(prev => ({...prev, memberId: e.target.value}))} placeholder="M001..." className="input-field" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Asset ISBN / ID</label>
                <input required type="text" value={actionForm.bookId} onChange={e => setActionForm(prev => ({...prev, bookId: e.target.value}))} placeholder="B001..." className="input-field" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Due Date</label>
                <input required type="date" value={actionForm.dueDate} onChange={e => setActionForm(prev => ({...prev, dueDate: e.target.value}))} className="input-field" />
              </div>
              <div className="space-y-1.5 pt-2">
                <button type="submit" disabled={loading} className="w-full btn-primary py-4 justify-center">
                  <span className="uppercase tracking-[0.2em] text-xs font-black">{loading ? 'Processing...' : 'Authorize Transfer'}</span>
                </button>
              </div>
            </div>
          </form>

          <div className="glass-card p-8 bg-gradient-to-br from-secondary/10 via-bg-dark/40 to-transparent border-secondary/20 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <h3 className="text-sm font-black text-white/60 mb-1 uppercase tracking-widest">Pending Liabilities</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <p className="text-4xl font-black text-white tracking-tighter">$240.50</p>
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest bg-rose-400/10 px-2 py-0.5 rounded-lg">Total Fines</span>
            </div>
            <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-text-muted hover:text-white">Audit Financials</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
