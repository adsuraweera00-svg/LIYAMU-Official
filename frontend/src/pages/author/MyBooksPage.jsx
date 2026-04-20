import { useEffect, useState } from 'react';
import api from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Eye, Star, TrendingUp, AlertCircle, Clock, CheckCircle, ChevronRight, PenTool, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const MyBooksPage = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/books/mine')
      .then((res) => setBooks(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"? This action cannot be undone.`)) return;

    try {
      await api.delete(`/books/${id}`);
      setBooks(books.filter(b => b.id !== id));
      toast.success('Book deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete book');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return { label: 'Published', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
      case 'rejected': return { label: 'Rejected', icon: AlertCircle, color: 'bg-rose-50 text-rose-600 border-rose-100' };
      default: return { label: 'Pending Review', icon: Clock, color: 'bg-amber-50 text-amber-600 border-amber-100' };
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">My Publications</h1>
           <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1 dark:text-slate-500">Manage your digital works and track performance</p>
        </div>
        <Link 
          to="/dashboard/publish"
          className="flex w-full md:w-auto items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-4 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-600/20 hover:bg-brand-500 transition-all hover:-translate-y-1"
        >
          <PenTool size={14} strokeWidth={3} /> Publish New Book
        </Link>
      </div>

      <div className="grid gap-6">
        <AnimatePresence>
          {books.map((book, i) => {
            const status = getStatusBadge(book.status);
            return (
              <motion.div 
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-white border border-slate-100 p-6 md:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="flex flex-col sm:flex-row gap-6 md:gap-8">
                  {/* Cover Preview */}
                  <div className="relative h-64 w-full sm:h-48 sm:w-36 shrink-0 overflow-hidden rounded-2xl bg-slate-100 shadow-lg group-hover:scale-105 transition-transform duration-500">
                    {book.coverUrl ? (
                      <img src={book.coverUrl.startsWith('http') ? book.coverUrl : `${API_URL}${book.coverUrl}`} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-200">
                        <BookOpen size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-2 py-1 rounded-lg">{book.category}</span>
                           <div className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[8px] font-black uppercase tracking-widest ${status.color}`}>
                              <status.icon size={10} strokeWidth={3} />
                              {status.label}
                           </div>
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">{book.title}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleDelete(book.id, book.title)}
                          className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-all border border-rose-100/50"
                        >
                           <Trash2 size={18} />
                        </button>
                        {book.documentType === 'pdf' && (
                          <button 
                            onClick={() => window.open(`${API_URL}${book.pdfUrl}`, '_blank')}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white transition-all border border-brand-100"
                            title="Open PDF Manuscript"
                          >
                            <ExternalLink size={18} />
                          </button>
                        )}
                        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all border border-slate-100">
                           <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-50 pt-6">
                       <div className="space-y-1">
                          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                             <Eye size={12} /> Total Views
                          </p>
                          <p className="text-lg font-black text-slate-900">{book.viewCount}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                             <Star size={12} /> Avg Rating
                          </p>
                          <p className="text-lg font-black text-slate-900">{book.ratingAverage?.toFixed(1)}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                             <TrendingUp size={12} /> Total Sales
                          </p>
                          <p className="text-lg font-black text-brand-600">{book.sellCount}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                             <TrendingUp size={12} /> Revenue
                          </p>
                          <p className="text-lg font-black text-slate-900">${(book.sellCount * (book.price || 0) * 0.9).toFixed(2)}</p>
                       </div>
                    </div>

                    {book.status === 'rejected' && book.rejectionReason && (
                      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 border border-rose-100">
                        <AlertCircle className="mt-1 shrink-0 text-rose-600" size={16} />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">Rejection Feedback</p>
                          <p className="mt-1 text-xs font-medium text-rose-500 leading-relaxed">{book.rejectionReason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {books.length === 0 && !loading && (
          <div className="rounded-3xl md:rounded-[3rem] bg-slate-50 p-10 md:p-20 text-center border-2 border-dashed border-slate-200 dark:bg-slate-900/40 dark:border-slate-800">
             <PenTool size={40} className="md:h-12 md:w-12 mx-auto text-slate-200 dark:text-slate-800" />
             <h3 className="mt-4 md:mt-6 text-lg md:text-xl font-black text-slate-300 uppercase tracking-tight dark:text-slate-600">No books published</h3>
             <p className="mt-2 text-xs md:text-sm font-medium text-slate-400 dark:text-slate-500">Start your journey as an author by publishing your first book today.</p>
             <Link to="/dashboard/publish" className="mt-6 md:mt-8 inline-block rounded-2xl w-full sm:w-auto bg-slate-900 px-8 py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white hover:bg-brand-600 transition-all shadow-xl shadow-slate-900/10 dark:bg-brand-600 dark:shadow-brand-900/20">
                Get Started Now
             </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBooksPage;
