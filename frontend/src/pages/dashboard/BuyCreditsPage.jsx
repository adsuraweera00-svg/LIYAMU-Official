import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, Zap, ShieldCheck, CreditCard, ArrowRight, CheckCircle2, History, 
  Upload, X, AlertCircle, Clock, CheckCircle, Ban, MessageSquare, Info
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { getExchangeRate, formatLKR } from '../../utils/currency';

const BuyCreditsPage = () => {
  const { auth, setAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(300);
  
  // Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [slipFile, setSlipFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const packages = [
    { id: 'small', credits: 100, price: 1, label: 'Starter Pack', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'medium', credits: 500, price: 5, label: 'Value Pack', icon: Coins, color: 'text-brand-600', bg: 'bg-brand-50', popular: true },
    { id: 'large', credits: 2500, price: 25, label: 'Power Pack', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'mega', credits: 5000, price: 50, label: 'Elite Pack', icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-50' }
  ];

  useEffect(() => {
    fetchData();
    getExchangeRate().then(setExchangeRate);
  }, []);

  const fetchData = async () => {
    try {
      const [txRes, reqRes] = await Promise.all([
        api.get('/credits/my-transactions'),
        api.get('/credits/my-requests')
      ]);
      setTransactionHistory(txRes.data);
      setPendingRequests(reqRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSlipFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setSubmissionSuccess(false);
    }
  };

  const handleSubmitSlip = async (e) => {
    e.preventDefault();
    if (!slipFile || !selectedPkg) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('slip', slipFile);
    formData.append('amount', selectedPkg.credits);
    formData.append('price', selectedPkg.price);
    formData.append('packageId', selectedPkg.id);

    try {
      await api.post('/credits/request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSubmissionSuccess(true);
      setSlipFile(null);
      setPreviewUrl(null);
      fetchData();
      // Auto-close after 3 seconds
      setTimeout(() => {
        setShowUploadModal(false);
        setSubmissionSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="text-emerald-500" size={16} />;
      case 'rejected': return <Ban className="text-rose-500" size={16} />;
      default: return <Clock className="text-amber-500" size={16} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 mt-10">
       <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-4">
          <div className="text-left space-y-4 max-w-xl">
            <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Refill Your Wallet</h1>
            <p className="text-slate-500 font-medium text-sm uppercase tracking-widest dark:text-slate-400">
               $1 = 100 Credits. Spend them on exclusive books and services across Liyamu.
            </p>
          </div>
          
          <div className="shrink-0 rounded-[2rem] bg-brand-600 px-10 py-6 text-white shadow-2xl shadow-brand-600/20 flex items-center gap-6">
             <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Coins size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Current Wallet</p>
                <p className="text-3xl font-black">
                  {((auth?.creditBalance || 0) + (auth?.earningsBalance || 0)).toFixed(2)}
                  <span className="text-xs ml-2 opacity-60 uppercase">Credits</span>
                </p>
             </div>
          </div>
       </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => (
          <motion.div 
            key={pkg.id}
            whileHover={{ y: -10 }}
            className={`relative flex flex-col p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl transition-all dark:bg-slate-900 dark:border-slate-800 ${pkg.popular ? 'ring-4 ring-brand-600/10' : ''}`}
          >
            {pkg.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                Most Popular
              </div>
            )}
            
            <div className={`h-14 w-14 rounded-2xl ${pkg.bg} flex items-center justify-center ${pkg.color} mb-6 dark:bg-opacity-10`}>
              <pkg.icon size={28} />
            </div>
            
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{pkg.label}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-100 dark:text-white">{pkg.credits}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Credits</span>
            </div>
            
            <div className="mt-8 flex flex-col">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">${pkg.price}</p>
              <p className="text-sm font-black text-brand-600 uppercase tracking-widest">
                 ≈ {formatLKR(pkg.price, exchangeRate)}
              </p>
            </div>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-8 mt-1">One-time payment</p>
            
            <button 
              onClick={() => {
                setSelectedPkg(pkg);
                setShowUploadModal(true);
              }}
              className={`w-full mt-auto py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                pkg.popular 
                  ? 'bg-brand-600 text-white shadow-xl shadow-brand-600/20 hover:bg-brand-700' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700'
              }`}
            >
              Purchase Now
            </button>
          </motion.div>
        ))}
      </div>

      {/* Manual Verification Info */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-10 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-6">
           <div className="h-16 w-16 rounded-[2rem] bg-brand-50 flex items-center justify-center text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <CheckCircle2 size={32} />
           </div>
           <div>
              <h4 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Manual Verification</h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Coins are added manually after verifying your payment slip. Process takes up to 24 hours.</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-3 px-8 py-5 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <History size={16} /> Activity & History
          </button>
        </div>
      </div>

      {/* Pending Requests & History */}
      {showHistory && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Pending Requests Section */}
          {pendingRequests.length > 0 && (
            <div className="rounded-[2.5rem] bg-amber-50/30 p-10 border border-amber-100 dark:bg-amber-500/5 dark:border-amber-900/30">
               <div className="flex items-center gap-3 mb-8">
                  <Clock size={20} className="text-amber-600" />
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Pending Requests</h3>
               </div>
               <div className="space-y-4">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="flex flex-col md:flex-row gap-4 md:items-center justify-between p-6 rounded-2xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                       <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 dark:bg-slate-800">
                             <img src={req.slipUrl} alt="" className="h-10 w-10 object-cover rounded-lg opacity-40 hover:opacity-100 transition-opacity cursor-zoom-in" />
                          </div>
                          <div>
                             <p className="text-xs font-black uppercase text-slate-900 dark:text-white">Purchase Instance: {req.amount} Credits</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${req.price} • {new Date(req.createdAt).toLocaleDateString()}</p>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-3">
                          <span className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] ${
                            req.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                            req.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                            'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                          }`}>
                             {getStatusIcon(req.status)}
                             {req.status}
                          </span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* Transaction History Section */}
          <div className="rounded-[2.5rem] bg-white p-10 border border-slate-100 shadow-xl dark:bg-slate-900 dark:border-slate-800">
             <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-8">Completed Transactions</h3>
             <div className="space-y-4">
                {transactionHistory.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-100 transition-all dark:bg-slate-800/50 dark:hover:border-slate-700">
                     <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                          tx.type === 'purchase' || tx.type === 'admin_add' || tx.type === 'refund' 
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                        }`}>
                           {tx.type === 'purchase' || tx.type === 'admin_add' || tx.type === 'refund' ? '+' : '-'}
                        </div>
                        <div>
                           <p className="text-xs font-black uppercase text-slate-900 dark:text-white">{tx.description}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <div className={`text-sm font-black ${
                       tx.type === 'purchase' || tx.type === 'admin_add' || tx.type === 'refund' 
                         ? 'text-emerald-600 dark:text-emerald-400' 
                         : 'text-rose-600 dark:text-rose-400'
                     }`}>
                        {tx.type === 'purchase' || tx.type === 'admin_add' || tx.type === 'refund' ? '+' : '-'}{tx.amount?.toFixed(2) || '0.00'}
                     </div>
                  </div>
                ))}
                {transactionHistory.length === 0 && (
                  <p className="text-center py-10 text-xs font-bold text-slate-400 uppercase italic">No transactions found.</p>
                )}
             </div>
          </div>
        </motion.div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setShowUploadModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[3rem] p-10 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800"
            >
              <button 
                onClick={() => setShowUploadModal(false)}
                className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-[2rem] bg-brand-50 flex items-center justify-center text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <Upload size={30} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Upload Payment Slip</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedPkg?.credits} Credits Pack • ${selectedPkg?.price}</p>
                  </div>
                </div>

                {/* Bank Instructions */}
                <div className="rounded-3xl bg-slate-50 p-6 space-y-3 dark:bg-slate-800/50">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-600">Payment Instructions</h4>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bank Name</p>
                      <p className="text-xs font-black text-slate-900 dark:text-white">Commercial Bank</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Name</p>
                      <p className="text-xs font-black text-slate-900 dark:text-white">A.D. Suraweera</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Branch</p>
                      <p className="text-xs font-black text-slate-900 dark:text-white">Kekirawa</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account No</p>
                      <p className="text-xs font-black text-slate-900 dark:text-white">8021659610</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-4 bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-brand-500/10">
                    <div className="flex items-center justify-between">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount to Pay (LKR)</p>
                       <p className="text-lg font-black text-brand-600">{formatLKR(selectedPkg?.price || 0, exchangeRate)}</p>
                    </div>
                    <div className="flex items-center gap-3 text-rose-500">
                      <AlertCircle size={14} />
                      <p className="text-[10px] font-black uppercase tracking-widest leading-none">Reference: {auth?.email}</p>
                    </div>
                  </div>
                </div>

                {!submissionSuccess ? (
                  <form onSubmit={handleSubmitSlip} className="space-y-6">
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        required
                      />
                      <div className={`h-40 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center ${
                        previewUrl 
                          ? 'border-brand-600 bg-brand-50/5 dark:bg-brand-500/5' 
                          : 'border-slate-200 group-hover:border-brand-300 group-hover:bg-slate-50 dark:border-slate-700'
                      }`}>
                        {previewUrl ? (
                          <img src={previewUrl} className="h-32 w-48 object-cover rounded-2xl shadow-xl" alt="Preview" />
                        ) : (
                          <>
                            <Upload className="text-slate-300 group-hover:text-brand-400 mb-2" size={32} />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Upload Payment Slip</p>
                            <p className="text-[8px] text-slate-400 uppercase tracking-widest">Supports JPEG, PNG up to 10MB</p>
                          </>
                        )}
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading || !slipFile}
                      className="w-full py-6 rounded-2xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Submitting...' : 'Submit for Verification'}
                    </button>
                  </form>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center justify-center py-10"
                  >
                    <div className="h-20 w-20 rounded-[2.5rem] bg-emerald-500 text-white flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30">
                       <CheckCircle size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white text-center">Submission Received!</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mt-3 leading-relaxed">
                      Your coins will be added to your account <br /> within 24 hours.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuyCreditsPage;
