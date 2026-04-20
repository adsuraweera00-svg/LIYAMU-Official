import { useEffect, useState, useMemo } from 'react';
import api from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  MessageSquare, 
  Star, 
  User, 
  Book as BookIcon, 
  AlertCircle,
  Search,
  Filter,
  CheckCircle2,
  MoreVertical
} from 'lucide-react';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [selectedBookId, setSelectedBookId] = useState('all');
  const [showLatest, setShowLatest] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [revRes, bookRes] = await Promise.all([
        api.get('/admin/reviews'),
        api.get('/admin/books')
      ]);
      setReviews(revRes.data);
      setBooks(bookRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews(reviews.filter(r => r.id !== id));
    } catch (err) {
      console.error('Delete failed');
    }
  };

  const filteredReviews = useMemo(() => {
    let result = reviews;
    
    // Filter by Search
    if (search) {
      result = result.filter(r => 
        r.book?.title?.toLowerCase().includes(search.toLowerCase()) || 
        r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.comment?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by Rating
    if (filterRating !== 'all') {
      result = result.filter(r => r.rating === parseInt(filterRating));
    }

    // Filter by Selected Book
    if (selectedBookId !== 'all') {
      result = result.filter(r => r.book?.id === selectedBookId);
    } else if (showLatest && !search) {
      // If showing platform-wide and no search, limit to 20
      result = result.slice(0, 20);
    }

    return result;
  }, [reviews, search, filterRating, selectedBookId, showLatest]);

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
       <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="flex items-center gap-4">
           <div className="h-14 w-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-600/20">
              <MessageSquare size={28} />
           </div>
           <div>
             <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Review Audit</h1>
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Analyzing feedback & monitoring quality</p>
           </div>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
           {/* Book Selector */}
           <div className="relative flex-1 min-w-[200px]">
              <BookIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                value={selectedBookId}
                onChange={(e) => {
                  setSelectedBookId(e.target.value);
                  setShowLatest(e.target.value === 'all');
                }}
                className="w-full appearance-none rounded-2xl bg-white border border-slate-100 py-4 pl-12 pr-10 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white cursor-pointer"
              >
                <option value="all">Platform-wide (Latest 20)</option>
                <optgroup label="Filter by Specific Book">
                  {books.map(b => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </optgroup>
              </select>
           </div>

           <select 
             value={filterRating}
             onChange={(e) => setFilterRating(e.target.value)}
             className="appearance-none rounded-2xl bg-white border border-slate-100 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white cursor-pointer"
           >
              <option value="all">Any Rating</option>
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
           </select>

           <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl bg-white border border-slate-100 py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white"
              />
           </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filteredReviews.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[3rem] bg-white border border-dashed border-slate-200 py-24 text-center dark:bg-slate-900 dark:border-slate-800"
          >
             <div className="h-24 w-24 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-6 text-slate-200 dark:bg-slate-800">
                <MoreVertical size={48} />
             </div>
             <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Echo Null</h3>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 italic px-8">No feedback patterns detected for this current filter set.</p>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {filteredReviews.map((review) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={review.id}
                  className="relative flex flex-col rounded-[2.5rem] bg-white p-8 border border-slate-100 shadow-xl shadow-slate-200/10 dark:bg-slate-900 dark:border-slate-800 transition-all hover:scale-[1.02] hover:border-brand-500/30"
                >
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">
                           {review.user?.name?.charAt(0)}
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white leading-none truncate max-w-[120px]">{review.user?.name}</p>
                           <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Reader Member</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(review.id)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      >
                         <Trash2 size={16} />
                      </button>
                   </div>
                   
                   <div className="flex-1">
                      <div className="flex items-center gap-1 mb-3">
                         {[...Array(5)].map((_, i) => (
                           <Star key={i} size={10} className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-100 dark:text-slate-800'} />
                         ))}
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic leading-relaxed line-clamp-4">
                        "{review.comment || 'Pure appreciation. No text provided.'}"
                      </p>
                   </div>

                   <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800/50 flex items-center gap-4">
                      <div className="h-12 w-9 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                         {review.book?.coverUrl && <img src={review.book.coverUrl.startsWith('http') ? review.book.coverUrl : `${api.defaults.baseURL.replace('/api', '')}${review.book.coverUrl}`} className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                         <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Feedback Path</p>
                         <p className="text-[10px] font-black uppercase tracking-tight text-slate-900 dark:text-white truncate">{review.book?.title}</p>
                      </div>
                   </div>
                </motion.div>
             ))}
          </div>
        )}
      </AnimatePresence>

      {selectedBookId === 'all' && showLatest && filteredReviews.length >= 20 && (
         <div className="mt-12 text-center">
            <button 
              onClick={() => setShowLatest(false)}
              className="px-8 py-4 rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-brand-600 transition-all shadow-xl shadow-slate-900/10"
            >
              Reveal Platform-wide History
            </button>
         </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
