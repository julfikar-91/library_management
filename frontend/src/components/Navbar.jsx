import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="h-24 flex items-center justify-between px-10 bg-transparent">
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
        <div className="flex items-center gap-4 border-r border-white/5 pr-8">
          <button className="relative p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group">
            <Bell size={20} className="text-text-muted group-hover:text-white transition-colors" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-secondary rounded-full border-2 border-bg-dark animate-pulse"></span>
          </button>
        </div>
        
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="text-right">
            <p className="text-sm font-black text-white leading-tight tracking-wide group-hover:text-primary transition-colors">Zainab Rashid</p>
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Administrator</p>
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
