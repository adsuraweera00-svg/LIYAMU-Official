import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, UserCircle, Phone, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const VerificationPage = () => {
  const { auth, setAuth } = useAuth();
  const [form, setForm] = useState({ 
    name: auth?.name || '', 
    idNumber: '', 
    contactNumber: '', 
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Document size must be less than 10MB');
        return;
      }
      setError('');
      setDocumentFile(file);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!documentFile) return setError('Identity document is required');
    
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      formData.append('document', documentFile);

      await api.post('/verifications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSent(true);
      setAuth((prev) => ({ ...prev, verificationPending: true }));
    } catch (err) {
      setError(err.response?.data?.message || 'Verification submission failed');
    } finally {
      setLoading(false);
    }
  };

  const isVerified = auth?.badges?.verifiedAuthor;
  const isPending = sent || auth?.verificationPending;

  return (
    <div className="mx-auto max-w-2xl space-y-6 md:space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-600/20">
          <ShieldCheck size={24} className="md:h-7 md:w-7" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Author Verification</h2>
          <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Upgrade your account to access premium publishing tools</p>
        </div>
      </div>

      <AnimatePresence>
        {isVerified ? (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="rounded-3xl md:rounded-[2.5rem] glass-theme p-8 md:p-12 text-center shadow-xl shadow-emerald-500/5"
           >
              <div className="mx-auto h-20 w-20 md:h-24 md:w-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6 md:mb-8 dark:bg-emerald-500/20">
                 <CheckCircle2 size={40} className="md:h-12 md:w-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-emerald-900 dark:text-emerald-50">Identity Verified</h3>
              <p className="mt-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70 max-w-xs mx-auto">Your author account is fully verified. You can now publish and monetize your work.</p>
           </motion.div>
        ) : isPending ? (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="rounded-3xl md:rounded-[2.5rem] glass-theme p-8 md:p-12 text-center shadow-xl shadow-amber-500/5"
           >
              <div className="mx-auto h-20 w-20 md:h-24 md:w-24 rounded-full bg-amber-100 flex items-center justify-center mb-6 md:mb-8 dark:bg-amber-500/20">
                 <Clock size={40} className="md:h-12 md:w-12 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-amber-900 dark:text-amber-50">Review in Progress</h3>
              <p className="mt-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-amber-600/70 dark:text-amber-400/70 max-w-sm mx-auto leading-relaxed">Your verification request has been received. Our team is reviewing your documents. This process may take up to 4 days.</p>
           </motion.div>
        ) : (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="rounded-3xl md:rounded-[2.5rem] glass-theme p-6 md:p-10 border border-slate-100/10 shadow-xl"
           >
             <div className="mb-8 rounded-2xl bg-emerald-50/10 p-6 border border-emerald-100/20">
                <div className="flex items-start gap-4">
                   <AlertCircle className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-1" size={20} />
                   <div>
                      <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-900 dark:text-emerald-50">Why verify?</h4>
                      <p className="mt-2 text-xs md:text-sm font-medium text-emerald-700 dark:text-emerald-300 leading-relaxed">
                        Verification ensures trust and quality within the Liyamu network. Verified authors receive special badges, better visibility, and direct monetization tools.
                      </p>
                   </div>
                </div>
             </div>

             <form onSubmit={submit} className="space-y-6 md:space-y-8">
               <div className="space-y-6">
                 <div className="grid md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Full Name</label>
                      <div className="relative group">
                        <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                        <input 
                          type="text" 
                          placeholder="As on your ID"
                          className="w-full rounded-2xl bg-slate-50/50 border-none py-4 pl-12 pr-4 text-xs md:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 transition-all dark:bg-slate-800/80 dark:text-white"
                          value={form.name} 
                          onChange={(e) => setForm({ ...form, name: e.target.value })} 
                          required 
                        />
                      </div>
                    </div>

                    {/* ID Number */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">ID Number / NIC</label>
                      <div className="relative group">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                        <input 
                          type="text" 
                          placeholder="Verification ID"
                          className="w-full rounded-2xl bg-slate-50/50 border-none py-4 pl-12 pr-4 text-xs md:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 transition-all dark:bg-slate-800/80 dark:text-white"
                          value={form.idNumber} 
                          onChange={(e) => setForm({ ...form, idNumber: e.target.value })} 
                          required 
                        />
                      </div>
                    </div>
                 </div>

                 {/* Contact Number */}
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Contact Number</label>
                   <div className="relative group">
                     <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                     <input 
                       type="tel" 
                       placeholder="+1 (555) 000-0000"
                       className="w-full rounded-2xl bg-slate-50/50 border-none py-4 pl-12 pr-4 text-xs md:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 transition-all dark:bg-slate-800/80 dark:text-white"
                       value={form.contactNumber} 
                       onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} 
                       required 
                     />
                   </div>
                 </div>

                 {/* Verification Document Upload */}
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Identity Document (PDF/JPG/PNG)</label>
                   <div className="relative group">
                     <label className="flex flex-col items-center justify-center w-full px-4 py-8 rounded-2xl bg-slate-50/50 border-2 border-dashed border-slate-200/50 hover:border-emerald-600/50 cursor-pointer transition-all dark:bg-slate-800/80 dark:border-slate-700/50">
                       <FileText className={`mb-3 ${documentFile ? 'text-emerald-500' : 'text-slate-400'} group-hover:text-emerald-600 transition-colors`} size={32} />
                       <span className="text-xs font-bold text-slate-900 dark:text-white">
                         {documentFile ? documentFile.name : 'Upload your ID scan or PDF'}
                       </span>
                       <span className="mt-1 text-[10px] font-medium text-slate-400">
                         {documentFile ? `${(documentFile.size / 1024 / 1024).toFixed(2)} MB` : 'Documents must be under 10MB'}
                       </span>
                       <input type="file" className="hidden" accept="image/jpeg,image/png,application/pdf" onChange={handleFileChange} />
                     </label>
                   </div>
                 </div>

                 {error && (
                   <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20">
                     <AlertCircle size={16} />
                     {error}
                   </div>
                 )}
               </div>

               <div className="pt-4 md:pt-6 border-t border-slate-100/10">
                  <button 
                    disabled={loading}
                    className="w-full rounded-2xl bg-emerald-600 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                  >
                    {loading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <ShieldCheck size={16} className="group-hover:-rotate-12 transition-transform" />
                    )}
                    {loading ? 'Submitting Request...' : 'Submit Request securely'}
                  </button>
               </div>
             </form>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerificationPage;
