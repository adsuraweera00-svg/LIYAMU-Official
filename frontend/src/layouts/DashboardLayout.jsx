import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Library, 
  Users, 
  Bell, 
  UserCircle, 
  PenTool, 
  BookCheck, 
  BadgeCheck, 
  Wallet,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Plus,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Star,
  Coins,
  Mail,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import api from '../api/client';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const DashboardLayout = () => {
  const { auth, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(false);
  const [hasPendingPayouts, setHasPendingPayouts] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    if (!auth?.id) return;

    const unsubscribes = [];

    // Notification Listener
    const qNotif = query(
      collection(db, 'notifications'),
      where('user', '==', auth.id),
      where('read', '==', false)
    );
    unsubscribes.push(onSnapshot(qNotif, (snap) => {
      setHasUnreadAlerts(!snap.empty);
    }));

    // Admin Listeners
    if (auth.role === 'admin') {
      // Payouts
      const qPayouts = query(
        collection(db, 'withdrawals'),
        where('status', '==', 'pending')
      );
      unsubscribes.push(onSnapshot(qPayouts, (snap) => {
        setHasPendingPayouts(!snap.empty);
      }));

      // Contact Messages
      const qContacts = query(
        collection(db, 'contacts'),
        where('status', '==', 'unread')
      );
      unsubscribes.push(onSnapshot(qContacts, (snap) => {
        setHasUnreadMessages(!snap.empty);
      }));
    }

    return () => unsubscribes.forEach(unsub => unsub());
  }, [auth?.id, auth?.role]);
  
  const common = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/library', label: 'Library', icon: Library },
    { to: '/dashboard/creative', label: 'Creative Corner', icon: Sparkles },
    { to: '/dashboard/authors', label: 'Authors', icon: Users },
    { to: '/dashboard/notifications', label: 'Notifications', icon: Bell, hasAlert: hasUnreadAlerts },
    { to: '/dashboard/profile', label: 'Profile', icon: UserCircle },
    { to: '/dashboard/support', label: 'Get Support', icon: MessageSquare },
    { to: '/dashboard/credits', label: 'Buy Credits', icon: Coins },
  ];
  
  const isAuthor = ['author', 'verified_author', 'pro_writer'].includes(auth?.role);
  const showGoPro = isAuthor;
  
  const authorLinks = [
    { to: '/dashboard/publish', label: 'Publish', icon: PenTool },
    { to: '/dashboard/my-books', label: 'My Books', icon: BookCheck },
    { to: '/dashboard/verification', label: 'Verify', icon: BadgeCheck },
    { to: '/dashboard/earnings', label: 'Earnings', icon: Wallet },
    ...((auth?.isPro || auth?.role === 'pro_writer') ? [{ to: '/dashboard/payouts', label: 'Withdrawals', icon: Coins }] : []),
  ];
  
  const adminLinks = [
    { to: '/dashboard/admin/users', label: 'Users', icon: Users },
    { to: '/dashboard/admin/books', label: 'Books', icon: BookCheck },
    { to: '/dashboard/admin/reviews', label: 'Reviews', icon: ShieldAlert },
    { to: '/dashboard/admin/verifications', label: 'KYC', icon: BadgeCheck },
    { to: '/dashboard/admin/creative', label: 'Creative Mods', icon: Sparkles },
    { to: '/dashboard/admin/chat', label: 'Chat Mgmt', icon: MessageSquare },
    { to: '/dashboard/admin/contacts', label: 'Contact', icon: Mail, hasAlert: hasUnreadMessages },
    { to: '/dashboard/admin/credits', label: 'Credits Mgmt', icon: Coins },
    { to: '/dashboard/admin/payouts', label: 'Payouts Mgmt', icon: Wallet, hasAlert: hasPendingPayouts },
  ];

  const sidebarLinks = [
    { section: 'General', links: [...common, ...(showGoPro ? [{ to: '/dashboard/pro', label: 'Go Pro', icon: Star, highlight: true }] : [])] },
    ...(['reader', 'beginner_reader', 'pro_reader'].includes(auth?.role) ? [{ section: 'Account', links: [{ to: '/dashboard/verification', label: 'Become Author', icon: BadgeCheck }] }] : []),
    ...(['author', 'verified_author', 'pro_writer'].includes(auth?.role) ? [{ section: 'Author', links: authorLinks }] : []),
    ...(auth?.role === 'admin' ? [{ section: 'Management', links: adminLinks }] : []),
  ];

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const Sidebar = ({ onClose }) => (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-20 items-center justify-between border-b border-slate-100 px-8 dark:border-slate-800">
        <Link to="/" className="flex items-center gap-3" onClick={onClose}>
           <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.25)] border border-brand-500/20">
             <video src="/logo.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-screen" />
           </div>
           <span className="text-xl font-black tracking-widest text-slate-900 uppercase dark:text-white">Liyamu</span>
        </Link>
        <button onClick={onClose} className="md:hidden text-slate-400 p-2">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-hide">
        <nav className="space-y-10">
          {sidebarLinks.map((item) => (
            <div key={item.section}>
              <p className="mb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                {item.section}
              </p>
              <div className="space-y-2">
                {item.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    end={link.to === '/dashboard'}
                    className={({ isActive }) => `
                      group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300
                      ${isActive 
                        ? 'bg-emerald-900/10 backdrop-blur-sm border border-emerald-500/10 text-emerald-600 shadow-[0_4px_20px_rgba(5,150,105,0.05)]' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white'}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3 relative">
                          <link.icon size={20} className={isActive ? 'text-brand-600' : 'text-slate-400 dark:text-slate-500'} />
                          {link.label}
                        </div>
                        <div className="flex items-center gap-3">
                           <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-100 p-6 dark:border-slate-800">
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold uppercase dark:bg-slate-800 dark:text-white overflow-hidden border border-white/50 shadow-sm">
             {auth?.profilePicture ? (
               <img src={auth.profilePicture.startsWith('http') ? auth.profilePicture : `${API_URL}${auth.profilePicture}`} alt="" className="h-full w-full object-cover" />
             ) : (
               auth?.name?.[0] || 'U'
             )}
          </div>
          <div className="overflow-hidden">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <p className="text-xs font-black text-slate-900 truncate dark:text-white">{auth?.name}</p>
                {auth?.isPro && <Star size={10} className="fill-amber-400 text-amber-400 shrink-0" />}
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest dark:text-slate-500">
                {auth?.role.replace('_', ' ')}
              </p>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all border border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-rose-400 dark:hover:bg-rose-500/10 shadow-sm"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen font-sans bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-screen">
        <Sidebar onClose={() => {}} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "tween", duration: 0.3, ease: "circOut" }}
              className="absolute left-0 top-0 h-full w-72"
            >
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-72 min-h-screen">
        <DashboardHeader onMobileMenuOpen={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 p-4 sm:p-6 md:p-8 transition-all duration-300">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
