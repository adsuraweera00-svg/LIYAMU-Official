import { useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, Upload, FileText, Image, Coins, BookOpen, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

const PublishPage = () => {
  const { auth } = useAuth();
  const [form, setForm] = useState({ title: '', category: '', documentType: 'text', content: '', price: 0 });
  const [coverFile, setCoverFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitState, setSubmitState] = useState({ show: false, success: false, msg: '' });

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setSubmitState({ show: true, success: false, msg: 'Cover image must be less than 10MB' });
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 200 * 1024 * 1024) {
        setSubmitState({ show: true, success: false, msg: 'PDF file must be less than 200MB' });
        return;
      }
      setPdfFile(file);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!coverFile) return setSubmitState({ show: true, success: false, msg: 'Cover image is required' });
    if (form.documentType === 'pdf' && !pdfFile) return setSubmitState({ show: true, success: false, msg: 'PDF file is required' });

    setLoading(true);
    setSubmitState({ show: false, success: false, msg: '' });
    
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      formData.append('cover', coverFile);
      if (pdfFile) formData.append('pdf', pdfFile);

      await api.post('/books', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSubmitState({ show: true, success: true, msg: 'Book submitted for admin review successfully!' });
      setForm({ title: '', category: '', documentType: 'text', content: '', price: 0 });
      setCoverFile(null);
      setPdfFile(null);
      setCoverPreview('');
    } catch (err) {
       setSubmitState({ show: true, success: false, msg: err.response?.data?.message || 'Failed to submit publication.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 md:space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-xl shadow-brand-600/20">
          <PenTool size={24} className="md:h-7 md:w-7" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Publish Work</h2>
          <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Submit your manuscript or digital content for publication</p>
        </div>
      </div>

      <AnimatePresence>
        {submitState.show && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-start gap-3 rounded-2xl p-4 border ${submitState.success ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20'}`}
          >
            {submitState.success ? <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} /> : <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={16} />}
            <p className={`text-xs md:text-sm font-bold ${submitState.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{submitState.msg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-3xl md:rounded-[2.5rem] bg-white p-6 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/20 dark:bg-slate-900 dark:border-slate-800">
        <form onSubmit={submit} className="space-y-6 md:space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Title & Category */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Publication Title</label>
              <div className="relative group">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. The Winds of Winter"
                  className="w-full rounded-2xl bg-slate-50 border-none py-4 pl-12 pr-4 text-xs md:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-600"
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Genre/Category</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. Science Fiction"
                  className="w-full rounded-2xl bg-slate-50 border-none py-4 pl-12 pr-4 text-xs md:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-600"
                  value={form.category} 
                  onChange={(e) => setForm({ ...form, category: e.target.value })} 
                  required 
                />
              </div>
            </div>

            {/* Cover & Price */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cover Image (10MB max)</label>
              <div className="relative group">
                <label className="flex flex-col items-center justify-center w-full min-h-[140px] rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-brand-600 cursor-pointer transition-all dark:bg-slate-800 dark:border-slate-700">
                  {coverPreview ? (
                    <div className="relative h-24 w-16 overflow-hidden rounded-lg shadow-lg">
                      <img src={coverPreview} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <>
                      <Image className="mb-2 text-slate-400 group-hover:text-brand-600 transition-colors" size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Upload Cover</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/jpeg,image/png" onChange={handleCoverChange} />
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Price (Credits)</label>
              <div className={`relative group ${!auth?.isPro ? 'opacity-60 grayscale' : ''}`}>
                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
                <input 
                  type="number" 
                  step="1"
                  min="0"
                  disabled={!auth?.isPro}
                  placeholder={auth?.isPro ? "0" : "Free Only"}
                  className="w-full rounded-2xl bg-slate-50 border-none py-4 pl-12 pr-4 text-xs md:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-600 cursor-not-allowed"
                  value={auth?.isPro ? form.price : 0} 
                  onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} 
                  required 
                />
              </div>
              {!auth?.isPro && (
                <Link to="/dashboard/pro" className="flex items-center gap-2 mt-2 ml-2 text-[9px] font-black uppercase tracking-widest text-brand-600 hover:text-brand-700 dark:text-brand-400">
                  <Sparkles size={12} /> Upgrade to Pro to set a price
                </Link>
              )}
            </div>

            {/* Content Type */}
            <div className="space-y-2 md:col-span-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Content Format</label>
               <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setForm({ ...form, documentType: 'text' })}
                    className={`flex items-center justify-center gap-2 rounded-2xl border-2 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                      form.documentType === 'text' 
                        ? 'border-brand-600 bg-brand-50 text-brand-600 dark:bg-brand-500/10' 
                        : 'border-slate-100 bg-white text-slate-400 hover:border-brand-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700'
                    }`}
                  >
                     <FileText size={16} /> Rich Text
                  </button>
                  <button 
                    type="button"
                    onClick={() => setForm({ ...form, documentType: 'pdf' })}
                    className={`flex items-center justify-center gap-2 rounded-2xl border-2 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                      form.documentType === 'pdf' 
                        ? 'border-brand-600 bg-brand-50 text-brand-600 dark:bg-brand-500/10' 
                        : 'border-slate-100 bg-white text-slate-400 hover:border-brand-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700'
                    }`}
                  >
                     <Upload size={16} /> PDF Upload
                  </button>
               </div>
            </div>

            {/* Content Input */}
            <div className="space-y-2 md:col-span-2">
               {form.documentType === 'pdf' ? (
                 <>
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Upload Manuscript (PDF, max 200MB)</label>
                   <div className="relative group">
                     <label className="flex flex-col items-center justify-center w-full px-4 py-12 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-brand-600 cursor-pointer transition-all dark:bg-slate-800 dark:border-slate-700">
                        <Upload className={`mb-3 ${pdfFile ? 'text-emerald-500' : 'text-slate-400'} group-hover:text-brand-600 transition-colors`} size={32} />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {pdfFile ? pdfFile.name : 'Select PDF Manuscript'}
                        </span>
                        <span className="mt-1 text-[10px] font-medium text-slate-400">
                          {pdfFile ? `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB` : 'Secure upload to Liyamu'}
                        </span>
                        <input type="file" className="hidden" accept="application/pdf" onChange={handlePdfChange} />
                     </label>
                   </div>
                 </>
               ) : (
                 <>
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Manuscript Content</label>
                   <textarea 
                     rows="12" 
                     placeholder="Write or paste your book content here. Markdown is supported."
                     className="w-full rounded-2xl bg-slate-50 border-none p-6 text-sm font-medium leading-relaxed text-slate-900 focus:ring-2 focus:ring-brand-600 transition-all resize-none dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-600"
                     value={form.content} 
                     onChange={(e) => setForm({ ...form, content: e.target.value })} 
                     required 
                   />
                 </>
               )}
            </div>
          </div>

          <div className="pt-4 md:pt-6 border-t border-slate-100 dark:border-slate-800">
             <button 
               disabled={loading}
               className="w-full rounded-2xl bg-brand-600 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-600/20 hover:bg-brand-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
             >
               {loading ? (
                 <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
               ) : (
                 <Upload size={16} className="group-hover:-translate-y-1 transition-transform" />
               )}
               {loading ? 'Submitting to Reviewers...' : 'Submit Manuscript for Review'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublishPage;
