import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trash2, Search, Link as LinkIcon, Eye, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

const AdminCreativePage = () => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedWork, setSelectedWork] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [confirmAction, setConfirmAction] = useState({ show: false, type: '', id: null });
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchWorks = async () => {
    try {
      const { data } = await api.get('/admin/creative');
      setWorks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  const handleUpdate = async (id, status, reason = '') => {
    try {
      await api.put(`/admin/creative/${id}`, { status, rejectionReason: reason });
      setConfirmAction({ show: false, type: '', id: null });
      setRejectingId(null);
      setRejectionReason('');
      fetchWorks();
    } catch (err) {
      alert('Action failed');
    }
  };

  const deleteWork = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this creative work? The author will be notified.')) return;
    try {
      await api.delete(`/admin/creative/${id}`);
      setWorks(works.filter(w => w._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete work.');
    }
  };

  const filteredWorks = works.filter(w => {
    const matchesSearch = w.title.toLowerCase().includes(search.toLowerCase()) || 
      w.author?.name.toLowerCase().includes(search.toLowerCase()) ||
      w.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3 dark:text-white">
            <Sparkles className="text-brand-600" size={32} />
            Creative Moderation
          </h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Audit and approve community submissions ({works.filter(w=>w.status==='pending').length} pending)
          </p>
        </div>
        
        {/* Tab Switcher */}
        <div className="inline-flex rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-900 shadow-inner">
           {['pending', 'approved', 'all'].map(tab => (
             <button 
               key={tab}
               onClick={() => setStatusFilter(tab)}
               className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === tab ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      {/* Controls */}
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input 
          type="text" 
          placeholder="Filter by title, author or category..."
          className="w-full rounded-2xl bg-white border border-slate-100 py-4 pl-10 pr-4 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-brand-600 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Works List */}
      <div className="rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap modern-table">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Content Detail</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Author</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}><td colSpan="4" className="p-8 animate-pulse bg-slate-50/50" /></tr>
                  ))
                ) : filteredWorks.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-0 border-none">
                      <div className="flex flex-col items-center justify-center w-full py-20 px-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic whitespace-normal">
                        No matching creative works found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredWorks.map((work) => (
                    <tr key={work._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-8 py-6" data-label="Content Detail">
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{work.title}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{work.category}</span>
                          <span className="text-[10px] font-bold text-slate-300">• {new Date(work.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6" data-label="Author">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 dark:bg-slate-800">
                             {work.author?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white">{work.author?.name}</p>
                            <p className="text-[10px] font-medium text-slate-400 leading-none">{work.author?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-black uppercase text-[10px]" data-label="Status">
                         <span className={`px-3 py-1 rounded-lg ${work.status === 'approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : work.status === 'rejected' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10' : 'bg-slate-100 text-slate-400'}`}>
                            {work.status}
                         </span>
                      </td>
                      <td className="px-8 py-6 text-right" data-label="Actions">
                         <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setSelectedWork(work)}
                              className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-brand-600 hover:text-white transition-all dark:bg-slate-800"
                              title="Audit Content"
                            >
                              <Eye size={16} />
                            </button>
                            {work.status === 'pending' && (
                              <button 
                                onClick={() => setConfirmAction({ show: true, type: 'approved', id: work._id })}
                                className="px-4 h-9 rounded-xl bg-emerald-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                              >
                                Approve
                              </button>
                            )}
                            <button 
                              onClick={() => deleteWork(work._id)}
                              className="h-9 w-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {selectedWork && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedWork(null)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-4xl h-[90vh] overflow-hidden rounded-[2.5rem] bg-white shadow-2xl dark:bg-slate-900 border border-white/10 flex flex-col"
            >
               <div className="shrink-0 flex items-center justify-between p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                       <Sparkles size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedWork.title}</h2>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                        BY {selectedWork.author?.name} • <span className="text-emerald-600 uppercase">{selectedWork.category}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedWork.status === 'pending' && (
                       <>
                         <button 
                           onClick={() => setConfirmAction({ show: true, type: 'approved', id: selectedWork._id })}
                           className="px-6 py-3 rounded-2xl bg-emerald-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
                         >
                           Approve Post
                         </button>
                         <button 
                           onClick={() => setRejectingId(selectedWork._id)}
                           className="px-6 py-3 rounded-2xl bg-rose-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-rose-500 transition-all"
                         >
                           Reject
                         </button>
                       </>
                    )}
                    <button onClick={() => setSelectedWork(null)} className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all dark:bg-slate-800">
                      <X size={20} />
                    </button>
                  </div>
               </div>
               <div className="flex-1 p-10 md:p-16 overflow-y-auto bg-slate-50 dark:bg-slate-950/50">
                  <div className="max-w-3xl mx-auto bg-white p-12 md:p-20 rounded-[2.5rem] shadow-xl dark:bg-slate-900">
                    <div 
                      className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 font-serif text-lg leading-relaxed first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left"
                      dangerouslySetInnerHTML={{ __html: selectedWork.content }}
                    />
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction.show && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-2xl dark:bg-slate-900">
              <div className="bg-emerald-50 text-emerald-600 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-6 dark:bg-emerald-500/10">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Broadcast Content?</h3>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400 leading-relaxed px-4">
                Approving this work will make it visible to everyone on Liyamu.
              </p>
              <div className="mt-8 flex gap-3">
                <button onClick={() => setConfirmAction({ show: false, type: '', id: null })} className="flex-1 rounded-xl bg-slate-100 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-200 dark:bg-slate-800">
                  Audit More
                </button>
                <button onClick={() => handleUpdate(confirmAction.id, 'approved')} className="flex-1 rounded-xl bg-emerald-600 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20">
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
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRejectingId(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md rounded-[2.5rem] bg-white overflow-hidden shadow-2xl dark:bg-slate-900">
                <div className="bg-rose-500 p-6 text-white text-center">
                   <h3 className="text-xl font-black uppercase tracking-tight">Reject Submission</h3>
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-100 mt-1">Provide feedback to the author</p>
                </div>
                <div className="p-8">
                   <textarea 
                     className="w-full rounded-2xl bg-slate-50 border-none p-5 text-sm font-black focus:ring-2 focus:ring-rose-500 transition-all dark:bg-slate-800 dark:text-white"
                     rows="4"
                     placeholder="State the reason for rejection..."
                     value={rejectionReason}
                     onChange={(e) => setRejectionReason(e.target.value)}
                   />
                   <div className="mt-6 flex gap-3">
                      <button onClick={() => setRejectingId(null)} className="flex-1 rounded-xl bg-slate-100 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:bg-slate-800">Cancel</button>
                      <button 
                        disabled={!rejectionReason.trim()}
                        onClick={() => handleUpdate(rejectingId, 'rejected', rejectionReason)}
                        className="flex-[2] rounded-xl bg-rose-600 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-rose-600/20 disabled:opacity-50"
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

export default AdminCreativePage;
