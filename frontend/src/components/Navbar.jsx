import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Search, User, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Navbar = ({ userRole }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const memberId = localStorage.getItem('mrem_user_id');

  useEffect(() => {
    if (userRole === 'student') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [userRole]);

  const fetchNotifications = async () => {
    if (!memberId) return;
    try {
      const { data } = await axios.get(`http://localhost:5000/api/notifications/student/${memberId}`);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.put(`http://localhost:5000/api/notifications/read/${id}`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-24 flex items-center justify-between px-10 bg-transparent shrink-0">
      <div className="relative w-[32rem] group">
        <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors duration-300" size={18} />
          <input 
            type="text" 
            placeholder="Search books, authors, or member IDs..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white placeholder-text-muted outline-none transition-all duration-300 focus:bg-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 shadow-inner"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
            <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-text-muted font-bold tracking-tighter">CTRL</kbd>
            <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-text-muted font-bold">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {userRole === 'student' && (
          <div className="flex items-center gap-4 border-r border-white/5 pr-8 relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group">
              <Bell size={20} className="text-text-muted group-hover:text-white transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg shadow-rose-500/50">
                  {unreadCount}
                </span>
              )}
            </button>

            {isOpen && (
              <div className="absolute top-16 right-8 w-80 bg-bg-dark border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-card z-50">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <h3 className="font-black text-white uppercase tracking-widest text-xs">Notifications</h3>
                  <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-text-muted text-xs font-bold">No notifications yet.</div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {notifications.map(n => (
                        <div key={n._id} className={`p-4 flex gap-3 ${!n.isRead ? 'bg-white/[0.04]' : 'opacity-70'} hover:bg-white/[0.06] transition-colors cursor-pointer`} onClick={(e) => markAsRead(n._id, e)}>
                          <div className="pt-0.5">
                            {n.type === 'success' ? <CheckCircle2 size={16} className="text-primary" /> : 
                             n.type === 'error' ? <AlertCircle size={16} className="text-rose-400" /> : 
                             <Info size={16} className="text-blue-400" />}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm ${!n.isRead ? 'text-white font-bold' : 'text-text-muted font-medium'}`}>{n.message}</p>
                            <p className="text-[10px] text-text-muted mt-1 font-bold">{new Date(n.createdAt).toLocaleTimeString()}</p>
                          </div>
                          {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="text-right">
            <p className="text-sm font-black text-white leading-tight tracking-wide group-hover:text-primary transition-colors capitalize">{userRole}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Active Session</p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary blur opacity-40 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <div className="relative w-12 h-12 rounded-2xl bg-bg-dark flex items-center justify-center border border-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20"></div>
              <User size={24} className="text-white relative z-10" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};


export default Navbar;
