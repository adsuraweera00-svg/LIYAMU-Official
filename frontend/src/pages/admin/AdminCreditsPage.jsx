import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, Filter, Search, Plus, Minus, FileText, User as UserIcon, 
  Calendar, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, Ban, 
  ExternalLink, Eye, X, MessageSquare, AlertCircle
} from 'lucide-react';
import api from '../../api/client';

const AdminCreditsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('requests'); // Default to requests for admin attention
  const [filterStatus, setFilterStatus] = useState('pending');
  
  // Adjustment State
  const [adjustment, setAdjustment] = useState({ userId: '', amount: '', type: 'admin_add', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


  const loadData = async () => {
    setLoading(true);
    try {
      const [txRes, reqRes, usersRes] = await Promise.all([
        api.get('/credits/all-transactions'),
        api.get(`/credits/requests?status=${filterStatus}`),
        api.get('/admin/users')
      ]);
      setTransactions(txRes.data);
      setPendingRequests(reqRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [filterStatus]);

  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!adjustment.userId || !adjustment.amount || !adjustment.reason) return alert('Fill all fields');
    
    setSubmitting(true);
    try {
      await api.post('/credits/adjust', adjustment);
      alert('Balance adjusted successfully');
      setAdjustment({ userId: '', amount: '', type: 'admin_add', reason: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Adjustment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessRequest = async (requestId, status) => {
    if (status === 'rejected' && !adminNote) {
      return alert('Please provide a reason for rejection');
    }

    setSubmitting(true);
    try {
      await api.put('/credits/process-request', { requestId, status, adminNote });
      alert(`Request ${status} successfully`);
      setSelectedRequest(null);
      setAdminNote('');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTx = transactions.filter(tx => 
    tx.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    tx.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    tx.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Credit Management</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1 dark:text-slate-400">Manage manual payment slips and platform currency.</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl dark:bg-slate-800">
           {['requests', 'ledger', 'adjust'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 activeTab === tab 
                   ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' 
                   : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
               }`}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      {activeTab === 'requests' && (
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                 <Clock size={24} className="text-amber-500" />
                 Payment Slips
                 <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{pendingRequests.length}</span>
              </h3>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border-none bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              >
                <option value="pending">Pending Only</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
           </div>

           <div className="grid gap-4">
              {loading ? (
                <div className="h-40 flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>
              ) : pendingRequests.map(req => (
                <motion.div 
                  key={req._id}
                  layout
                  className="p-6 rounded-[2.5rem] bg-white border border-slate-50 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6"
                >
                   <div className="flex items-center gap-6 flex-1">
                      <div 
                        onClick={() => setSelectedRequest(req)}
                        className="relative h-20 w-28 rounded-2xl overflow-hidden cursor-pointer group shrink-0"
                      >
                         <img 
                            src={req.slipUrl?.startsWith('http') ? req.slipUrl : `${API_URL}${req.slipUrl}`} 
                            className="h-full w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" 
                            alt="Payment Slip" 
                          />
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 text-white transition-opacity">
                            <Eye size={20} />
                         </div>
                      </div>
                      <div className="min-w-0">
                         <div className="flex items-center gap-2">
                           <p className="text-sm font-black uppercase text-slate-900 dark:text-white truncate">{req.user?.name}</p>
                           <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter ${
                             req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                             req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                           }`}>
                             {req.status}
                           </span>
                         </div>
                         <p className="text-[10px] font-bold text-slate-400 mt-1 truncate">{req.user?.email}</p>
                         <div className="mt-4 flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                            <span className="flex items-center gap-1 text-brand-600"><Coins size={10} /> {req.amount} Credits</span>
                            <span className="flex items-center gap-1 text-slate-900 dark:text-slate-300 font-black">${req.price}</span>
                            <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(req.createdAt).toLocaleString()}</span>
                         </div>
                      </div>
                   </div>

                   {req.status === 'pending' && (
                     <div className="flex items-center gap-3">
                        <button 
                          onClick={() => { setSelectedRequest(req); setAdminNote(''); }}
                          className="px-6 py-4 rounded-2xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-600/20 hover:bg-brand-700"
                        >
                           Process Request
                        </button>
                     </div>
                   )}
                </motion.div>
              ))}
              {pendingRequests.length === 0 && !loading && (
                <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] dark:bg-slate-800/20">
                   <p className="text-xs font-black uppercase tracking-widest text-slate-400">No {filterStatus} requests found</p>
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="space-y-6">
           <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                 <FileText size={24} className="text-brand-600" />
                 Transaction Ledger
                 <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 dark:bg-slate-800">{filteredTx.length}</span>
              </h3>
              <div className="relative w-full sm:w-64">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                   className="w-full rounded-2xl border-none bg-white pl-12 pr-4 py-4 text-xs shadow-sm focus:ring-2 focus:ring-brand-500 dark:bg-slate-900 dark:text-white"
                   placeholder="Search user or desc..."
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                 />
              </div>
           </div>

           <div className="space-y-3">
              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
                </div>
              ) : filteredTx.map(tx => (
                <motion.div 
                  key={tx._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 rounded-[2rem] bg-white border border-slate-50 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between group hover:shadow-xl transition-all"
                >
                   <div className="flex items-center gap-6">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
                        ['purchase', 'admin_add', 'refund'].includes(tx.type)
                         ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                         : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                      }`}>
                         {['purchase', 'admin_add', 'refund'].includes(tx.type) ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                      </div>
                      <div>
                         <div className="flex items-center gap-2">
                           <p className="text-sm font-black uppercase text-slate-900 dark:text-white">{tx.user?.name}</p>
                           <span className="h-1 w-1 rounded-full bg-slate-300" />
                           <p className="text-[10px] font-bold text-slate-400">{tx.user?.email}</p>
                         </div>
                         <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1 italic">"{tx.description}"</p>
                         <div className="mt-3 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-300">
                            <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(tx.createdAt).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><UserIcon size={10} /> Type: {tx.type.replace('_', ' ')}</span>
                         </div>
                      </div>
                   </div>
                   <div className={`text-xl font-black ${
                     ['purchase', 'admin_add', 'refund'].includes(tx.type)
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                   }`}>
                      {['purchase', 'admin_add', 'refund'].includes(tx.type) ? '+' : '-'}{tx.amount?.toFixed(2)}
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'adjust' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Users List */}
           <div className="p-8 rounded-[3rem] bg-white border border-slate-50 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col h-[650px]">
              <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                       <UserIcon size={24} className="text-brand-600" />
                       User Credits
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Select a user to adjust</p>
                 </div>
                 <div className="relative w-full sm:w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      className="w-full rounded-2xl border-none bg-slate-100 pl-10 pr-4 py-3 text-[10px] font-bold shadow-sm focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:text-white"
                      placeholder="Search any user..."
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                    />
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                 {loading ? (
                    <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>
                 ) : users.filter(u => {
                    const searchLower = userSearch.toLowerCase();
                    const matchesSearch = u.name?.toLowerCase().includes(searchLower) || u.email?.toLowerCase().includes(searchLower);
                    if (userSearch) return matchesSearch;
                    return u.creditBalance > 0;
                 }).map(u => (
                    <div 
                      key={u._id}
                      onClick={() => setAdjustment({...adjustment, userId: u._id})}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${adjustment.userId === u._id ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-100 bg-slate-50 hover:border-brand-200 dark:border-slate-800 dark:bg-slate-800/50 hover:shadow-md'}`}
                    >
                       <div className="flex items-center justify-between">
                          <div className="min-w-0 pr-4">
                             <div className="flex items-center gap-2">
                               <p className="text-sm font-black uppercase text-slate-900 dark:text-white truncate">{u.name}</p>
                               {u.role !== 'reader' && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-[8px] font-black uppercase tracking-widest text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{u.role}</span>}
                             </div>
                             <p className="text-[10px] font-bold text-slate-400 mt-0.5 truncate">{u.email}</p>
                          </div>
                          <div className="text-right shrink-0">
                             <p className="text-lg font-black text-brand-600 dark:text-brand-400">{((u.creditBalance || 0) + (u.earningsBalance || 0)).toFixed(2)}</p>
                             <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Credits</p>
                          </div>
                       </div>
                    </div>
                 ))}
                 {users.length > 0 && !loading && users.filter(u => userSearch ? true : u.creditBalance > 0).length === 0 && (
                    <div className="text-center py-10">
                       <p className="text-xs font-black uppercase tracking-widest text-slate-400">{userSearch ? 'No matching users' : 'No users with credits found'}</p>
                    </div>
                 )}
              </div>
           </div>

           {/* Adjustment Form */}
           <div className="h-fit">
              <div className="p-10 rounded-[3rem] bg-slate-900 text-white shadow-2xl">
                 <div className="mb-10 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-[2rem] bg-brand-600 flex items-center justify-center">
                       <Coins size={28} />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Manual Adjustment</h3>
                 </div>

                 <form onSubmit={handleAdjust} className="space-y-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected User</label>
                       {adjustment.userId ? (
                         <div className="w-full rounded-2xl bg-slate-800/80 border border-slate-700 px-6 py-4 flex items-center justify-between">
                            <div>
                               <p className="text-sm font-bold text-white">{users.find(u => u._id === adjustment.userId)?.name}</p>
                               <p className="text-[10px] text-slate-400">{users.find(u => u._id === adjustment.userId)?.email}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-xs font-black text-brand-400">{users.find(u => u._id === adjustment.userId)?.creditBalance || 0} C</p>
                            </div>
                         </div>
                       ) : (
                         <div className="w-full rounded-2xl border border-dashed border-slate-700 p-6 flex flex-col items-center justify-center text-center gap-2 bg-slate-800/30">
                            <UserIcon size={24} className="text-slate-500" />
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select a user from the list</p>
                         </div>
                       )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Credit Amount</label>
                          <input 
                            type="number"
                            className="w-full rounded-2xl bg-slate-800 border-none px-6 py-5 text-sm font-bold text-white focus:ring-2 focus:ring-brand-600"
                            placeholder="100"
                            value={adjustment.amount}
                            onChange={e => setAdjustment({...adjustment, amount: Number(e.target.value)})}
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Adjustment Type</label>
                          <select 
                            className="w-full rounded-2xl bg-slate-800 border-none px-6 py-5 text-sm font-bold text-white focus:ring-2 focus:ring-brand-600"
                            value={adjustment.type}
                            onChange={e => setAdjustment({...adjustment, type: e.target.value})}
                          >
                             <option value="admin_add">Add Credits (+)</option>
                             <option value="admin_remove">Remove Credits (-)</option>
                          </select>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Official Reason</label>
                       <textarea 
                         className="w-full rounded-2xl bg-slate-800 border-none px-6 py-5 text-sm font-bold text-white placeholder:text-slate-600 focus:ring-2 focus:ring-brand-600 min-h-[120px]"
                         placeholder="Describe why you are making this adjustment..."
                         value={adjustment.reason}
                         onChange={e => setAdjustment({...adjustment, reason: e.target.value})}
                       />
                    </div>

                    <button 
                     disabled={submitting || !adjustment.userId}
                     className="w-full py-6 rounded-2xl bg-brand-600 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-600/20 hover:bg-brand-500 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                       {submitting ? 'Authenticating...' : 'Apply Official Adjustment'}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* Verification Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => !submitting && setSelectedRequest(null)}
               className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
             />

             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-5xl bg-white rounded-[3rem] overflow-hidden shadow-2xl dark:bg-slate-900 border border-white/10"
             >
                <div className="flex flex-col lg:flex-row h-full max-h-[90vh] overflow-y-auto">
                   {/* Slip View */}
                   <div className="flex-1 bg-slate-100 dark:bg-black/40 flex items-center justify-center p-6 lg:p-12">
                      <div className="relative group w-full h-full max-h-[60vh] flex items-center justify-center">
                         <img 
                           src={selectedRequest.slipUrl?.startsWith('http') ? selectedRequest.slipUrl : `${API_URL}${selectedRequest.slipUrl}`} 
                           className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" 
                           alt="Payment Slip Full" 
                         />
                         <a 
                           href={selectedRequest.slipUrl?.startsWith('http') ? selectedRequest.slipUrl : `${API_URL}${selectedRequest.slipUrl}`} 
                           target="_blank" 
                           rel="noreferrer"
                           className="absolute top-4 right-4 h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/40 transition-all"
                         >
                            <ExternalLink size={20} />
                         </a>
                      </div>
                   </div>

                   {/* Actions Side */}
                   <div className="w-full lg:w-[400px] border-l border-slate-100 p-10 space-y-8 dark:border-slate-800">
                      <button 
                        onClick={() => setSelectedRequest(null)}
                        className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 dark:hover:text-white lg:static"
                      >
                         <X size={24} />
                      </button>

                      <div>
                         <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Verify Payment</h2>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review slip details and approve coins.</p>
                      </div>

                      <div className="space-y-6">
                         <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center dark:bg-slate-800">
                               <UserIcon className="text-slate-400" size={20} />
                            </div>
                            <div>
                               <p className="text-xs font-black uppercase text-slate-900 dark:text-white">{selectedRequest.user?.name}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedRequest.user?.email}</p>
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-500/10">
                               <p className="text-[8px] font-black uppercase tracking-widest text-brand-600">Credits Requested</p>
                               <p className="text-xl font-black text-brand-700 dark:text-brand-400">{selectedRequest.amount?.toFixed(2)}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Payment Amount</p>
                               <p className="text-xl font-black text-slate-900 dark:text-white">${selectedRequest.price}</p>
                            </div>
                         </div>

                         {selectedRequest.status === 'pending' ? (
                           <>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                  <MessageSquare size={12} />
                                  Admin Feedback / Notes
                                </label>
                                <textarea 
                                  value={adminNote}
                                  onChange={(e) => setAdminNote(e.target.value)}
                                  className="w-full rounded-2xl border-none bg-slate-50 px-5 py-4 text-xs font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:text-white"
                                  placeholder="e.g. Payment verified. Coins added."
                                  rows={4}
                                />
                             </div>

                             <div className="flex flex-col gap-3 pt-4">
                                <button
                                  disabled={submitting}
                                  onClick={() => handleProcessRequest(selectedRequest._id, 'approved')}
                                  className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
                                >
                                   <CheckCircle size={18} />
                                   Approve & Add Coins
                                </button>
                                <button
                                  disabled={submitting}
                                  onClick={() => handleProcessRequest(selectedRequest._id, 'rejected')}
                                  className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 disabled:opacity-50"
                                >
                                   <Ban size={18} />
                                   Reject Request
                                </button>
                             </div>
                           </>
                         ) : (
                           <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-start gap-4">
                              <AlertCircle className="text-brand-600 shrink-0" size={20} />
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Internal Admin Note</p>
                                 <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-2 italic leading-relaxed">
                                    "{selectedRequest.adminNote || 'No notes provided for this transaction.'}"
                                 </p>
                              </div>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCreditsPage;
