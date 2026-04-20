import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Check, X, ShieldAlert, FileText, User as UserIcon, Phone, Mail, Award, Clock, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminVerificationsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/verifications');
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [confirmAction, setConfirmAction] = useState({ show: false, type: '', id: null });
  const [activeTab, setActiveTab] = useState('pending');

  const decide = async (id, status, reason = '') => {
    try {
      await api.put(`/admin/verifications/${id}`, { status, rejectionReason: reason });
      setRejectingId(null);
      setRejectionReason('');
      setConfirmAction({ show: false, type: '', id: null });
      load();
    } catch (err) {
      alert('Action failed');
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
    </div>
  );

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const pendingRequests = items.filter(i => i.status === 'pending');
  const historyRequests = items.filter(i => i.status !== 'pending');

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
            <ShieldAlert size={24} className="md:h-7 md:w-7" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Verification Center</h2>
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Review author applications and audit history</p>
          </div>
        </div>
        
        {/* Tab Switcher */}
        <div className="inline-flex rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-900 shadow-inner">
           <button 
             onClick={() => setActiveTab('pending')}
             className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Pending ({pendingRequests.length})
           </button>
           <button 
             onClick={() => setActiveTab('history')}
             className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Audit History ({historyRequests.length})
           </button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        <div className="grid gap-6 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {pendingRequests.map((item, i) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative rounded-3xl md:rounded-[2.5rem] bg-white p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/20 dark:bg-slate-900 dark:border-slate-800 transition-all hover:border-brand-500/20"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 md:mb-8">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                      <UserIcon size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight dark:text-white">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                         <Mail size={12} className="text-slate-400" />
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{item.author?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl bg-slate-50 p-6 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <FileText size={16} className="text-slate-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Government ID</span>
                     </div>
                     <span className="text-xs font-black text-slate-900 dark:text-slate-300 uppercase tracking-tight">{item.idNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <Phone size={16} className="text-slate-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Contact Number</span>
                     </div>
                     <span className="text-xs font-black text-slate-900 dark:text-slate-300 uppercase tracking-tight">{item.contactNumber}</span>
                  </div>
                  <a 
                    href={item.documentUrl ? (item.documentUrl.startsWith('http') ? item.documentUrl : `${API_URL}${item.documentUrl}`) : '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 mt-4 rounded-xl bg-slate-200 py-3 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-300 transition-all dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  >
                    <Eye size={14} /> View Verification Document
                  </a>
                </div>

                <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <button 
                    onClick={() => setConfirmAction({ show: true, type: 'accepted', id: item.id })} 
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all active:scale-95"
                  >
                    <Check size={14} strokeWidth={3} /> Approve Author
                  </button>
                  <button 
                    onClick={() => setRejectingId(item.id)} 
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 active:scale-95"
                  >
                    <X size={14} strokeWidth={3} /> Reject Request
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {pendingRequests.length === 0 && (
            <div className="md:col-span-2 py-20 text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-50 text-slate-200 dark:bg-slate-800/50 mb-6">
                 <ShieldAlert size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight dark:text-white">All Clear</h3>
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">No pending verification requests found.</p>
            </div>
          )}
        </div>
      ) : (
        /* History Section as Table */
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden dark:bg-slate-900 dark:border-slate-800"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap modern-table">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">User Details</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Contact</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Date Actioned</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 text-right">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {historyRequests.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-6" data-label="User Details">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg ${item.status === 'accepted' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}>
                          <Award size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">{item.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{item.author?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-xs font-black text-slate-600 dark:text-slate-400 tabular-nums" data-label="Contact">
                       {item.contactNumber}
                    </td>
                    <td className="px-6 py-6" data-label="Status">
                       <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${item.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'}`}>
                          {item.status}
                       </span>
                    </td>
                    <td className="px-6 py-6 text-xs font-black text-slate-500 dark:text-slate-600" data-label="Date Actioned">
                       {new Date(item.reviewedAt || item.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right" data-label="Admin">
                       <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-400">
                          <Check size={14} className="text-slate-400" /> System Admin
                       </div>
                    </td>
                  </tr>
                ))}
                {historyRequests.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-0 border-none">
                      <div className="flex flex-col items-center justify-center w-full py-20 px-8 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] whitespace-normal">
                         No application history found.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Action Confirmation Modal */}
      <AnimatePresence>
        {confirmAction.show && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-2xl dark:bg-slate-900"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
                <Check size={32} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Confirm Approval</h3>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400 leading-relaxed text-center">
                Are you sure you want to approve this author? This will give them full publishing rights on Liyamu.
              </p>
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setConfirmAction({ show: false, type: '', id: null })}
                  className="flex-1 rounded-xl bg-slate-100 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-200 transition-all dark:bg-slate-800"
                >
                  Go Back
                </button>
                <button 
                  onClick={() => decide(confirmAction.id, 'accepted')}
                  className="flex-1 rounded-xl bg-emerald-600 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all"
                >
                  Yes, Approve
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectingId && (
          <div className="fixed inset-0 z-[260] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setRejectingId(null)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-md overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-white shadow-2xl dark:bg-slate-900"
             >
                <div className="bg-rose-500 p-6 md:p-8 text-white flex justify-between items-center">
                   <div>
                     <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none">Reject Application</h2>
                     <p className="mt-1 md:mt-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-rose-100">Help the user understand why</p>
                   </div>
                   <button onClick={() => setRejectingId(null)} className="rounded-xl bg-white/20 p-2 hover:bg-white/30 transition-all">
                     <X size={20} />
                   </button>
                </div>
                <div className="p-6 md:p-8">
                   <div className="rounded-2xl bg-rose-50 p-4 border border-rose-100 flex gap-3 mb-6 dark:bg-rose-500/10 dark:border-rose-500/20">
                      <ShieldAlert size={18} className="text-rose-600 shrink-0 mt-0.5" />
                      <p className="text-[9px] md:text-[10px] font-medium text-rose-600 leading-relaxed">
                         The user will receive an automated notification with this feedback. Be professional.
                      </p>
                   </div>
                   <textarea 
                     className="w-full rounded-2xl bg-slate-50 p-4 md:p-6 text-xs md:text-sm font-bold border-none focus:ring-2 focus:ring-rose-500 transition-all placeholder:text-slate-300 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-600"
                     rows="4"
                     placeholder="State the reason for rejection..."
                     value={rejectionReason}
                     onChange={(e) => setRejectionReason(e.target.value)}
                   />
                   <div className="mt-6 md:mt-8 flex flex-col md:flex-row gap-3 md:gap-4">
                      <button 
                        onClick={() => setRejectingId(null)}
                        className="w-full md:flex-1 rounded-2xl bg-slate-50 px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                      <button 
                        disabled={!rejectionReason.trim()}
                        onClick={() => decide(rejectingId, 'rejected', rejectionReason)}
                        className="w-full md:flex-[2] rounded-2xl bg-slate-900 px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-900/10 hover:bg-brand-600 transition-all disabled:opacity-50 dark:bg-brand-600"
                      >
                        Confirm Rejection
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminVerificationsPage;
