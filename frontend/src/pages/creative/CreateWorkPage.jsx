import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Type, Layers, Plus, Trash2, AlertCircle, Globe } from 'lucide-react';
import api from '../../api/client';

const CreateWorkPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', category: 'Poetry', language: 'English', content: '', tags: [] });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Poetry', 'Short Story', 'Article', 'Quote', 'Other'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Other'];

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'clean']
    ],
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!form.tags.includes(tagInput.trim())) {
        setForm(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.content.length < 50) return setError('Your creativity needs a bit more substance (min 50 chars).');
    
    setLoading(true);
    setError('');
    try {
      await api.post('/creative', form);
      navigate('/dashboard/creative');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to share your work.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 md:space-y-12 pb-20">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl">
          <Sparkles size={24} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Share Creativity</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Contribute to the collective Liyamu imagination</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/creative')}
          className="rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          Cancel
        </button>
      </div>

      <div className="glass-theme rounded-[2.5rem] p-6 md:p-10 border border-white/5 shadow-2xl">
        <form onSubmit={submit} className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Title */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Title</label>
              <div className="relative group">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="The Silent Library..."
                  className="w-full rounded-2xl bg-white border-none py-4 pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-800 dark:text-white"
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  required 
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
              <div className="relative group">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
                <select
                  className="w-full rounded-2xl bg-white border-none py-4 pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-800 dark:text-white appearance-none"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            {/* Language */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Language</label>
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
                <select
                  className="w-full rounded-2xl bg-white border-none py-4 pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-800 dark:text-white appearance-none"
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  required
                >
                  {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="md:col-span-2 space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tags (Press Enter)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                <AnimatePresence>
                  {form.tags.map(tag => (
                    <motion.span
                      key={tag}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg dark:bg-emerald-500/10 dark:text-emerald-400"
                    >
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-rose-500"><Trash2 size={12} /></button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
              <div className="relative group">
                <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. mystery, life, inspiration"
                  className="w-full rounded-2xl bg-white border-none py-4 pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-800 dark:text-white"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
              </div>
            </div>

            {/* Editor */}
            <div className="md:col-span-2 space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">The Content</label>
              <div className="quill-premium rounded-3xl overflow-hidden bg-white dark:bg-slate-800 border-none min-h-[400px]">
                <ReactQuill 
                  theme="snow" 
                  value={form.content} 
                  onChange={(val) => setForm({ ...form, content: val })}
                  modules={quillModules}
                  placeholder="Unleash your imagination..."
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
               {error && (
                 <div className="flex items-center gap-2 p-3 bg-rose-50 rounded-xl text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20">
                   <AlertCircle size={14} />
                   {error}
                 </div>
               )}
            </div>

            <button 
              disabled={loading}
              className="w-full md:w-auto rounded-2xl bg-emerald-600 px-10 py-5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 hover:bg-brand-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              )}
              {loading ? 'Sharing Idea...' : 'Publish to Corner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkPage;
