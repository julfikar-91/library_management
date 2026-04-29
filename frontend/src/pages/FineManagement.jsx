import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, DollarSign, CheckCircle, ShieldAlert, Edit2, Book, Search } from 'lucide-react';

const FineManagement = () => {
  const [config, setConfig] = useState({ lateFinePerDay: 5, lostBookFine: 500, damagedBookFine: 200 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [fineForm, setFineForm] = useState({ fine: 0, fineType: 'Late', fineStatus: 'Unpaid', fineReason: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const configRes = await axios.get('http://localhost:5000/api/fine/config');
      if (configRes.data) setConfig(configRes.data);
      
      const transRes = await axios.get('http://localhost:5000/api/transactions');
      setTransactions(transRes.data);
    } catch (error) {
      console.error('Error fetching fine data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/fine/config', config);
      alert('Fine Rules configured successfully!');
      fetchData();
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  const handleOpenEditModal = (t) => {
    setEditingTransaction(t);
    setFineForm({
      fine: t.fine || 0,
      fineType: t.fineType !== 'None' ? t.fineType : 'Late',
      fineStatus: t.fineStatus !== 'None' ? t.fineStatus : 'Unpaid',
      fineReason: t.fineReason || ''
    });
  };

  const handleFineUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/fine/transaction/${editingTransaction._id}`, fineForm);
      alert('Fine updated successfully!');
      setEditingTransaction(null);
      fetchData();
    } catch (error) {
      console.error('Error updating transaction fine:', error);
    }
  };

  const handleQuickPay = async (transaction) => {
    try {
      await axios.put(`http://localhost:5000/api/fine/transaction/${transaction._id}`, {
        fine: transaction.fine,
        fineType: transaction.fineType,
        fineStatus: 'Paid',
        fineReason: transaction.fineReason || 'Fine cleared'
      });
      alert('Fine marked as Paid!');
      fetchData();
    } catch (error) {
      console.error('Error updating fine status:', error);
    }
  };

  const handleQuickWaive = async (transaction) => {
    try {
      await axios.put(`http://localhost:5000/api/fine/transaction/${transaction._id}`, {
        fine: transaction.fine,
        fineType: transaction.fineType,
        fineStatus: 'Waived',
        fineReason: transaction.fineReason || 'Fine waived by admin'
      });
      alert('Fine Waived!');
      fetchData();
    } catch (error) {
      console.error('Error updating fine status:', error);
    }
  };

  const totalCollected = transactions
    .filter(t => t.fineStatus === 'Paid')
    .reduce((sum, t) => sum + (t.fine || 0), 0);

  const pendingCollected = transactions
    .filter(t => t.fineStatus === 'Unpaid')
    .reduce((sum, t) => sum + (t.fine || 0), 0);

  const filteredTransactions = transactions
    .filter(t => t.fine > 0 || t.fineType !== 'None')
    .filter(t => {
      const matchesSearch = (t.member?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (t.book?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || t.fineStatus === statusFilter;
      const matchesType = typeFilter === 'All' || t.fineType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight italic">Fine Control Dashboard</h2>
          <p className="text-text-muted mt-1 font-medium italic">Configure fine algorithms, lost/damage criteria, and payment receipts.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-primary/10 border border-primary/20 px-6 py-3 rounded-2xl text-center shadow-sm">
            <p className="text-[10px] uppercase tracking-widest font-black text-primary">Collected</p>
            <p className="text-xl font-black text-white">₹{totalCollected}</p>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 px-6 py-3 rounded-2xl text-center shadow-sm">
            <p className="text-[10px] uppercase tracking-widest font-black text-rose-400">Pending</p>
            <p className="text-xl font-black text-white">₹{pendingCollected}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleConfigSubmit} className="glass-card p-8 bg-gradient-to-br from-white/[0.03] to-transparent border-white/5 h-fit flex flex-col space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Settings className="text-primary" size={20} />
            <h3 className="text-lg font-black text-white uppercase tracking-wider">Rules Configuration</h3>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Late Fee / Day (₹)</label>
            <input type="number" value={config.lateFinePerDay} onChange={e => setConfig({ ...config, lateFinePerDay: Number(e.target.value) })} className="input-field" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Lost Book Fine (₹)</label>
            <input type="number" value={config.lostBookFine} onChange={e => setConfig({ ...config, lostBookFine: Number(e.target.value) })} className="input-field" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Damage Penalty (₹)</label>
            <input type="number" value={config.damagedBookFine} onChange={e => setConfig({ ...config, damagedBookFine: Number(e.target.value) })} className="input-field" required />
          </div>
          <button type="submit" className="w-full btn-primary py-3.5 justify-center text-xs uppercase tracking-wider mt-2 font-black">Save Rules</button>
        </form>

        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
            <DollarSign className="text-primary" size={20} />
            <h3 className="text-lg font-black text-white uppercase tracking-wider">Monetary Ledger</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={16} />
              <input 
                type="text" 
                placeholder="Search student or book..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="input-field pl-10 py-2.5 text-xs" 
              />
            </div>
            <div>
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)} 
                className="input-field py-2.5 text-xs bg-bg-dark"
              >
                <option value="All">All Statuses</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
                <option value="Waived">Waived</option>
              </select>
            </div>
            <div>
              <select 
                value={typeFilter} 
                onChange={e => setTypeFilter(e.target.value)} 
                className="input-field py-2.5 text-xs bg-bg-dark"
              >
                <option value="All">All Types</option>
                <option value="Late">Late</option>
                <option value="Lost">Lost</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-4 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Student</th>
                  <th className="px-4 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Book</th>
                  <th className="px-4 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Fine</th>
                  <th className="px-4 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Type</th>
                  <th className="px-4 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-10 text-text-muted animate-pulse font-medium">Loading ledger...</td></tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-10 text-text-muted font-medium italic">No matching fines found.</td></tr>
                ) : (
                  filteredTransactions.map(t => (
                    <tr key={t._id} className="hover:bg-white/[0.02] transition-colors text-sm">
                      <td className="px-4 py-4 font-bold text-white">{t.member?.name || 'Deleted Member'}</td>
                      <td className="px-4 py-4 text-text-muted font-medium">{t.book?.title || 'Deleted Book'}</td>
                      <td className="px-4 py-4 font-black text-white">₹{t.fine}</td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-black text-text-muted uppercase tracking-wider">
                          {t.fineType}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                          t.fineStatus === 'Paid' ? 'bg-primary/10 text-primary' : 
                          t.fineStatus === 'Waived' ? 'bg-amber-500/10 text-amber-400' : 
                          'bg-rose-500/10 text-rose-400'
                        }`}>
                          {t.fineStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center flex items-center justify-center gap-2">
                        {t.fineStatus === 'Unpaid' && (
                          <>
                            <button 
                              onClick={() => handleQuickPay(t)} 
                              className="p-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all"
                              title="Mark as Paid"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button 
                              onClick={() => handleQuickWaive(t)} 
                              className="p-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-all"
                              title="Waive Fine"
                            >
                              <ShieldAlert size={14} />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleOpenEditModal(t)} 
                          className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-text-muted hover:text-primary border border-white/5 transition-all"
                          title="Edit Details"
                        >
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingTransaction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-8 max-w-md w-full space-y-4 relative border-primary/30">
            <h3 className="text-xl font-black text-white tracking-wide border-b border-white/10 pb-4 flex items-center gap-2">
              <ShieldAlert className="text-primary" /> Adjust Liability
            </h3>
            <form onSubmit={handleFineUpdate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Fine Amount (₹)</label>
                <input type="number" value={fineForm.fine} onChange={e => setFineForm({ ...fineForm, fine: Number(e.target.value) })} className="input-field" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Reason / Comment</label>
                <input type="text" value={fineForm.fineReason} onChange={e => setFineForm({ ...fineForm, fineReason: e.target.value })} placeholder="e.g., Broken cover, Lost copy..." className="input-field" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Violation Type</label>
                <select value={fineForm.fineType} onChange={e => setFineForm({ ...fineForm, fineType: e.target.value })} className="input-field bg-bg-dark">
                  <option value="Late">Late Submission</option>
                  <option value="Lost">Lost Book</option>
                  <option value="Damaged">Damaged Copy</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Settlement State</label>
                <select value={fineForm.fineStatus} onChange={e => setFineForm({ ...fineForm, fineStatus: e.target.value })} className="input-field bg-bg-dark">
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid In Full</option>
                  <option value="Waived">Waived / Reduced</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingTransaction(null)} className="w-1/2 py-3 rounded-2xl bg-white/5 text-white text-xs font-black tracking-widest uppercase border border-white/10 hover:bg-white/10 transition-all">Cancel</button>
                <button type="submit" className="w-1/2 btn-primary justify-center text-xs font-black tracking-widest uppercase">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FineManagement;
