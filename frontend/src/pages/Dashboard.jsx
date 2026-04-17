import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Book as BookIcon, Users, Repeat, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [data, setData] = useState({ books: [], members: [], transactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, membersRes, txRes] = await Promise.all([
          axios.get('http://localhost:5000/api/books'),
          axios.get('http://localhost:5000/api/members'),
          axios.get('http://localhost:5000/api/transactions'),
        ]);
        setData({
          books: booksRes.data,
          members: membersRes.data,
          transactions: txRes.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const issuedCount = data.transactions.filter(t => t.status === 'Issued').length;
  const overdueCount = data.transactions.filter(t => t.status === 'Overdue').length;

  const stats = [
    { label: 'Total volumes', value: loading ? '...' : data.books.length, icon: BookIcon, color: 'from-primary/20 to-primary/5', iconColor: 'text-primary' },
    { label: 'Members', value: loading ? '...' : data.members.length, icon: Users, color: 'from-secondary/20 to-secondary/5', iconColor: 'text-secondary' },
    { label: 'Issued books', value: loading ? '...' : issuedCount, icon: Repeat, color: 'from-sky-500/20 to-sky-600/5', iconColor: 'text-sky-400' },
    { label: 'Active alerts', value: loading ? '...' : overdueCount, icon: AlertCircle, color: 'from-rose-500/20 to-rose-600/5', iconColor: 'text-rose-400' },
  ];

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-white tracking-tight">System Overview</h2>
        <p className="text-text-muted font-medium">Welcome back, Zainab! Here's the library's performance today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="glass-card p-8 group overflow-hidden relative"
          >
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="relative flex flex-col gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 ${stat.iconColor} group-hover:scale-110 transition-transform duration-300 shadow-inner shadow-white/5`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 glass-card p-8 bg-gradient-to-br from-white/[0.03] to-transparent">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white tracking-tight">Real-time Circulation</h3>
            <button className="text-xs font-bold text-primary hover:text-white transition-colors uppercase tracking-widest">View All</button>
          </div>
          <div className="space-y-4">
            {data.transactions.slice(0, 3).map((item, i) => (
              <div key={item._id || i} className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-pointer group">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 ${item.status === 'Issued' ? 'bg-sky-500/10 text-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.1)]' : 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(16,185,129,0.1)]'}`}>
                    {item.status === 'Issued' ? <Repeat size={20} /> : <BookIcon size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white group-hover:text-primary transition-colors">{item.book?.title || 'Unknown'}</p>
                    <p className="text-xs text-text-muted mt-0.5 font-medium">Reserved by <span className="text-white/80">{item.member?.name || 'Unknown'}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${item.status === 'Issued' ? 'bg-sky-500/10 text-sky-400' : 'bg-primary/10 text-primary'}`}>{item.status}</p>
                  <p className="text-[10px] text-text-muted mt-2 font-bold">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {!loading && data.transactions.length === 0 && (
               <p className="text-text-muted text-center py-4 font-medium italic">No circulation tracked yet.</p>
            )}
          </div>
        </div>

        <div className="glass-card p-8 flex flex-col">
          <h3 className="text-xl font-black text-white tracking-tight mb-8">Curated Trends</h3>
          <div className="grid grid-cols-2 gap-4 flex-1">
            {data.books.slice(0, 4).map((book, i) => (
              <div key={book._id || i} className="group relative rounded-3xl overflow-hidden aspect-[4/5] bg-bg-dark border border-white/5 cursor-pointer">
                <img 
                  src={`https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300`} 
                  alt="Book cover"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-bg-dark via-bg-dark/80 to-transparent">
                  <p className="font-extrabold text-[11px] text-white truncate mb-0.5">{book.title}</p>
                  <p className="text-text-muted text-[9px] font-bold uppercase tracking-tighter">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all text-text-muted hover:text-white">Explore Catalog</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
