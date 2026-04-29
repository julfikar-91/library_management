import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Book, Users, Repeat, Library, LogOut, History, User, DollarSign } from 'lucide-react';

const Sidebar = ({ onLogout, userRole }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin'] },
    { name: 'My Profile', path: '/profile', icon: User, roles: ['student'] },
    { name: 'Books', path: '/books', icon: Book, roles: ['admin', 'student'] },
    { name: 'Members', path: '/members', icon: Users, roles: ['admin'] },
    { name: 'Transactions', path: '/transactions', icon: Repeat, roles: ['admin'] },
    { name: 'Fines', path: '/fines', icon: DollarSign, roles: ['admin'] },
    { name: 'My History', path: '/history', icon: History, roles: ['student'] },
  ];

  return (
    <aside className="w-72 glass-card m-6 border-r-0 rounded-[2.5rem] sticky top-6 h-[calc(100vh-3rem)] flex flex-col items-center py-10">
      <div className="flex items-center gap-4 mb-12 px-8 group cursor-pointer">
        <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg shadow-primary/30 group-hover:rotate-12 transition-transform duration-500">
          <Library className="text-white" size={28} />
        </div>
        <h1 className="text-2xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent italic tracking-tight">
          LIBRA
        </h1>
      </div>
      
      <nav className="w-full flex-1 px-5 space-y-3">
        {navItems.filter(item => item.roles.includes(userRole)).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                isActive 
                ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border border-white/10 text-white shadow-xl' 
                : 'text-text-muted hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-primary text-white' : 'bg-white/5 text-text-muted group-hover:text-white'}`}>
                  <item.icon size={18} />
                </div>
                <span className={`font-semibold tracking-wide ${isActive ? 'text-white' : 'text-text-muted group-hover:text-white'}`}>
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="w-full px-8 pt-8 border-t border-white/5 mt-auto space-y-4">
        {onLogout && (
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-white/5 border border-white/10 text-text-muted hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all font-bold text-xs uppercase tracking-widest group">
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>
        )}
        <div className="p-5 glass-card rounded-[1.5rem] bg-gradient-to-br from-white/5 to-transparent text-center relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-12 h-12 bg-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-1 font-bold">Powered by</p>
          <p className="text-sm font-black text-white tracking-wider">MREM SYSTEM</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
