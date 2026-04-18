import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, ArrowRight, Github, Chrome } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

const AuthPage = () => {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'beginner_reader' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        const { data } = await api.post('/auth/login', { email: form.email, password: form.password });
        setAuth(data);
        navigate('/dashboard');
      } else {
        await api.post('/auth/register', form);
        setTab('login');
        setError('Registration successful! Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden px-4 transition-colors duration-500">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Top Actions */}
        <div className="mb-8 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors dark:hover:text-white"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <Logo showText={false} />
        </div>

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl md:rounded-[2.5rem] glass-theme p-6 md:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/20"
        >
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {tab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="mt-2 text-xs md:text-sm font-medium text-slate-400 dark:text-slate-500">
              {tab === 'login' ? 'Enter your details to access your shelf.' : 'Start your literary journey with us today.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode='wait'>
              {tab === 'register' && (
                <motion.div 
                  key="register-name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      className="w-full rounded-2xl bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold border-none focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-800 dark:text-white"
                      placeholder="Your Name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="email"
                  className="w-full rounded-2xl bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold border-none focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-800 dark:text-white"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="password"
                  className="w-full rounded-2xl bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold border-none focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-800 dark:text-white"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-black uppercase tracking-widest text-rose-500 text-center bg-rose-50 py-2 rounded-xl dark:bg-rose-500/10"
              >
                {error}
              </motion.p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-slate-900/20 hover:bg-brand-600 transition-all disabled:opacity-50 dark:bg-brand-600 dark:shadow-brand-600/10"
            >
              {loading ? 'Processing...' : tab === 'login' ? 'Sign In' : 'Sign Up'}
              {!loading && <ArrowRight size={16} strokeWidth={3} />}
            </button>
          </form>

        </motion.div>

        {/* Bottom Toggle */}
        <p className="mt-8 text-center text-xs font-medium text-slate-400">
          {tab === 'login' ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
            className="ml-2 font-black text-slate-900 underline underline-offset-4 hover:text-brand-600 transition-colors uppercase tracking-widest text-[10px] dark:text-white"
          >
            {tab === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
