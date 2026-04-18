import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, PlusCircle, LayoutDashboard, UserCircle, LogIn, Bell, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import NotificationBell from './NotificationBell';


const Navbar = () => {
  const { auth } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const baseLinks = [
    { name: 'Home', to: '/', type: 'link' },
    { name: 'Library', to: '/dashboard/library', type: 'link' },
    { name: 'Authors', to: '/dashboard/authors', type: 'link' },
    { name: 'About Us', to: '/about', type: 'link' },
    { name: 'Contact', to: '/contact', type: 'link' },
  ];

  const getActionLink = () => {
    if (!auth) return { name: 'Login', to: '/auth', icon: LogIn, color: 'bg-brand-600' };
    if (auth.role === 'admin') return { name: 'Dashboard', to: '/dashboard/admin', icon: LayoutDashboard, color: 'bg-slate-900 dark:bg-brand-600' };
    if (auth.role === 'author' || auth.role === 'verified_author' || auth.role === 'pro_writer') {
      return { name: 'Publish', to: '/dashboard/publish', icon: PlusCircle, color: 'bg-brand-600' };
    }
    return { name: 'Profile', to: '/dashboard/profile', icon: UserCircle, color: 'bg-slate-900 dark:bg-brand-600' };
  };

  const actionLink = getActionLink();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <nav className={`
          flex h-16 items-center justify-between rounded-[2rem] border px-6 transition-all duration-500
          ${scrolled 
            ? 'bg-white/80 border-slate-200/50 shadow-2xl shadow-slate-200/20 backdrop-blur-2xl dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-black/20' 
            : 'bg-white border-transparent shadow-sm dark:bg-slate-900 dark:border-slate-800'}
        `}>
          <Link to="/" onClick={() => setIsOpen(false)}>
            <Logo showText={true} />
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-10">
            {baseLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.to} 
                className={`group relative text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                  location.pathname === link.to ? 'text-brand-600' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {link.name}
                {location.pathname === link.to && (
                  <motion.div layoutId="navline" className="absolute -bottom-1 left-0 h-0.5 w-full bg-brand-600 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {auth && !isHomePage && <div className="hidden sm:block"><NotificationBell /></div>}
            
            <Link 
              to={actionLink.to}
              className={`hidden sm:flex items-center gap-3 rounded-2xl ${actionLink.color} pl-5 pr-3 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-600/10 hover:scale-105 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900`}
            >
              {actionLink.name}
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/20 overflow-hidden">
                {auth?.profilePicture ? (
                  <img src={auth.profilePicture.startsWith('http') ? auth.profilePicture : `${API_URL}${auth.profilePicture}`} alt="" className="h-full w-full object-cover" />
                ) : (
                  <actionLink.icon size={14} strokeWidth={3} />
                )}
              </div>
            </Link>

            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all lg:hidden ${
                isOpen ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 top-0 z-[-1] lg:hidden">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsOpen(false)}
               className="absolute inset-0 bg-slate-950/20 backdrop-blur-md dark:bg-black/60"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className={`absolute left-0 right-0 mx-4 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border-slate-800 transition-all duration-500 ${scrolled ? 'top-20' : 'top-24'}`}
            >
              <div className="flex flex-col gap-1">
                {baseLinks.map((link, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={link.name}
                  >
                    <Link 
                      to={link.to} 
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between rounded-2xl px-6 py-3.5 text-xs font-black uppercase tracking-widest transition-all ${
                        location.pathname === link.to 
                        ? 'bg-brand-50 text-brand-600 dark:bg-brand-600/10' 
                        : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      {link.name}
                      <ArrowRight size={14} className={location.pathname === link.to ? 'opacity-100' : 'opacity-0'} />
                    </Link>
                  </motion.div>
                ))}
                
                <hr className="my-4 border-slate-100 dark:border-slate-800" />
                
                  {auth && !isHomePage && (
                    <div className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 col-span-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activity</span>
                      <NotificationBell />
                    </div>
                  )}

                <Link 
                  to={actionLink.to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-2xl ${actionLink.color} px-8 py-5 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-brand-600/20`}
                >
                  {actionLink.name}
                  <actionLink.icon size={20} />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
