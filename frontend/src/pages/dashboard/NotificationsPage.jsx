import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, CheckCircle, Clock, Shield, Trash2, Check, Heart, MessageSquare, 
  Coins, ExternalLink, AlertTriangle 
} from 'lucide-react';
import api from '../../api/client';

const NotificationsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get('/notifications');
      setItems(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setItems(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setItems(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const getIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('credit') || t.includes('purchase')) return <Coins className="text-brand-600" size={24} />;
    if (t.includes('rank') || t.includes('role')) return <Shield className="text-brand-600" size={24} />;
    if (t.includes('approved')) return <CheckCircle className="text-emerald-500" size={24} />;
    if (t.includes('rejected')) return <AlertTriangle className="text-rose-500" size={24} />;
    if (t.includes('like')) return <Heart className="text-rose-500" fill="currentColor" size={24} />;
    if (t.includes('comment')) return <MessageSquare className="text-emerald-500" size={24} />;
    return <Bell className="text-brand-600" size={24} />;
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20 mt-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 shrink-0 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/10 dark:bg-brand-600">
            <Bell size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Notifications</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Stay updated with your account activity</p>
          </div>
        </div>
        {items.some(n => !n.isRead) && (
          <div className="flex items-center gap-3">
             <span className="shrink-0 whitespace-nowrap rounded-xl bg-brand-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
               {items.filter(n => !n.isRead).length} Unread
             </span>
             <button 
               onClick={markAllAsRead} 
               className="flex h-9 shrink-0 whitespace-nowrap items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-[9px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-brand-500"
             >
               <CheckCircle size={14} /> Mark All Read
             </button>
          </div>
        )}
      </div>

      <div className="space-y-4 font-inter">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`group relative rounded-[2rem] p-6 border transition-all duration-300 ${
                item.isRead 
                  ? 'bg-slate-50/50 border-slate-100 dark:bg-slate-900/30 dark:border-slate-800' 
                  : 'bg-white border-brand-200 shadow-xl shadow-brand-600/10 dark:bg-slate-950 dark:border-brand-500/20'
              }`}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    item.isRead ? 'bg-slate-100 dark:bg-slate-800' : 'bg-brand-50 dark:bg-brand-500/10'
                  }`}>
                    {getIcon(item.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-black uppercase tracking-tight ${
                      item.isRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {item.title}
                    </h3>
                    <p className={`mt-2 text-xs leading-relaxed ${
                      item.isRead ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'
                    }`}>
                      {item.message}
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1">
                         <Clock size={10} />
                         {new Date(item.createdAt).toLocaleDateString()} @ {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                       
                       {item.link && (
                         <Link 
                           to={item.link}
                           onClick={() => !item.isRead && markAsRead(item.id)}
                           className="text-[9px] font-black uppercase tracking-widest text-brand-600 flex items-center gap-1 hover:underline"
                         >
                            View Details <ExternalLink size={10} />
                         </Link>
                       )}
                    </div>
                  </div>
                </div>
                
                {!item.isRead && (
                  <button 
                    onClick={() => markAsRead(item.id)}
                    className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-[9px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-brand-600 dark:bg-brand-600"
                  >
                    <Check size={14} /> Clear
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && !loading && (
          <div className="py-20 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-50 text-slate-300 dark:bg-slate-800/50">
              <Bell size={40} />
            </div>
            <h3 className="mt-6 text-sm font-black uppercase tracking-widest text-slate-400">Your inbox is empty</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
