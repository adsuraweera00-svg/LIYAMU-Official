import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Trash2, Check, Clock, User, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

const AdminContactsPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/contacts');
      setMessages(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/contacts/${id}/read`);
      setMessages(messages.map(m => m._id === id ? { ...m, status: 'read' } : m));
      toast.success('Message marked as read');
    } catch (err) {
      toast.error('Failed to update message');
    }
  };

  const handleDelete = async (id) => {
    const loadingToast = toast.loading('Deleting inquiry...');
    try {
      await api.delete(`/contacts/${id}`);
      setMessages(prev => prev.filter(m => m._id !== id));
      toast.success('Message deleted successfully', { id: loadingToast });
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(`Failed to delete: ${err.response?.data?.message || err.message}`, { id: loadingToast });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">User Inquiries</h1>
          <p className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-widest">Public contact form submissions</p>
        </div>
        <div className="flex h-12 items-center gap-4 rounded-2xl bg-white px-6 shadow-sm dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
            {messages.filter(m => m.status === 'unread').length} Unread Messages
          </span>
        </div>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="flex justify-center p-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 glass-theme rounded-[3rem] text-center border border-dashed border-slate-200 dark:border-slate-800">
            <div className="h-20 w-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-300 mb-6 dark:bg-slate-900">
              <MessageSquare size={40} />
            </div>
            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white">Clean Inbox</h3>
            <p className="text-xs font-medium text-slate-400 max-w-xs mt-2">No new inquiries from the public contact form at this time.</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div 
                key={msg._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.05 }}
                className={`group relative overflow-hidden rounded-[2.5rem] bg-white border p-8 transition-all hover:shadow-2xl dark:bg-slate-900 ${
                  msg.status === 'unread' ? 'border-brand-500/30 dark:border-brand-500/20' : 'border-slate-100 dark:border-slate-800 opacity-80'
                }`}
              >
                {msg.status === 'unread' && (
                  <div className="absolute top-0 right-0 h-24 w-24 bg-brand-600/10 [clip-path:polygon(100%_0,0_0,100%_100%)]">
                    <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-brand-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                  </div>
                )}

                <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 dark:bg-slate-800 dark:text-white">
                        <User size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3">
                          {msg.name}
                          {msg.status === 'unread' && <span className="text-[8px] font-black uppercase bg-brand-600 text-white px-3 py-1 rounded-full tracking-widest">New</span>}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <a href={`mailto:${msg.email}`} className="text-xs font-bold text-slate-400 hover:text-brand-600 flex items-center gap-1.5 transition-colors">
                            <Mail size={12} /> {msg.email}
                          </a>
                          <span className="h-1 w-1 rounded-full bg-slate-200" />
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                            <Clock size={12} /> {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-2xl bg-slate-50/50 p-6 dark:bg-slate-800/20 border border-slate-50 dark:border-slate-800">
                      <p className="text-sm font-medium text-slate-600 leading-relaxed dark:text-slate-300">
                        {msg.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-3 justify-end lg:justify-start">
                    {msg.status === 'unread' && (
                      <button 
                        onClick={() => handleMarkRead(msg._id)}
                        className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        title="Mark as Read"
                      >
                        <Check size={20} />
                      </button>
                    )}
                    <a 
                      href={`mailto:${msg.email}?subject=Re: Inquiry from ${msg.name} on Liyamu`}
                      className="h-12 w-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all shadow-sm"
                      title="Reply via Email"
                    >
                      <ExternalLink size={20} />
                    </a>
                    <button 
                      onClick={() => handleDelete(msg._id)}
                      className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                      title="Delete Message"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default AdminContactsPage;
