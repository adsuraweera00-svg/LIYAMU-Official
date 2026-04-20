import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, MessageSquare, Heart, Eye, Plus, Filter, User, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const CreativeCornerPage = () => {
  const { auth } = useAuth();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [language, setLanguage] = useState('All');

  const categories = ['All', 'Poetry', 'Short Story', 'Article', 'Quote', 'Other'];
  const languages = ['All', 'English', 'Spanish', 'French', 'German', 'Hindi', 'Other'];

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/creative', { 
          params: { search, category: category === 'All' ? '' : category, language: language === 'All' ? '' : language } 
        });
        const worksWithLikes = data.map(work => ({
          ...work,
          isLiked: auth ? work.likes?.includes(auth.id) : false,
          isBookmarked: auth ? auth.bookmarkedWorks?.includes(work.id) : false
        }));
        setWorks(worksWithLikes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [search, category, language]);

  const toggleLike = async (id) => {
    try {
      const { data } = await api.post(`/creative/${id}/like`);
      setWorks(prev => prev.map(w => w.id === id ? { 
        ...w, 
        likesCount: data.likesCount,
        isLiked: data.isLiked 
      } : w));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleBookmark = async (id) => {
    if (!auth) return;
    // Optimistic Update
    setWorks(prev => prev.map(w => w.id === id ? { ...w, isBookmarked: !w.isBookmarked } : w));
    try {
      await api.post(`/users/bookmarks/${id}`);
    } catch (err) {
      console.error(err);
      // Revert if error
      setWorks(prev => prev.map(w => w.id === id ? { ...w, isBookmarked: !w.isBookmarked } : w));
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 md:space-y-12 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-brand-600/20">
              <Sparkles size={24} className="animate-pulse" />
            </div>
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Creative Corner</h1>
          </div>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 max-w-lg leading-relaxed">
            The heart of Liyamu's community. Share your thoughts, poems, and short stories with fellow bibliophiles.
          </p>
        </div>

        <Link 
          to="/dashboard/creative/new" 
          className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-900/20 hover:bg-brand-600 transition-all group active:scale-95"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform" />
          Share Your Work
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between glass-theme p-4 md:p-6 rounded-3xl border border-white/5 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  category === cat 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full md:w-40 rounded-xl bg-slate-50 border-none py-2 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-800 dark:text-slate-400"
          >
            {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>
        </div>

        <div className="relative w-full lg:w-72 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search by keyword or author..."
            className="w-full rounded-2xl bg-slate-100 border-none py-3 pl-10 pr-4 text-[10px] font-bold text-slate-900 focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-800/50 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Social Feed */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : works.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {works.map((work) => (
              <motion.div
                key={work.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group flex flex-col glass-theme rounded-[2rem] p-6 border border-white/5 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                {/* Work Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700 border border-white/10">
                       {work.author?.profilePicture ? (
                         <img src={work.author.profilePicture.startsWith('http') ? work.author.profilePicture : `${API_URL}${work.author.profilePicture}`} alt="" className="h-full w-full object-cover" />
                       ) : (
                         <div className="h-full w-full flex items-center justify-center font-black text-slate-400">{work.author?.name?.charAt(0)}</div>
                       )}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[120px]">{work.author?.name}</h4>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{new Date(work.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest dark:bg-emerald-500/10 dark:text-emerald-400">
                    {work.category}
                  </span>
                </div>

                {/* Work Content Preview */}
                <Link to={`/dashboard/creative/${work.id}`} className="flex-1 block group/content">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3 group-hover/content:text-brand-600 transition-colors line-clamp-2 leading-tight">
                    {work.title}
                  </h3>
                  <div 
                    className="text-xs font-medium text-slate-600 dark:text-slate-400 line-clamp-4 leading-relaxed italic"
                    dangerouslySetInnerHTML={{ __html: work.content.substring(0, 150) + (work.content.length > 150 ? '...' : '') }}
                  />
                </Link>

                {/* Interactions */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleLike(work.id)}
                      className={`flex items-center gap-1.5 transition-all active:scale-90 ${work.isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                    >
                      <Heart size={16} fill={work.isLiked ? 'currentColor' : 'none'} />
                      <span className="text-[10px] font-black">{work.likesCount || 0}</span>
                    </button>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MessageSquare size={16} />
                      <span className="text-[10px] font-black">{work.comments?.length || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleBookmark(work.id)}
                      className={`transition-all active:scale-90 ${work.isBookmarked ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}
                    >
                      <Bookmark size={16} fill={work.isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                    <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-300 transition-colors">
                      <Eye size={16} />
                      <span className="text-[10px] font-black">{work.viewCount || 0}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-20 text-center glass-theme rounded-[3rem] border border-white/5">
          <Filter className="mx-auto text-slate-200 dark:text-slate-800 mb-4" size={48} />
          <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Nothing creative found</h3>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-2 dark:text-slate-500">Try adjusting your filters or share something new</p>
        </div>
      )}
    </div>
  );
};

export default CreativeCornerPage;
