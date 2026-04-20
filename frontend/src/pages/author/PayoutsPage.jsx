import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, 
  ArrowUpRight, 
  History, 
  Building2, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Download,
  Eye
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const PayoutsPage = () => {
  const { auth, setAuth } = useAuth();
  const totalUnifiedBalance = (auth?.creditBalance || 0) + (auth?.earningsBalance || 0);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSlip, setShowSlip] = useState(null);
  
  const [form, setForm] = useState({
    amount: '',
    bankDetails: {
      accountName: '',
      bankName: '',
      branchName: '',
      accountNumber: ''
    }
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const loadData = async () => {
    try {
      const { data } = await api.get('/withdrawals/mine');
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleRequest = async (e) => {
    e.preventDefault();
    if (form.amount < 200) return toast.error('Minimum withdrawal is 200 credits.');
    if (form.amount > totalUnifiedBalance) return toast.error('Insufficient total balance.');

    const loadingToast = toast.loading('Processing withdrawal request...');
    setSubmitting(true);
    try {
      const { data } = await api.post('/withdrawals/request', form);
      setRequests([data, ...requests]);
      
      // Deduct from local auth state using same logic as backend
      let newEarnings = auth.earningsBalance;
      let newCredits = auth.creditBalance;
      let toDeduct = Number(form.amount);

      if (newEarnings >= toDeduct) {
        newEarnings -= toDeduct;
      } else {
        toDeduct -= newEarnings;
        newEarnings = 0;
        newCredits -= toDeduct;
      }

      setAuth({ ...auth, earningsBalance: newEarnings, creditBalance: newCredits });
      
      setForm({
        amount: '',
        bankDetails: {
          accountName: '',
          bankName: '',
          branchName: '',
          accountNumber: ''
        }
      });
      toast.success('Withdrawal request submitted successfully!', { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed', { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const statusMap = {
    pending: { label: 'Pending Admin Review', icon: Clock, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
    completed: { label: 'Transfer Completed', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
    rejected: { label: 'Request Rejected', icon: AlertCircle, color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Author Payouts</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Convert your digital earnings into real bank transfers</p>
        </div>
        <div className="rounded-[2rem] bg-slate-900 px-8 py-5 text-white shadow-2xl dark:bg-brand-600">
           <div className="flex items-center gap-3">
              <Coins size={20} className="text-brand-400 dark:text-white/60" />
              <div>
                 <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Total Platform Wallet</p>
                 <p className="text-xl font-black">{totalUnifiedBalance.toFixed(2)} Credits</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Request Form */}
        <div className="lg:col-span-2">
           <div className="rounded-[2.5rem] bg-white p-8 border border-slate-100 shadow-xl shadow-slate-200/20 dark:bg-slate-900 dark:border-slate-800">
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 flex items-center gap-3 mb-8 dark:text-white">
                 <ArrowUpRight size={24} className="text-brand-600" /> New Payout Request
              </h2>
              
              <form onSubmit={handleRequest} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Amount to Withdraw</label>
                    <div className="relative">
                       <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                       <input 
                         type="number" 
                         required
                         className="w-full rounded-2xl bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold border-none focus:ring-2 focus:ring-brand-600 dark:bg-slate-800 dark:text-white"
                         placeholder="Min 200 credits"
                         value={form.amount}
                         onChange={(e) => setForm({ ...form, amount: e.target.value })}
                       />
                    </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                       <span className="uppercase tracking-widest leading-none">Withdrawal Amount</span>
                       <span className="text-slate-900 dark:text-white leading-none">{form.amount || '0.00'} C</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-rose-500">
                       <span className="uppercase tracking-widest leading-none">2% Platform Fee</span>
                       <span className="leading-none">-{form.amount ? (Number(form.amount) * 0.02).toFixed(2) : '0.00'} C</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 dark:bg-brand-600 text-white shadow-lg">
                       <span className="text-[10px] font-black uppercase tracking-widest leading-none">You Receive (Net)</span>
                       <span className="text-lg font-black leading-none">
                         {form.amount ? (Number(form.amount) * 0.98).toFixed(2) : '0.00'} 
                         <span className="text-[10px] ml-1 opacity-60">C</span>
                       </span>
                    </div>
                 </div>

                 <div className="space-y-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Bank Account Details</p>
                    
                    <div className="space-y-4">
                       <input 
                         className="w-full rounded-xl bg-slate-50 py-3 px-4 text-[11px] font-bold border-none dark:bg-slate-800 dark:text-white" 
                         placeholder="Account Holder Name"
                         required
                         value={form.bankDetails.accountName}
                         onChange={(e) => setForm({ ...form, bankDetails: { ...form.bankDetails, accountName: e.target.value } })}
                       />
                       <input 
                         className="w-full rounded-xl bg-slate-50 py-3 px-4 text-[11px] font-bold border-none dark:bg-slate-800 dark:text-white" 
                         placeholder="Bank Name"
                         required
                         value={form.bankDetails.bankName}
                         onChange={(e) => setForm({ ...form, bankDetails: { ...form.bankDetails, bankName: e.target.value } })}
                       />
                       <input 
                         className="w-full rounded-xl bg-slate-50 py-3 px-4 text-[11px] font-bold border-none dark:bg-slate-800 dark:text-white" 
                         placeholder="Branch Name"
                         required
                         value={form.bankDetails.branchName}
                         onChange={(e) => setForm({ ...form, bankDetails: { ...form.bankDetails, branchName: e.target.value } })}
                       />
                       <input 
                         className="w-full rounded-xl bg-slate-50 py-3 px-4 text-[11px] font-bold border-none dark:bg-slate-800 dark:text-white" 
                         placeholder="Account Number"
                         required
                         value={form.bankDetails.accountNumber}
                         onChange={(e) => setForm({ ...form, bankDetails: { ...form.bankDetails, accountNumber: e.target.value } })}
                       />
                    </div>
                 </div>

                 <div className="flex items-center gap-3 p-4 rounded-2xl bg-brand-50 border border-brand-100 dark:bg-brand-500/10 dark:border-brand-500/20">
                    <ShieldCheck size={18} className="text-brand-600" />
                    <p className="text-[9px] font-medium text-brand-700 leading-relaxed dark:text-brand-400">
                      Our system verifies all bank transfers. Please ensure your details match your bank statement exactly.
                    </p>
                 </div>

                 <button 
                   disabled={submitting}
                   className="w-full rounded-2xl bg-slate-900 py-5 text-xs font-black uppercase tracking-widest text-white hover:bg-brand-500 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50 dark:bg-brand-600"
                 >
                   {submitting ? 'Authenticating Request...' : 'Authorize Payout Request'}
                 </button>
              </form>
           </div>
        </div>

        {/* Request History */}
        <div className="lg:col-span-3">
           <div className="rounded-[2.5rem] bg-white p-8 border border-slate-100 shadow-xl shadow-slate-200/20 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 flex items-center gap-3 dark:text-white">
                    <History size={24} className="text-brand-600" /> Request History
                 </h2>
                 <span className="rounded-xl bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {requests.length} Requests
                 </span>
              </div>

              <div className="space-y-4">
                 {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-24 w-full bg-slate-50 rounded-2xl animate-pulse dark:bg-slate-800" />)
                 ) : requests.map((req) => {
                    const status = statusMap[req.status];
                    return (
                       <div key={req.id} className="group rounded-3xl bg-slate-50 p-6 border border-transparent hover:border-slate-100 transition-all dark:bg-slate-800/50 dark:hover:border-slate-700">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                             <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${status.color}`}>
                                   <status.icon size={24} />
                                </div>
                                <div>
                                   <div className="flex items-center gap-2">
                                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{req.amount} Credits</h4>
                                      <span className="text-[10px] text-slate-400 font-medium">• {new Date(req.createdAt).toLocaleDateString()}</span>
                                   </div>
                                   <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${status.color.split(' ')[0]}`}>
                                      {status.label}
                                   </p>
                                </div>
                             </div>

                             <div className="flex items-center gap-2 self-end sm:self-center">
                                {req.status === 'completed' && req.payoutSlip && (
                                   <button 
                                     onClick={() => setShowSlip(req.payoutSlip)}
                                     className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100 hover:bg-emerald-50 transition-all dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                   >
                                      <Eye size={14} /> View Slip
                                   </button>
                                )}
                                {req.status === 'rejected' && req.rejectionReason && (
                                   <div className="group relative">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-500/10 cursor-help">
                                         <AlertCircle size={18} />
                                      </div>
                                      <div className="absolute bottom-full right-0 mb-2 w-48 scale-0 group-hover:scale-100 transition-all origin-bottom-right">
                                         <div className="bg-slate-900 text-white text-[10px] font-medium p-3 rounded-2xl shadow-2xl">
                                            {req.rejectionReason}
                                         </div>
                                      </div>
                                   </div>
                                )}
                             </div>
                          </div>
                       </div>
                    );
                 })}

                 {requests.length === 0 && !loading && (
                    <div className="py-20 text-center">
                       <Building2 size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                       <p className="text-xs font-medium text-slate-400 italic">No payout requests found.</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Slip Modal */}
      <AnimatePresence>
        {showSlip && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowSlip(null)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="relative max-w-2xl w-full rounded-[2.5rem] bg-white p-4 shadow-2xl dark:bg-slate-900 overflow-hidden"
            >
               <div className="flex items-center justify-between p-4 mb-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Payment Confirmation Slip</h3>
                  <button onClick={() => setShowSlip(null)} className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:bg-slate-800">
                    <Download size={18} />
                  </button>
               </div>
               <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <img src={`${API_URL.replace('/api', '')}${showSlip}`} className="h-full w-full object-contain" alt="Payout Slip" />
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PayoutsPage;
