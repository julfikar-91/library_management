import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, UserCheck, ShieldAlert, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import AddMemberModal from '../components/AddMemberModal';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/members');
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleMemberAdded = (newMember) => {
    setMembers(prev => [...prev, newMember]);
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/members/${id}`);
      setMembers(prev => prev.filter(m => m._id !== id));
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <AddMemberModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onMemberAdded={handleMemberAdded} />
      
      <div className="flex items-center justify-between bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight italic">Member Hub</h2>
          <p className="text-text-muted mt-1 font-medium italic">Directory of active and suspended library memberships.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
          <Plus size={20} strokeWidth={3} />
          <span className="uppercase tracking-widest text-xs font-black">Register New Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {members.map((member, index) => (
          <motion.div
            key={member._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-8 relative overflow-hidden group hover:bg-white/[0.06] shadow-primary/5"
          >
            <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-3xl transition-opacity duration-700 opacity-20 group-hover:opacity-40 ${member.status === 'Active' ? 'bg-primary' : 'bg-rose-500'}`}></div>
            
            <div className="flex items-start justify-between mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary blur-lg opacity-20 rounded-2xl group-hover:opacity-40 transition-opacity"></div>
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  {member.name.charAt(0)}
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${member.status === 'Active' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {member.status}
              </span>
            </div>

            <h3 className="text-xl font-black text-white mb-1 group-hover:text-primary transition-colors tracking-tight">{member.name}</h3>
            <p className="text-[10px] text-text-muted font-black tracking-[0.3em] uppercase opacity-60 mb-6">{member.memberId}</p>

            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex items-center gap-4 text-text-muted group/info cursor-default">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/info:bg-primary/20 transition-colors">
                  <Mail size={14} className="group-hover/info:text-primary transition-colors" />
                </div>
                <span className="text-xs font-bold tracking-wide group-hover/info:text-white transition-colors">{member.email}</span>
              </div>
              <div className="flex items-center gap-4 text-text-muted group/info cursor-default">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/info:bg-primary/20 transition-colors">
                  <UserCheck size={14} className="group-hover/info:text-primary transition-colors" />
                </div>
                <span className="text-xs font-bold tracking-wide group-hover/info:text-white transition-colors">Joined at Oct 2025</span>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all text-white shadow-inner">Profile Details</button>
              <button onClick={() => handleDeleteMember(member._id)} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-text-muted hover:text-white hover:bg-rose-500/10 hover:border-rose-500/20 transition-all">
                <ShieldAlert size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};


export default Members;
