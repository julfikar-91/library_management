import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle2, AlertCircle, DollarSign, BookOpen } from 'lucide-react';

const StudentHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const memberId = localStorage.getItem('mrem_user_id');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/transactions/student/${memberId}`);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (transactionId) => {
    try {
      await axios.put(`http://localhost:5000/api/transactions/return/${transactionId}`);
      alert('Book marked as returned successfully!');
      fetchHistory();
    } catch (error) {
      console.error('Error returning book:', error);
      alert('Failed to return book.');
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Returned': return <CheckCircle2 className="text-primary" size={18} />;
      case 'Overdue': return <AlertCircle className="text-rose-400" size={18} />;
      case 'Requested': return <Clock className="text-amber-400" size={18} />;
      default: return <BookOpen className="text-blue-400" size={18} />;
    }
  };

  const totalFines = transactions.reduce((acc, t) => acc + (t.fine || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight italic">My History</h2>
          <p className="text-text-muted mt-1 font-medium italic">Track your issued books, due dates, and fines.</p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 px-6 py-4 rounded-2xl flex flex-col gap-2 shadow-lg shadow-rose-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400">
              <DollarSign size={24} strokeWidth={3} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-black text-rose-400/80">Total Fines</p>
              <p className="text-2xl font-black text-white">₹{totalFines}</p>
            </div>
          </div>
          <span className="text-[9px] text-text-muted/80 italic">*Fines accrue based on late returns, book damages, or misplaced library property.</span>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left relative z-10">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Book Title</th>
              <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Issue Date</th>
              <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Due Date</th>
              <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Fine Details</th>
              <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-center w-32">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 relative z-10">
            {loading ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="6" className="px-8 py-6">
                    <div className="h-12 bg-white/5 rounded-xl w-full"></div>
                  </td>
                </tr>
              ))
            ) : transactions.length === 0 ? (
                <tr>
                    <td colSpan="6" className="px-8 py-10 text-center text-text-muted italic">No transaction history found.</td>
                </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t._id} className="hover:bg-white/[0.04] transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-white">{t.book?.title || 'Unknown Book'}</span>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-text-muted">
                    {new Date(t.issueDate).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-text-muted">
                    {new Date(t.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(t.status)}
                      <span className="text-xs font-bold text-white tracking-wide">{t.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col text-xs">
                      <span className={`font-black text-sm ${t.fine > 0 ? 'text-rose-400' : 'text-white'}`}>
                        ₹{t.fine || 0}
                      </span>
                      {t.fineType !== 'None' && (
                        <span className={`mt-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest w-fit ${
                          t.fineStatus === 'Paid' ? 'bg-primary/10 text-primary' : 
                          t.fineStatus === 'Waived' ? 'bg-amber-500/10 text-amber-400' : 
                          'bg-rose-500/10 text-rose-400'
                        }`}>
                          {t.fineType} • {t.fineStatus}
                        </span>
                      )}
                      {t.fineReason && (
                        <span className="text-[9px] text-text-muted mt-1 italic max-w-[150px] truncate" title={t.fineReason}>
                          {t.fineReason}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {t.status === 'Issued' || t.status === 'Overdue' ? (
                      <button 
                        onClick={() => handleReturn(t._id)} 
                        className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors text-xs font-bold"
                      >
                        Return
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-text-muted/50">-</span>
                    )}
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

export default StudentHistory;
