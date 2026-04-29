import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, BookOpen, Clock, Building, GraduationCap } from 'lucide-react';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const memberId = localStorage.getItem('mrem_user_id');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/members/${memberId}`);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-white">Profile not found.</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight italic">My Profile</h2>
          <p className="text-text-muted mt-1 font-medium italic">Manage your academic and personal details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-primary/10">
            <User size={120} strokeWidth={1} />
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Personal Details</h3>
          
          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-black mb-1">Full Name</p>
              <p className="text-xl font-bold text-white">{profile.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-black mb-1">Student ID</p>
              <p className="text-md font-mono text-primary bg-primary/10 px-3 py-1 rounded-lg inline-block border border-primary/20">{profile.memberId}</p>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-text-muted" size={16} />
              <p className="text-sm font-bold text-white">{profile.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="text-text-muted" size={16} />
              <p className="text-sm font-bold text-white">{profile.phone || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-secondary/10">
            <GraduationCap size={120} strokeWidth={1} />
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Academic Info</h3>
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl text-white/50 border border-white/10">
                <Building size={20} />
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-black mb-1">Department</p>
                <p className="text-lg font-bold text-white">{profile.department || 'Not Assigned'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl text-white/50 border border-white/10">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-black mb-1">Semester</p>
                <p className="text-lg font-bold text-white">{profile.semester ? `${profile.semester} Semester` : 'Not Assigned'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl text-white/50 border border-white/10">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-black mb-1">Books Borrowed</p>
                <p className="text-lg font-bold text-white">{profile.borrowedBooks?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
