import React, { useState } from 'react';
import axios from 'axios';
import { BookOpen, KeyRound, Mail, ArrowRight, Phone, ShieldCheck, Undo2 } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot', 'otp'
  const [role, setRole] = useState('student'); // 'student', 'admin'
  const [formData, setFormData] = useState({ name: '', memberId: '', email: '', password: '', phone: '', address: '', department: '', semester: '', otp: '', newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password,
        role
      });
      localStorage.setItem('mrem_admin_token', response.data.token);
      localStorage.setItem('mrem_user_role', response.data.user.role);
      localStorage.setItem('mrem_user_id', response.data.user.id);
      onLogin(response.data.user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const payload = {
        role,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        name: formData.name,
        memberId: formData.memberId,
        address: formData.address,
        department: formData.department,
        semester: formData.semester
      };
      await axios.post('http://localhost:5000/api/auth/register', payload);
      setSuccess('Registration successful. Please login.');
      setView('login');
      setFormData({ ...formData, password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email: formData.email
      });
      setSuccess(response.data.message);
      setView('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      setSuccess('Password updated successfully. Please login.');
      setView('login');
      setFormData({ ...formData, password: '', otp: '', newPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[420px] relative z-10 animate-fade-in">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center text-primary mb-6 shadow-[0_0_40px_rgba(16,185,129,0.15)] shadow-primary/20">
            <BookOpen size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-tight">MREM LMS</h1>
          <p className="text-text-muted mt-2 text-sm font-medium tracking-wide">
            {view === 'login' && 'Enter your credentials to access the system.'}
            {view === 'register' && 'Create a new account.'}
            {view === 'forgot' && 'Reset your access.'}
            {view === 'otp' && 'Verify email OTP to authorize reset.'}
          </p>
        </div>

        <div className="glass-card p-8 sm:p-10 border-white/5 shadow-2xl relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold px-4 py-3 rounded-xl tracking-wide text-center mb-6">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-4 py-3 rounded-xl tracking-wide text-center mb-6">
              {success}
            </div>
          )}

          {(view === 'login' || view === 'register') && (
            <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl border border-white/5">
              <button onClick={() => { setRole('student'); setError(''); setSuccess(''); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${role === 'student' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-white hover:bg-white/5'}`}>Student</button>
              <button onClick={() => { setRole('admin'); setError(''); setSuccess(''); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${role === 'admin' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-white hover:bg-white/5'}`}>Admin</button>
            </div>
          )}

          {view === 'login' && (
            <form onSubmit={handleSubmitLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5 relative group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 group-focus-within:text-primary transition-colors">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@mrem.edu" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-text-muted/50 outline-none transition-all focus:bg-white/10 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 shadow-inner" required />
                  </div>
                </div>

                <div className="space-y-1.5 relative group">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 group-focus-within:text-primary transition-colors">Password</label>
                    <button type="button" onClick={() => { setView('forgot'); setError(''); setSuccess(''); }} className="text-[10px] font-bold text-primary hover:text-white transition-colors">Forgot Password?</button>
                  </div>
                  <div className="relative">
                    <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-text-muted/50 outline-none transition-all focus:bg-white/10 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 shadow-inner tracking-widest" required />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full btn-primary py-4 justify-center mt-2 group relative overflow-hidden">
                <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-xs font-black">
                  {loading ? 'Authenticating...' : 'Authenticate'}
                  {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                </span>
              </button>
              
              <p className="text-center text-xs text-text-muted mt-4">
                Don't have an account? <button type="button" onClick={() => setView('register')} className="text-primary hover:underline font-bold">Register</button>
              </p>
            </form>
          )}

          {view === 'register' && (
            <form onSubmit={handleSubmitRegister} className="space-y-6">
              <div className="space-y-4">
                {role === 'student' && (
                  <>
                    <div className="space-y-1.5 relative group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 group-focus-within:text-primary transition-colors">Full Name</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white placeholder-text-muted/50 outline-none transition-all focus:bg-white/10 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 shadow-inner" required />
                    </div>
                    <div className="space-y-1.5 relative group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 group-focus-within:text-primary transition-colors">Student ID</label>
                      <input type="text" value={formData.memberId} onChange={(e) => setFormData({...formData, memberId: e.target.value})} placeholder="STU12345" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white placeholder-text-muted/50 outline-none transition-all focus:bg-white/10 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 shadow-inner" required />
                    </div>
                    <div className="flex gap-4">
                      <div className="space-y-1.5 relative group flex-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 group-focus-within:text-primary transition-colors">Department</label>
                        <select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full bg-bg-dark border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white outline-none transition-all focus:bg-white/10 focus:border-primary/40 focus:ring-4 focus:ring-primary/5" required>
                          <option value="">Select Dept</option>
                          <option value="CSE">CSE</option>
                          <option value="ECE">ECE</option>
                          <option value="ME">ME</option>
                          <option value="CE">CE</option>
                        </select>
                      </div>
                      <div className="space-y-1.5 relative group flex-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 group-focus-within:text-primary transition-colors">Semester</label>
                        <select value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})} className="w-full bg-bg-dark border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white outline-none transition-all focus:bg-white/10 focus:border-primary/40 focus:ring-4 focus:ring-primary/5" required>
                          <option value="">Select Sem</option>
                          <option value="1">1st</option>
                          <option value="2">2nd</option>
                          <option value="3">3rd</option>
                          <option value="4">4th</option>
                          <option value="5">5th</option>
                          <option value="6">6th</option>
                          <option value="7">7th</option>
                          <option value="8">8th</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1.5 relative group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 group-focus-within:text-primary transition-colors">Email Address</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@mrem.edu" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white placeholder-text-muted/50 outline-none transition-all focus:bg-white/10 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 shadow-inner" required />
                </div>

                <div className="space-y-1.5 relative group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 group-focus-within:text-primary transition-colors">Phone Number</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 890" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white placeholder-text-muted/50 outline-none transition-all focus:bg-white/10 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 shadow-inner" required />
                </div>

                <div className="space-y-1.5 relative group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 group-focus-within:text-primary transition-colors">Password</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white placeholder-text-muted/50 outline-none transition-all focus:bg-white/10 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 shadow-inner tracking-widest" required />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full btn-primary py-4 justify-center mt-2 group relative overflow-hidden">
                <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-xs font-black">
                  {loading ? 'Registering...' : 'Create Account'}
                  {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                </span>
              </button>

              <p className="text-center text-xs text-text-muted mt-4">
                Already have an account? <button type="button" onClick={() => setView('login')} className="text-primary hover:underline font-bold">Login</button>
              </p>
            </form>
          )}

          {view === 'forgot' && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5 relative group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 group-focus-within:text-primary transition-colors">Recovery Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="admin@mrem.edu" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-text-muted/50 outline-none transition-all focus:bg-white/10 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 shadow-inner tracking-widest" required />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setView('login'); setError(''); setSuccess(''); }} className="w-14 items-center justify-center flex rounded-2xl bg-white/5 border border-white/10 text-text-muted hover:text-white hover:bg-white/10 transition-all">
                  <Undo2 size={18} />
                </button>
                <button type="submit" disabled={loading} className="flex-1 btn-primary py-4 justify-center">
                  <span className="uppercase tracking-[0.2em] text-[11px] font-black">{loading ? 'Processing...' : 'Send Email OTP'}</span>
                </button>
              </div>
            </form>
          )}

          {view === 'otp' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5 relative group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 group-focus-within:text-primary transition-colors">4-Digit Auth Code</label>
                  <div className="relative">
                    <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input type="text" maxLength={4} value={formData.otp} onChange={(e) => setFormData({...formData, otp: e.target.value})} placeholder="0000" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-center text-xl font-black tracking-[1em] text-white placeholder-text-muted/50 outline-none transition-all focus:bg-white/10 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 shadow-inner" required />
                  </div>
                </div>

                <div className="space-y-1.5 relative group pt-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 group-focus-within:text-primary transition-colors">New Password</label>
                  <div className="relative">
                    <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input type="password" value={formData.newPassword} onChange={(e) => setFormData({...formData, newPassword: e.target.value})} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-text-muted/50 outline-none transition-all focus:bg-white/10 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 shadow-inner tracking-widest" required />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setView('forgot')} className="w-14 items-center justify-center flex rounded-2xl bg-white/5 border border-white/10 text-text-muted hover:text-white hover:bg-white/10 transition-all">
                  <Undo2 size={18} />
                </button>
                <button type="submit" disabled={loading} className="flex-1 btn-primary py-4 justify-center">
                  <span className="uppercase tracking-[0.2em] text-[11px] font-black">{loading ? 'Updating...' : 'Secure & Reset'}</span>
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-[11px] text-text-muted/60 mt-8 font-medium">
            Authorized Personnel Only • MREM Central Server
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
