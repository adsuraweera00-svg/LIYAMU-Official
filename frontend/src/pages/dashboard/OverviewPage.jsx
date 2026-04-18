import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  PenTool, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  Edit3,
  Star,
  BarChart3,
  Rocket
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRoleBadge } from '../../utils/badges';
import api from '../../api/client';

const OverviewPage = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const { auth } = useAuth();
  const badge = getRoleBadge(auth?.role);
  const [authorStats, setAuthorStats] = useState(null);
  const [lastBook, setLastBook] = useState(null);
  const isAuthor = auth?.role === 'author' || auth?.role === 'verified_author' || auth?.role === 'pro_writer';

  useEffect(() => {
    if (isAuthor) {
      api.get('/books/stats').then(res => setAuthorStats(res.data)).catch(console.error);
    }
    if (auth?.lastReadBook) {
      api.get(`/books/${auth.lastReadBook}`).then(res => setLastBook(res.data)).catch(console.error);
    }
  }, [isAuthor, auth?.lastReadBook]);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const stats = [
    { label: 'Purchased Books', value: auth?.purchasedBooks?.length || 0, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10', to: '/dashboard/library' },
    { label: 'Reading List', value: auth?.readingHistory?.length || 0, icon: Users, color: 'text-brand-400', bg: 'bg-brand-400/10', to: '/dashboard/library' },
    { label: 'Wishlist', value: auth?.wishlist?.length || 0, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10', to: '/dashboard/library' },
  ];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Continue Reading Section (Continuity Feature) */}
      <AnimatePresence>
        {lastBook && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="relative rounded-3xl md:rounded-[2.5rem] glass-theme p-6 md:p-8 shadow-2xl shadow-slate-900/20 text-white group overflow-hidden border border-white/20">
               <div className="absolute top-0 right-0 h-full w-full md:w-1/2 bg-gradient-to-l from-brand-600/20 to-transparent pointer-events-none" />
               <div className="absolute bottom-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BookOpen size={120} />
               </div>
               
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="h-40 w-28 shrink-0 overflow-hidden rounded-2xl shadow-2xl group-hover:scale-105 transition-transform">
                     {lastBook.coverUrl ? (
                        <img src={lastBook.coverUrl.startsWith('http') ? lastBook.coverUrl : `${API_URL}${lastBook.coverUrl}`} className="h-full w-full object-cover" alt="" />
                     ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-600">
                           <BookOpen size={32} />
                        </div>
                     )}
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                     <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-brand-400">
                        <Rocket size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Pick up where you left off</span>
                     </div>
                     <h2 className="text-3xl font-black uppercase tracking-tight mb-2 leading-none">{lastBook.title}</h2>
                     <p className="text-slate-400 text-xs font-medium max-w-lg mb-6 leading-relaxed">
                        Continue your journey through this masterpiece. Your progress is synced across all your devices.
                     </p>
                     
                     <Link 
                       to={`/dashboard/library/${lastBook._id}`}
                       className="inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-brand-500 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
                     >
                        Resume Reading
                        <ChevronRight size={14} />
                     </Link>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: User Profile Card */}
        <motion.div 
          variants={item}
          className="lg:col-span-2 relative overflow-hidden rounded-3xl md:rounded-[2.5rem] glass-theme border border-white/20 shadow-xl shadow-slate-200/20"
        >
          <div className="absolute top-0 left-0 w-full h-24 md:h-32 bg-slate-900" />
          <div className="relative p-6 pt-16 md:p-10 md:pt-20">
             <div className="flex flex-col md:flex-row items-center md:items-end text-center md:text-left gap-4 md:gap-6">
                <div className="relative">
                   <div className={`h-32 w-32 rounded-[2.5rem] border-4 border-white ${badge.color} flex items-center justify-center shadow-xl`}>
                      {auth?.avatar ? (
                        <img src={auth.avatar.startsWith('http') ? auth.avatar : `${API_URL}${auth.avatar}`} alt={auth.name} className="h-full w-full rounded-[2.5rem] object-cover" />
                      ) : (
                        <badge.icon size={60} className={badge.badgeColor} />
                      )}
                   </div>
                   <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-brand-600 flex items-center justify-center border-4 border-white shadow-lg">
                      <ShieldCheck size={20} className="text-white" />
                   </div>
                </div>
                <div className="flex-1">
                   <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 leading-none">{auth?.name}</h1>
                   <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-wider ${badge.color}`}>
                         {badge.label}
                      </span>
                      <span className="rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500">
                         {auth?.role.replace('_', ' ')}
                      </span>
                   </div>
                </div>
                <Link 
                  to="/dashboard/profile"
                  className="rounded-2xl bg-slate-50 p-4 text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all group"
                >
                  <Edit3 size={20} className="group-hover:rotate-12 transition-transform" />
                </Link>
             </div>

             <div className="mt-10 grid gap-6 md:grid-cols-2 border-t border-slate-50 pt-10">
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Mail size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</p>
                      <p className="text-sm font-bold text-slate-700">{auth?.email}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Phone size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Number</p>
                      <p className="text-sm font-bold text-slate-700">{auth?.phone || 'Not provided'}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Calendar size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Member Since</p>
                      <p className="text-sm font-bold text-slate-700">{new Date(auth?.createdAt).toLocaleDateString()}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <TrendingUp size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Status</p>
                      <p className="text-sm font-bold text-emerald-600">Active & Verified</p>
                   </div>
                </div>
             </div>
          </div>
        </motion.div>

        {/* Right Column: Stats & Quick Links */}
        <motion.div variants={item} className="space-y-6">
          {stats.map((stat, i) => (
            <Link 
              key={i} 
              to={stat.to}
              className="group flex items-center justify-between rounded-[2.5rem] glass-theme p-8 border border-white/10 shadow-xl hover:shadow-brand-600/10 hover:-translate-y-2 transition-all hover:bg-slate-900/60"
            >
              <div className="flex items-center gap-5">
                <div className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-black/20`}>
                   <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 leading-none mb-2">{stat.label}</p>
                  <motion.h3 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="text-3xl font-black text-slate-900 dark:text-white"
                  >
                    {stat.value}
                  </motion.h3>
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-50/5 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                <ChevronRight size={18} className="text-brand-600" />
              </div>
            </Link>
          ))}

          <Link 
            to="/dashboard/library" 
            className="block w-full rounded-[2rem] bg-brand-600 p-8 text-white shadow-xl shadow-brand-600/20 hover:bg-brand-500 transition-all text-center"
          >
            <h4 className="text-lg font-black uppercase tracking-tight">Explore the Library</h4>
            <p className="text-xs font-medium text-brand-100 mt-1">Discover millions of digital books</p>
          </Link>
        </motion.div>
      </div>

      {/* Author Performance (Conditional) */}
      {isAuthor && authorStats && (
        <motion.div 
           variants={item}
           className="rounded-3xl md:rounded-[2.5rem] bg-brand-600 p-6 md:p-10 text-white shadow-2xl shadow-brand-600/30 overflow-hidden relative"
        >
           {/* Decorative UI elements */}
           <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
           <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-black/10 blur-2xl" />
           
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                 <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Rocket size={20} className="text-white" />
                 </div>
                 <h2 className="text-xl font-black uppercase tracking-tight">Your Performance at a Glance</h2>
              </div>

              <div className="grid gap-10 md:grid-cols-4">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-100 opacity-60">Total Views</p>
                    <h3 className="text-4xl font-black tracking-tight">{authorStats.totalViews || 0}</h3>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${Math.min((authorStats.totalViews / 1000) * 100, 100)}%` }}
                         transition={{ duration: 1, ease: "easeOut" }}
                         className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-100 opacity-60">Total Sales</p>
                    <h3 className="text-4xl font-black tracking-tight">{authorStats.totalSales || 0}</h3>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${Math.min((authorStats.totalSales / 100) * 100, 100)}%` }}
                         transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                         className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-100 opacity-60">Avg. Rating</p>
                    <div className="flex items-end gap-2">
                       <h3 className="text-4xl font-black tracking-tight">{authorStats.avgRating?.toFixed(1) || '0.0'}</h3>
                       <Star size={24} className="mb-1 text-brand-300 fill-zinc-300" />
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${(authorStats.avgRating / 5) * 100 || 0}%` }}
                         transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                         className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-100 opacity-60">Active Books</p>
                    <h3 className="text-4xl font-black tracking-tight">{authorStats.bookCount || 0}</h3>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${Math.min((authorStats.bookCount / 10) * 100, 100)}%` }}
                         transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                         className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                       />
                    </div>
                 </div>
              </div>
           </div>
        </motion.div>
      )}

      {/* Bio / About Section */}
      <motion.div 
        variants={item}
        className="rounded-3xl md:rounded-[2.5rem] glass-theme p-6 md:p-10 border border-white/20"
      >
        <h3 className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Your Bio</h3>
        {auth?.bio ? (
           <p className="text-lg font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">"{auth.bio}"</p>
        ) : (
           <p className="text-sm font-medium text-slate-400 italic">No bio written yet. Tell us who you are in the profile settings!</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default OverviewPage;
