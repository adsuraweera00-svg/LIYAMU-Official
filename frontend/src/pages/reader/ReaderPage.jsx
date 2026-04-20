import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, MessageSquare, AlertCircle, Quote, Users, ShieldCheck, Coins, ShoppingCart, Lock } from 'lucide-react';
import api from '../../api/client';
import SecurePDFReader from '../../components/SecurePDFReader';
import { useAuth } from '../../context/AuthContext';

const ReaderPage = () => {
  const { auth, setAuth } = useAuth();
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const load = async () => {
    try {
      const { data } = await api.get(`/books/${id}`);
      setBook(data);
    } catch (err) {
      console.error('Failed to load book');
    }
  };

  useEffect(() => {
    load();
    // Track reading progress
    api.put(`/users/reading-progress/${id}`).catch(console.error);
    
    // Global protection
    const prevent = (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', prevent);
    return () => document.removeEventListener('contextmenu', prevent);
  }, [id]);

  const handleReview = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.post(`/books/${id}/review`, { rating, comment });
      setMessage({ text: 'Review submitted successfully!', type: 'success' });
      setComment('');
      load(); // Reload to show new review and average
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to submit review', type: 'error' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handlePurchase = async () => {
    if (auth.creditBalance < book.price) {
      alert(`Insufficient credits. You need ${book.price} credits.`);
      return;
    }

    setIsBuying(true);
    try {
      const { data } = await api.post(`/books/${id}/purchase`);
      setAuth({ 
        ...auth, 
        creditBalance: data.balance,
        purchasedBooks: [...(auth.purchasedBooks || []), id] 
      });
      alert('Purchase successful! Unlocking content...');
      load();
    } catch (err) {
      console.error(err);
      alert('Purchase failed.');
    } finally {
      setIsBuying(false);
    }
  };

  if (!book) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 md:space-y-12 pb-20">
      {/* Reader Mode */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-white p-6 md:p-8 shadow-2xl dark:bg-slate-900 border border-slate-50 dark:border-slate-800"
      >
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 border-b border-slate-50 dark:border-slate-800 pb-6 md:pb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-tight">{book.title}</h1>
            <div className="mt-3 md:mt-4 flex flex-wrap items-center gap-3 md:gap-4">
               <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-black uppercase">
                     {book.author?.name?.charAt(0)}
                  </div>
                  <span className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">{book.author?.name}</span>
               </div>
               <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
               <div className="flex items-center gap-2 text-brand-600">
                  <Star size={16} fill="currentColor" />
                  <span className="text-sm font-black tracking-tight">{book.ratingAverage.toFixed(1)}</span>
                  <span className="text-[10px] font-bold text-slate-400 capitalize">({book.ratingCount} reviews)</span>
               </div>
               <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
               <div className="flex items-center gap-2 text-slate-400">
                  <Users size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{book.author?.followersCount || 0} Followers</span>
               </div>
            </div>
          </div>
          
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-600">Premium Protected Reader Mode v2.0</p>
        </div>

        <div className="relative min-h-[70vh]">
          {book.requiresPurchase ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
               <div className="mb-8 rounded-[2.5rem] bg-slate-50 p-10 text-slate-300 dark:bg-slate-800/50">
                  <Lock size={64} />
               </div>
               <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">This book requires purchase</h3>
               <p className="mt-4 max-w-sm text-sm font-medium text-slate-500 dark:text-slate-400">Unlock the full content and support the author by spending your credits.</p>
               
               <div className="mt-10 flex flex-col items-center gap-4">
                  <button 
                    onClick={handlePurchase}
                    disabled={isBuying}
                    className="flex items-center gap-3 rounded-2xl bg-brand-600 px-10 py-5 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all disabled:opacity-50"
                  >
                    {isBuying ? 'Unlocking...' : (
                      <>
                        <Coins size={18} /> Purchase for {book.price} Credits
                      </>
                    )}
                  </button>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Your balance: {auth.creditBalance} Credits
                  </p>
               </div>
            </div>
          ) : book.documentType === 'text' ? (
            <article className="prose prose-slate max-w-none whitespace-pre-wrap px-4 pb-12 dark:prose-invert font-serif leading-relaxed text-lg text-slate-700 dark:text-slate-300">
              {book.content || 'No content available for this book.'}
            </article>
          ) : (
            <SecurePDFReader 
              fileUrl={book.pdfUrl?.startsWith('http') ? book.pdfUrl : `${API_URL}${book.pdfUrl}`} 
              coverUrl={book.coverUrl?.startsWith('http') ? book.coverUrl : `${API_URL}${book.coverUrl}`}
              title={book.title} 
            />
          )}
        </div>
      </motion.div>

      <div className="grid gap-8 md:gap-12 lg:grid-cols-5">
        {/* Review Form */}
        <div className="lg:col-span-2 space-y-8">
           <div className="rounded-3xl md:rounded-[2.5rem] bg-emerald-950 p-6 md:p-8 text-white shadow-xl shadow-emerald-900/20">
              <h3 className="mb-4 md:mb-6 text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <ShieldCheck className="text-brand-400" />
                Reader Feedback
              </h3>
              
              <div className="mb-6 flex gap-2">
                 {[1, 2, 3, 4, 5].map((s) => (
                   <button 
                     key={s}
                     onMouseEnter={() => setHoverRating(s)}
                     onMouseLeave={() => setHoverRating(0)}
                     onClick={() => setRating(s)}
                     className="transition-transform hover:scale-110 active:scale-95"
                   >
                     <Star 
                       size={32} 
                       className={s <= (hoverRating || rating) ? 'text-brand-500' : 'text-emerald-800'} 
                       fill={s <= (hoverRating || rating) ? 'currentColor' : 'none'}
                       strokeWidth={2.5}
                     />
                   </button>
                 ))}
              </div>

              <div className="space-y-4">
                 <textarea 
                   value={comment}
                   onChange={(e) => setComment(e.target.value)}
                   placeholder="Share your thoughts about this masterpiece..."
                   className="w-full rounded-2xl bg-emerald-900/50 border border-white/5 px-5 py-4 text-sm font-medium text-white placeholder:text-emerald-400 focus:ring-2 focus:ring-brand-600 min-h-[120px]"
                 />
                 
                 <AnimatePresence>
                   {message.text && (
                     <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`flex items-center gap-3 rounded-xl p-3 text-[10px] font-black uppercase tracking-widest ${
                          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}
                     >
                        <AlertCircle size={14} />
                        {message.text}
                     </motion.div>
                   )}
                 </AnimatePresence>

                 <button 
                   onClick={handleReview}
                   disabled={isSubmitting}
                   className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-600 py-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand-600/20 hover:bg-brand-500 transition-all disabled:opacity-50"
                 >
                   {isSubmitting ? 'Submitting...' : 'Post Thought'}
                   <Send size={16} />
                 </button>
              </div>
           </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-3 space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-3 text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                 <MessageSquare size={24} className="text-brand-600" />
                 Reader Feed 
                 <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 dark:bg-slate-800">{book.reviews?.length || 0}</span>
              </h3>
           </div>

           <div className="space-y-6">
              {book.reviews?.length > 0 ? (
                book.reviews.map((r, i) => (
                  <motion.div 
                    key={r.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative rounded-3xl md:rounded-[2rem] bg-white p-5 md:p-6 border border-slate-50 shadow-sm dark:bg-slate-800/50 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700">
                           {r.user?.profilePicture ? (
                             <img src={r.user.profilePicture.startsWith('http') ? r.user.profilePicture : `${API_URL}${r.user.profilePicture}`} alt={r.user.name} className="h-full w-full object-cover" />
                           ) : (
                             <div className="flex h-full w-full items-center justify-center font-black text-slate-400">
                               {r.user?.name?.charAt(0) || 'U'}
                             </div>
                           )}
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">{r.user?.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Reader</p>
                        </div>
                      </div>
                      <div className="flex gap-1 text-brand-600">
                         {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" strokeWidth={0} />)}
                      </div>
                    </div>
                    
                    <div className="relative">
                       <Quote className="absolute -left-2 -top-2 h-8 w-8 text-slate-100 dark:text-slate-800 -z-0" />
                       <p className="relative z-10 text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300 italic">
                         "{r.comment || 'This reader left a rating without a comment.'}"
                       </p>
                    </div>
                    
                    <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                       {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                   <div className="mb-4 rounded-3xl bg-slate-100 p-6 text-slate-400 dark:bg-slate-800">
                      <MessageSquare size={48} />
                   </div>
                   <h4 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Be the first to review</h4>
                   <p className="text-xs font-black uppercase tracking-widest text-slate-400">Share your thoughts with the community</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReaderPage;
