import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Book as BookIcon, 
  Star, 
  Eye, 
  ShoppingCart,
  BookOpen,
  Share2,
  Check,
  Coins,
  X
} from 'lucide-react';
import api from '../../api/client';
import { ProBadge } from '../../utils/badges';
import { useAuth } from '../../context/AuthContext';

const LibraryPage = () => {
  const { auth, setAuth } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [sharedId, setSharedId] = useState(null);
  const [purchaseModal, setPurchaseModal] = useState({ show: false, book: null, processing: false });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const loadBooks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/books?search=${search}&type=${type}`);
      setBooks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBooks(); }, []);

  const handleShare = async (book) => {
    const shareData = {
      title: book.title,
      text: `Check out this book "${book.title}" on Liyamu!`,
      url: `${window.location.origin}/dashboard/library/${book.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      setSharedId(book.id);
      setTimeout(() => setSharedId(null), 2000);
    }
  };

  const handlePurchase = async () => {
    const { book } = purchaseModal;
    if (!book) return;
    
    if (auth.creditBalance < book.price) {
      alert(`Insufficient credits. You need ${book.price} credits to purchase this book.`);
      return;
    }

    setPurchaseModal(prev => ({ ...prev, processing: true }));
    try {
      const { data } = await api.post(`/books/${book.id}/purchase`);
      setAuth({ 
        ...auth, 
        creditBalance: data.balance,
        purchasedBooks: [...(auth.purchasedBooks || []), book.id] 
      });
      setPurchaseModal({ show: false, book: null, processing: false });
      alert('Purchase successful! The book is now in your library.');
    } catch (err) {
       console.error(err);
       alert(err.response?.data?.message || 'Purchase failed.');
    } finally {
       setPurchaseModal(prev => ({ ...prev, processing: false }));
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="space-y-10">
      {/* Header & Filter Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Explore Library</h1>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mt-1 dark:text-slate-400">Discover your next favorite story among {books.length} publications.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="w-full rounded-2xl border-none bg-white pl-12 pr-4 py-3 md:py-4 text-xs md:text-sm shadow-sm focus:ring-2 focus:ring-brand-500 transition-all font-bold dark:bg-slate-900 dark:text-white" 
              placeholder="Search title..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <div className="relative sm:w-40 text-center">
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <select 
              className="w-full appearance-none rounded-2xl border-none bg-white pl-12 pr-4 py-3 md:py-4 text-xs md:text-sm shadow-sm focus:ring-2 focus:ring-brand-500 transition-all font-bold dark:bg-slate-900 dark:text-white" 
              value={type} 
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="free">Free Only</option>
              <option value="buy">Premium</option>
            </select>
          </div>
          <button 
            onClick={loadBooks} 
            className="rounded-2xl bg-brand-600 px-6 md:px-8 py-3 md:py-4 text-[10px] md:text-xs text-white font-black uppercase tracking-widest shadow-lg shadow-brand-200 hover:bg-brand-500 transition-all flex items-center justify-center gap-2 dark:shadow-brand-900/20"
          >
            Apply
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {books.map((book) => (
            <motion.div 
              key={book.id} 
              variants={item}
              className="group relative flex flex-col rounded-3xl md:rounded-[2rem] bg-white p-3 md:p-4 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-[1.25rem] md:rounded-2xl bg-slate-100 dark:bg-slate-800">
                <img 
                  src={book.coverUrl ? (book.coverUrl.startsWith('http') ? book.coverUrl : `${API_URL}${book.coverUrl}`) : 'https://via.placeholder.com/300x400?text=No+Cover'} 
                  alt={book.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 md:p-6">
                   <div className="flex gap-2">
                     <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-white uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
                       <Eye size={12} /> {book.viewCount || 0}
                     </span>
                   </div>
                </div>
                <div className="absolute top-4 left-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${
                    book.isFree 
                    ? 'bg-emerald-50/80 text-emerald-600 border-emerald-100/50' 
                    : 'bg-amber-50/80 text-amber-600 border-amber-100/50'
                  }`}>
                    {book.isFree ? 'Free' : `${book.price} Credits`}
                  </span>
                </div>
                <button 
                  onClick={() => handleShare(book)}
                  className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-slate-900 transition-all"
                >
                  {sharedId === book.id ? <Check size={14} /> : <Share2 size={14} />}
                </button>
              </div>

              <div className="mt-4 md:mt-6 flex-1 px-2 pb-2">
                <div className="flex items-center gap-1 text-amber-400 mb-1">
                   <Star size={12} fill="currentColor" />
                   <span className="text-[9px] md:text-[10px] font-bold text-slate-400">{book.ratingAverage?.toFixed(1) || '0.0'}</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 dark:text-white uppercase tracking-tight">{book.title}</h3>
                <div className="flex items-center gap-2 mt-1 mb-4 md:mb-6">
                  <p className="text-xs md:text-sm font-medium text-slate-500 line-clamp-1 dark:text-slate-400">by {book.author?.name || 'Unknown Author'}</p>
                  <ProBadge isPro={book.author?.isPro} size={14} />
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                   <Link 
                    to={`/dashboard/library/${book.id}`} 
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 md:py-4 text-[9px] md:text-[10px] uppercase tracking-widest font-black text-white hover:bg-brand-600 transition-all dark:bg-slate-800"
                  >
                    <BookOpen size={14} /> Read Now
                  </Link>
                  {!book.isFree && !(auth.purchasedBooks || []).includes(book.id) && (
                    <button 
                      onClick={() => setPurchaseModal({ show: true, book, processing: false })} 
                      className="flex h-[40px] w-[40px] md:h-[48px] md:w-[48px] items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100 hover:border-emerald-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 shrink-0"
                    >
                      <Coins size={16} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && books.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 md:py-20 text-center">
          <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-6 dark:bg-slate-800 dark:text-slate-700">
            <BookIcon size={40} className="md:h-12 md:w-12" />
          </div>
          <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">No books found</h3>
          <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-500 mt-2 dark:text-slate-400">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Purchase Modal */}
      <AnimatePresence>
        {purchaseModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setPurchaseModal({ show: false, book: null, processing: false })}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-sm rounded-[2.5rem] bg-white p-10 shadow-2xl dark:bg-slate-900"
             >
                <button 
                  onClick={() => setPurchaseModal({ show: false, book: null, processing: false })}
                  className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 transition-all dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <X size={18} />
                </button>

                <div className="mb-8 h-20 w-20 rounded-[2.5rem] bg-brand-50 flex items-center justify-center text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <Coins size={36} />
                </div>

                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Confirm Purchase</h3>
                <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                   You are about to spend <span className="font-black text-brand-600 dark:text-brand-400">{purchaseModal.book?.price} Credits</span> on <b>"{purchaseModal.book?.title}"</b>.
                </p>

                <div className="mt-10 flex flex-col gap-4">
                   <button 
                     onClick={handlePurchase}
                     disabled={purchaseModal.processing}
                     className="w-full py-5 rounded-2xl bg-brand-600 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all disabled:opacity-50"
                   >
                     {purchaseModal.processing ? 'Processing...' : 'Confirm & Buy'}
                   </button>
                   <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     Your balance: {auth.creditBalance} Credits
                   </p>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LibraryPage;
