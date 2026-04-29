import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowUpRight, ArrowDownLeft, Clock, Search, RotateCcw } from 'lucide-react';

const Transactions = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [transactions, setTransactions] = useState([]);
  const [actionForm, setActionForm] = useState({ memberId: '', bookId: '', dueDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [returningTransaction, setReturningTransaction] = useState(null);
  const [returnForm, setReturnForm] = useState({ condition: 'Good', useAutoFine: true, customFine: 0, customReason: '' });
  
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
      await axios.post('http://localhost:5000/api/transactions/issue', actionForm);
      setActionForm({ memberId: '', bookId: '', dueDate: actionForm.dueDate });
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = (transaction) => {
    setReturningTransaction(transaction);
    const dueDate = new Date(transaction.dueDate);
    const overDueDays = Math.max(0, Math.floor((new Date() - dueDate) / (1000 * 60 * 60 * 24)));
    
    axios.get('http://localhost:5000/api/fine/config').then(res => {
      const config = res.data;
      const lateRate = config ? config.lateFinePerDay : 5;
      const lostRate = config ? config.lostBookFine : 500;
      const damageRate = config ? config.damagedBookFine : 200;
      
      let autoFine = overDueDays * lateRate;
      setReturnForm({
        condition: 'Good',
        useAutoFine: true,
        customFine: autoFine,
        customReason: overDueDays > 0 ? `${overDueDays} days late submission` : ''
      });
    }).catch(() => {
      setReturnForm({
        condition: 'Good',
        useAutoFine: true,
        customFine: overDueDays * 5,
        customReason: overDueDays > 0 ? `${overDueDays} days late submission` : ''
      });
    });
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        condition: returnForm.condition,
        customFine: returnForm.useAutoFine ? undefined : returnForm.customFine,
        customReason: returnForm.useAutoFine ? undefined : returnForm.customReason
      };
      await axios.put(`http://localhost:5000/api/transactions/return/${returningTransaction._id}`, payload);
      setReturningTransaction(null);
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to return book');
    }
  };

  const handleApprove = async (transactionId) => {
    try {
      await axios.put(`http://localhost:5000/api/transactions/approve/${transactionId}`);
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (transactionId) => {
    try {
      await axios.put(`http://localhost:5000/api/transactions/reject/${transactionId}`);
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject');
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      (t.book?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (t.member?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (t.member?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.member?._id || '').toString().toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'All') return true;
    if (activeTab === 'Requests') return t.status === 'Requested';
    if (activeTab === 'Issues') return t.status === 'Issued';
    if (activeTab === 'Returns') return t.status === 'Returned';
    if (activeTab === 'Overdue') return t.status === 'Overdue';
    if (activeTab === 'Rejected') return t.status === 'Rejected';
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
          <div className="flex flex-wrap items-center gap-6 bg-white/[0.02] p-4 rounded-[2rem] border border-white/5">
            <div className="flex flex-wrap items-center gap-3 p-1.5 bg-white/5 w-fit rounded-2xl border border-white/5">
              {['All', 'Requests', 'Issues', 'Returns', 'Overdue', 'Rejected'].map(tab => (
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

            <div className="relative group flex-1 min-w-[250px]">
              <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors duration-300" size={16} />
                <input 
                  type="text" 
                  placeholder="Search by book or member..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white placeholder-text-muted outline-none transition-all duration-300 focus:bg-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredTransactions.map(t => (
              <div key={t._id} className="glass-card p-6 group hover:bg-white/[0.07] border-white/5 hover:border-white/10 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-[1.25rem] transition-transform duration-500 group-hover:rotate-6 ${t.status === 'Issued' ? 'bg-sky-500/10 text-sky-400' : t.status === 'Requested' ? 'bg-amber-500/10 text-amber-400' : t.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400' : 'bg-primary/10 text-primary'}`}>
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
                      t.status === 'Requested' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      t.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    }`}>
                      {t.status}
                    </div>
                    {t.status === 'Issued' && (
                      <button onClick={(e) => { e.stopPropagation(); handleReturnBook(t); }} className="text-[10px] font-bold text-text-muted hover:text-white flex items-center gap-1 uppercase tracking-widest mt-2">
                        <RotateCcw size={12} /> Return
                      </button>
                    )}
                    {t.status === 'Requested' && (
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={(e) => { e.stopPropagation(); handleApprove(t._id); }} className="text-[10px] font-bold text-primary hover:bg-primary/20 px-2 py-1 rounded-lg border border-primary/20 transition-all uppercase tracking-widest">
                          Approve
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleReject(t._id); }} className="text-[10px] font-bold text-rose-400 hover:bg-rose-500/20 px-2 py-1 rounded-lg border border-rose-500/20 transition-all uppercase tracking-widest">
                          Reject
                        </button>
                      </div>
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
            <div className="flex items-baseline gap-2 mb-4">
              <p className="text-4xl font-black text-white tracking-tighter">${transactions.reduce((acc, t) => acc + (t.fine || 0), 0).toFixed(2)}</p>
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest bg-rose-400/10 px-2 py-0.5 rounded-lg">Total Fines</span>
            </div>
            <span className="text-[10px] text-text-muted block mb-4 italic">*Admin collects $1 per day for overdue assets to enforce circulation logic and asset security.</span>
            <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-text-muted hover:text-white">Audit Financials</button>
          </div>
        </div>
      </div>
      {returningTransaction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-8 max-w-md w-full space-y-4 relative border-primary/30">
            <h3 className="text-xl font-black text-white tracking-wide border-b border-white/10 pb-4 flex items-center gap-2">
              <RotateCcw className="text-primary" /> Return Asset Assessment
            </h3>
            
            <form onSubmit={handleReturnSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Return Condition</label>
                <select 
                  value={returnForm.condition} 
                  onChange={e => {
                    const cond = e.target.value;
                    const dueDate = new Date(returningTransaction.dueDate);
                    const overDueDays = Math.max(0, Math.floor((new Date() - dueDate) / (1000 * 60 * 60 * 24)));
                    
                    axios.get('http://localhost:5000/api/fine/config').then(res => {
                      const config = res.data;
                      const lateRate = config ? config.lateFinePerDay : 5;
                      const lostRate = config ? config.lostBookFine : 500;
                      const damageRate = config ? config.damagedBookFine : 200;
                      
                      let autoFine = overDueDays * lateRate;
                      if (cond === 'Lost') autoFine += lostRate;
                      if (cond === 'Damaged') autoFine += damageRate;
                      
                      setReturnForm(prev => ({ 
                        ...prev, 
                        condition: cond,
                        customFine: autoFine,
                        customReason: cond === 'Good' ? (overDueDays > 0 ? `${overDueDays} days late` : '') : 
                                      (cond === 'Damaged' ? `Damaged penalty${overDueDays > 0 ? ` + ${overDueDays} days late` : ''}` : 
                                      `Lost book penalty${overDueDays > 0 ? ` + ${overDueDays} days late` : ''}`)
                      }));
                    });
                  }} 
                  className="input-field bg-bg-dark"
                >
                  <option value="Good">Good State (Normal Return)</option>
                  <option value="Damaged">Damaged / Broken / Torn Copy</option>
                  <option value="Lost">Lost / Missing Asset</option>
                </select>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input 
                  type="checkbox" 
                  id="useAutoFine"
                  checked={returnForm.useAutoFine} 
                  onChange={e => setReturnForm({ ...returnForm, useAutoFine: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/40"
                />
                <label htmlFor="useAutoFine" className="text-xs font-bold text-text-muted cursor-pointer select-none">Use Auto-Calculated Fine</label>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Fine Amount (₹)</label>
                <input 
                  type="number" 
                  value={returnForm.customFine} 
                  onChange={e => setReturnForm({ ...returnForm, customFine: Number(e.target.value), useAutoFine: false })} 
                  className={`input-field ${returnForm.useAutoFine ? 'opacity-50 cursor-not-allowed' : ''}`} 
                  disabled={returnForm.useAutoFine}
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Violation Reason</label>
                <input 
                  type="text" 
                  value={returnForm.customReason} 
                  onChange={e => setReturnForm({ ...returnForm, customReason: e.target.value, useAutoFine: false })} 
                  placeholder="e.g., Torn cover, missing pages..." 
                  className={`input-field ${returnForm.useAutoFine ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={returnForm.useAutoFine}
                  required 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setReturningTransaction(null)} 
                  className="w-1/2 py-3 rounded-2xl bg-white/5 text-white text-xs font-black tracking-widest uppercase border border-white/10 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 btn-primary justify-center text-xs font-black tracking-widest uppercase"
                >
                  Confirm Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
