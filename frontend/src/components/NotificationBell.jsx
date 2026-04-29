import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const memberId = localStorage.getItem('mrem_user_id');
  const userRole = localStorage.getItem('mrem_user_role');

  if (userRole !== 'student' || !memberId) return null;

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
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
    <div className="fixed top-8 right-12 z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all shadow-lg backdrop-blur-md"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg shadow-rose-500/50">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-16 right-0 w-80 bg-bg-dark border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-card">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h3 className="font-black text-white uppercase tracking-widest text-xs">Notifications</h3>
            <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
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
                      <p className="text-[10px] text-text-muted mt-1 font-bold">{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString()}</p>
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
  );
};

export default NotificationBell;
