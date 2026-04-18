import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Search, 
  Filter, 
  User as UserIcon, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  ChevronRight,
  X,
  Eye,
  FileText,
  Trash2
} from 'lucide-react';
import api from '../../api/client';

const AdminPayoutsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReq, setSelectedReq] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [slipFile, setSlipFile] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const loadRequests = async () => {
    try {
      const { data } = await api.get('/withdrawals/admin');
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const handleProcess = async (id, status) => {
    if (status === 'completed' && !slipFile) return toast.error('Please upload a confirmation slip.');
    if (status === 'rejected' && !rejectionReason) return toast.error('Please provide a rejection reason.');

    const processingToast = toast.loading(`Processing ${status} status...`);
    setSubmitting(true);
    const formData = new FormData();
    formData.append('status', status);
    if (status === 'completed') formData.append('payoutSlip', slipFile);
    if (status === 'rejected') formData.append('rejectionReason', rejectionReason);

    try {
      const { data } = await api.put(`/withdrawals/admin/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setRequests(prev => prev.map(r => r._id === id ? data : r));
      setSelectedReq(null);
      setSlipFile(null);
      setRejectionReason('');
      toast.success(`Payout request ${status} successfully!`, { id: processingToast });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Processing failed', { id: processingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayout = async (id) => {
    const deletingToast = toast.loading('Deleting payout record...');
    try {
      await api.delete(`/withdrawals/admin/${id}`);
      setRequests(prev => prev.map(r => r._id === id ? { ...r, isDeleting: true } : r));
      // Use timeout for animation or just filter
      setTimeout(() => {
        setRequests(prev => prev.filter(r => r._id !== id));
      }, 300);
      setConfirmDelete({ show: false, id: null });
      toast.success('Payout record deleted permanently', { id: deletingToast });
    } catch (err) {
      toast.error('Failed to delete record', { id: deletingToast });
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
                         req.user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusIcons = {
    pending: { icon: Clock, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
    completed: { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
    rejected: { icon: AlertCircle, color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
           <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Payout Management</h1>
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Oversee author withdrawal requests and coordinate transfers</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
           <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                className="w-full rounded-2xl bg-white py-3 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest border border-slate-100 focus:ring-2 focus:ring-brand-600 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                placeholder="Search Authors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <select 
             className="rounded-2xl bg-white py-3 px-6 text-[10px] font-black uppercase tracking-widest border border-slate-100 focus:ring-2 focus:ring-brand-600 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
           >
              <option value="all">All Records</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
           </select>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid gap-4">
         {loading ? (
            [1,2,3,4].map(i => <div key={i} className="h-24 w-full bg-white rounded-3xl animate-pulse dark:bg-slate-900" />)
         ) : filteredRequests.map((req) => {
            const Status = statusIcons[req.status];
            return (
               <div 
                  key={req._id}
                  className="group relative overflow-hidden rounded-3xl bg-white p-6 border border-slate-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 dark:bg-slate-900 dark:border-slate-800"
               >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                     <div className="flex items-center gap-5 flex-1">
                        <div className="h-14 w-14 overflow-hidden rounded-[1.5rem] bg-slate-100 flex items-center justify-center text-slate-400 dark:bg-slate-800 border border-slate-50 dark:border-white/5">
                           {req.user?.profilePicture ? (
                             <img src={req.user.profilePicture.startsWith('http') ? req.user.profilePicture : `${API_URL}${req.user.profilePicture}`} alt="" className="h-full w-full object-cover" />
                           ) : (
                             <span className="text-lg font-black uppercase text-slate-300 dark:text-slate-600">{req.user?.name?.charAt(0) || '?'}</span>
                           )}
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center gap-3">
                              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase truncate max-w-[150px]">{req.user?.name || 'Unknown Author'}</h3>
                              <span className="rounded-lg bg-slate-50 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-slate-400 dark:bg-slate-800">
                                 {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                              </span>
                           </div>
                           <div className="mt-2 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                              <span className="flex items-center gap-1.5"><Building2 size={12} /> {req.bankDetails?.bankName}</span>
                              <span className="flex items-center gap-1.5"><Wallet size={12} className="text-brand-600" /> {req.amount} Credits</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex-1 md:flex-none">
                           <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                           <span className={`inline-block text-[10px] font-black uppercase tracking-widest ${Status?.color?.split(' ')[0]}`}>
                              {req.status}
                           </span>
                        </div>
                        
                        <button 
                          onClick={() => setConfirmDelete({ show: true, id: req._id })}
                          className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all dark:bg-rose-500/10"
                          title="Delete Record"
                        >
                           <Trash2 size={20} />
                        </button>
                        
                        <button 
                          onClick={() => setSelectedReq(req)}
                          className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white transition-all dark:bg-slate-800"
                        >
                           <ChevronRight size={20} />
                        </button>
                     </div>
                  </div>
               </div>
            );
         })}

         {filteredRequests.length === 0 && !loading && (
            <div className="py-20 text-center rounded-[3rem] border border-dashed border-slate-100 dark:border-slate-800">
               <Wallet size={48} className="mx-auto text-slate-100 dark:text-slate-800 mb-4" />
               <p className="text-xs font-black uppercase tracking-tight text-slate-400">No payout records found matching your criteria.</p>
            </div>
         )}
      </div>

      {/* Process Modal */}
      <AnimatePresence>
        {selectedReq && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
               onClick={() => setSelectedReq(null)}
             />
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
               className="relative w-full max-w-2xl rounded-[2.5rem] bg-white p-8 md:p-10 shadow-2xl dark:bg-slate-900"
             >
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Process Payout</h2>
                      <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mt-1">Reviewing request #{selectedReq._id?.slice(-6)}</p>
                   </div>
                   <button onClick={() => setSelectedReq(null)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-800">
                      <X size={20} />
                   </button>
                </div>

                <div className="grid gap-8 md:grid-cols-2 mb-10">
                    <div className="space-y-4">
                       <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Requested Amount (Gross)</p>
                          <p className="text-xl font-black text-slate-900 dark:text-white uppercase">{selectedReq.amount} Credits</p>
                       </div>
                       
                       <div className="flex gap-4">
                          <div className="flex-1 p-5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                             <p className="text-[8px] font-black uppercase tracking-widest text-rose-500 mb-1">Platform Fee (2%)</p>
                             <p className="text-lg font-black text-rose-600">-{selectedReq.feeAmount || (selectedReq.amount * 0.02).toFixed(2)}</p>
                          </div>
                          <div className="flex-1 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                             <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500 mb-1">Net Payout</p>
                             <p className="text-lg font-black text-emerald-600">{selectedReq.netAmount || (selectedReq.amount * 0.98).toFixed(2)}</p>
                          </div>
                       </div>
                    </div>
                      
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 dark:bg-slate-900 dark:border-slate-800">
                               <UserIcon size={18} />
                            </div>
                            <div>
                               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Author Account</p>
                               <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{selectedReq.user?.name || '...'}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 dark:bg-slate-900 dark:border-slate-800">
                               <Building2 size={18} />
                            </div>
                            <div>
                               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Bank Information</p>
                               <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{selectedReq.bankDetails?.bankName}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-3 p-6 rounded-[2rem] bg-slate-900/5 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2 underline decoration-brand-600 decoration-2">Payout Destination Details</p>
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px]"><span className="text-slate-400 uppercase shrink-0">Account Name:</span> <span className="font-bold text-slate-900 dark:text-white uppercase text-right break-words ml-2 whitespace-normal">{selectedReq.bankDetails?.accountName}</span></div>
                         <div className="flex justify-between text-[10px]"><span className="text-slate-400 uppercase shrink-0">Branch:</span> <span className="font-bold text-slate-900 dark:text-white uppercase text-right break-words ml-2 whitespace-normal">{selectedReq.bankDetails?.branchName}</span></div>
                         <div className="flex justify-between text-[10px]"><span className="text-slate-400 uppercase shrink-0">Account #:</span> <span className="font-bold font-mono text-brand-600 text-right break-words ml-2 whitespace-normal">{selectedReq.bankDetails?.accountNumber}</span></div>
                      </div>
                   </div>

                <div className="space-y-6 pt-8 border-t border-slate-100 dark:border-slate-800">
                   {selectedReq.status === 'pending' ? (
                      <div className="grid gap-4 md:grid-cols-2">
                         <div className="space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Approve with Transfer Slip</label>
                            <label className="flex flex-col items-center justify-center h-28 w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all dark:bg-slate-800 dark:border-slate-700">
                               <input type="file" className="hidden" accept="image/*" onChange={(e) => setSlipFile(e.target.files[0])} />
                               {slipFile ? (
                                  <div className="flex items-center gap-2 text-emerald-600">
                                     <CheckCircle2 size={24} />
                                     <span className="text-[10px] font-black uppercase truncate max-w-[150px]">{slipFile.name}</span>
                                  </div>
                               ) : (
                                  <>
                                     <Upload className="text-slate-300" size={32} />
                                     <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Choose Image</span>
                                  </>
                               )}
                            </label>
                            <button 
                              disabled={submitting}
                              onClick={() => handleProcess(selectedReq._id, 'completed')}
                              className="w-full rounded-2xl bg-slate-900 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-600 transition-all shadow-xl dark:bg-brand-600"
                            >
                               Mark as Transfered
                            </button>
                         </div>
                         
                         <div className="space-y-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-8">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Reject Request</label>
                            <textarea 
                              className="w-full h-28 rounded-2xl bg-slate-50 py-4 px-4 text-[11px] font-bold border-none focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:text-white"
                              placeholder="Why is it being rejected?"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                            />
                            <button 
                              disabled={submitting}
                              onClick={() => handleProcess(selectedReq._id, 'rejected')}
                              className="w-full rounded-2xl bg-rose-50 py-4 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-600 hover:text-white transition-all dark:bg-rose-500/10 dark:hover:bg-rose-600"
                            >
                               Reject Payout
                            </button>
                         </div>
                      </div>
                   ) : (
                      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center text-center">
                         {selectedReq.status === 'completed' ? (
                            <>
                               <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 dark:bg-emerald-500/10">
                                  <CheckCircle2 size={32} />
                               </div>
                               <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">Funds Dispatched</h4>
                               <p className="text-[10px] font-medium text-slate-400 mt-2">Author has been notified of the successful transfer.</p>
                               {selectedReq.payoutSlip && (
                                  <a 
                                    href={`${API_URL.replace('/api', '')}${selectedReq.payoutSlip}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="mt-6 flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-100 shadow-sm hover:shadow-md dark:bg-slate-900 dark:text-white dark:border-slate-700"
                                  >
                                     <Eye size={16} /> Attached Confirmation Slip
                                  </a>
                               )}
                            </>
                         ) : (
                            <>
                               <div className="h-16 w-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 dark:bg-rose-500/10">
                                  <X size={32} />
                               </div>
                               <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">Transaction Declined</h4>
                               <p className="text-[10px] font-bold text-rose-500 uppercase mt-4 underline decoration-2">Reason:</p>
                               <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-2 max-w-sm whitespace-pre-wrap">{selectedReq.rejectionReason}</p>
                            </>
                         )}
                      </div>
                   )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete.show && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setConfirmDelete({ show: false, id: null })}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-slate-900"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Delete Record?</h3>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                This action is permanent and cannot be undone. 
                {requests.find(r => r._id === confirmDelete.id)?.status === 'pending' && (
                  <span className="block mt-2 text-rose-500 text-[10px]">Warning: Pending requests will not be refunded automatically.</span>
                )}
              </p>
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setConfirmDelete({ show: false, id: null })}
                  className="flex-1 rounded-xl bg-slate-100 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-200 transition-all dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeletePayout(confirmDelete.id)}
                  className="flex-1 rounded-xl bg-rose-600 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 transition-all"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPayoutsPage;
