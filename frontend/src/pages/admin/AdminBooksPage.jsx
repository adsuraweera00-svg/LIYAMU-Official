import { useEffect, useState, useMemo } from 'react';
import api from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Eye, EyeOff, TrendingUp, User, Book as BookIcon, X, AlertCircle, Search, Filter, ChevronDown, Check, Trash2, ExternalLink } from 'lucide-react';

const AdminBooksPage = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewingBook, setViewingBook] = useState(null);
  const [confirmAction, setConfirmAction] = useState({ show: false, type: '', id: null });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/books');
      setBooks(data);
    } catch (err) {
      console.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpdate = async (id, status, reason = '') => {
    try {
      await api.put(`/admin/books/${id}`, { status, rejectionReason: reason });
      setRejectingId(null);
      setRejectionReason('');
      load();
    } catch (err) {
      console.error('Update failed');
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      const { data } = await api.put(`/admin/books/${id}/visibility`);
      setBooks(books.map(b => b.id === id ? { ...b, isHidden: data.isHidden } : b));
    } catch (err) {
      console.error('Toggle visibility failed');
    }
  };

  const handleDeleteBook = async (id) => {
    try {
      await api.delete(`/admin/books/${id}`);
      setBooks(books.filter(b => b.id !== id));
      setConfirmAction({ show: false, type: '', id: null });
    } catch (err) {
      console.error('Delete failed');
    }
  };

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           book.author?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [books, searchTerm, statusFilter]);

  const statusColors = {
    approved: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    rejected: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    pending: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
            <BookIcon size={24} className="md:h-7 md:w-7" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Content Moderation</h2>
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Review and approve book submissions from authors</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-3">
        <div className="relative group md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by book title or author..."
            className="w-full rounded-2xl bg-white border border-slate-100 py-3 md:py-4 pl-12 pr-4 text-xs font-bold text-slate-900 shadow-sm focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
          <select 
            className="w-full appearance-none rounded-2xl bg-white border border-slate-100 py-3 md:py-4 pl-12 pr-4 text-xs font-bold text-slate-900 shadow-sm focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Submissions</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors pointer-events-none" size={18} />
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-3xl md:rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap modern-table">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-5 py-4 md:px-8 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Book Details</th>
                <th className="px-4 py-4 md:px-6 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Author</th>
                <th className="px-4 py-4 md:px-6 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Status</th>
                <th className="px-4 py-4 md:px-6 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Price</th>
                <th className="px-4 py-4 md:px-6 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 text-center">Engagement</th>
                <th className="px-5 py-4 md:px-8 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-5 md:px-8 md:py-6" data-label="Book Details">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 shadow-sm transition-transform group-hover:scale-105">
                        {book.coverUrl && <img src={book.coverUrl.startsWith('http') ? book.coverUrl : `${API_URL}${book.coverUrl}`} className="h-full w-full object-cover" alt="" />}
                      </div>
                      <div>
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white max-w-[150px] md:max-w-none truncate">{book.title}</p>
                        <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 dark:text-slate-500">{book.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5 md:px-6 md:py-6" data-label="Author">
                    <div className="flex items-center gap-2">
                       <User size={14} className="text-slate-400 dark:text-slate-500" />
                       <span className="text-[10px] md:text-xs font-bold text-slate-600 dark:text-slate-400">{book.author?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5 md:px-6 md:py-6" data-label="Status">
                    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[8px] md:text-[9px] font-black uppercase tracking-widest ${statusColors[book.status]}`}>
                      {book.status === 'approved' ? <CheckCircle size={10} /> : book.status === 'rejected' ? <XCircle size={10} /> : <Clock size={10} />}
                      {book.status}
                    </span>
                    {book.isHidden && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-lg bg-slate-900 border-none px-2 py-1 text-[8px] font-black uppercase text-white tracking-widest leading-none">
                        <EyeOff size={10} /> Hidden
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-5 md:px-6 md:py-6 font-mono text-[10px] md:text-xs font-black text-slate-900 dark:text-white" data-label="Price">
                    {book.price} Credits
                  </td>
                  <td className="px-4 py-5 md:px-6 md:py-6" data-label="Engagement">
                    <div className="flex items-center justify-center gap-3 md:gap-4 text-slate-400 dark:text-slate-500">
                       <div className="flex items-center gap-1.5">
                          <Eye size={12} />
                          <span className="text-[9px] md:text-[10px] font-black">{book.viewCount}</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          <TrendingUp size={12} className="text-emerald-500" />
                          <span className="text-[9px] md:text-[10px] font-black text-slate-900 dark:text-slate-300">{book.sellCount}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-5 py-5 md:px-8 md:py-6 text-right" data-label="Actions">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setViewingBook(book)}
                        className="h-8 md:h-9 w-8 md:w-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-brand-600 transition-all dark:bg-slate-800 dark:border-slate-700"
                        title="View Content"
                      >
                        <Eye size={16} />
                      </button>
                      {book.documentType === 'pdf' && (
                        <button 
                          onClick={() => window.open(`${API_URL}${book.pdfUrl}`, '_blank')}
                          className="h-8 md:h-9 w-8 md:w-9 flex items-center justify-center rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white transition-all dark:bg-brand-500/10"
                          title="Open PDF in New Tab"
                        >
                          <ExternalLink size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleToggleVisibility(book.id)}
                        className={`h-8 md:h-9 w-8 md:w-9 flex items-center justify-center rounded-xl transition-all ${book.isHidden ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/30' : 'bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-500 dark:bg-slate-800 dark:border-slate-700'}`}
                        title={book.isHidden ? 'Make Visible' : 'Hide from Public Library'}
                      >
                        {book.isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      {book.status !== 'approved' && (
                        <button 
                          onClick={() => setConfirmAction({ show: true, type: 'approved', id: book.id })}
                          className="h-8 md:h-9 px-3 md:px-4 flex items-center justify-center rounded-xl bg-emerald-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-500 transition-all active:scale-95"
                        >
                          Approve
                        </button>
                      )}
                      {book.status === 'pending' && (
                        <button 
                          onClick={() => setRejectingId(book.id)}
                          className="h-8 md:h-9 px-3 md:px-4 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10"
                        >
                          Reject
                        </button>
                      )}
                      <button 
                        onClick={() => setConfirmAction({ show: true, type: 'delete', id: book.id })}
                        className="h-8 md:h-9 w-8 md:w-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        title="Delete Book Permanently"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBooks.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="p-0 border-none">
                    <div className="flex flex-col items-center justify-center w-full py-20 px-4 whitespace-normal">
                      <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-50 text-slate-300 dark:bg-slate-800/50">
                         <Search size={40} />
                      </div>
                      <h3 className="mt-6 text-sm font-black uppercase tracking-widest text-slate-400 text-center">No submissions found matching filters</h3>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Review Modal */}
      <AnimatePresence>
        {viewingBook && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingBook(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl h-[90vh] overflow-hidden rounded-[2.5rem] bg-white shadow-2xl dark:bg-slate-900 border border-white/10 flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800 shadow-lg">
                    {viewingBook.coverUrl && <img src={viewingBook.coverUrl.startsWith('http') ? viewingBook.coverUrl : `${API_URL}${viewingBook.coverUrl}`} className="h-full w-full object-cover" alt="" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-tight">{viewingBook.title}</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Reviewing manuscript by {viewingBook.author?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                     onClick={() => setConfirmAction({ show: true, type: 'approved', id: viewingBook.id })}
                     className="px-6 py-3 rounded-2xl bg-emerald-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
                   >
                     Approve
                   </button>
                   <button 
                     onClick={() => setRejectingId(viewingBook.id)}
                     className="px-6 py-3 rounded-2xl bg-rose-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20"
                   >
                     Reject
                   </button>
                   {viewingBook.documentType === 'pdf' && (
                     <button 
                       onClick={() => window.open(`${API_URL}${viewingBook.pdfUrl}`, '_blank')}
                       className="rounded-xl bg-brand-600 p-3 hover:bg-brand-500 transition-all text-white shadow-lg shadow-brand-600/20"
                       title="Open in New Tab"
                     >
                       <ExternalLink size={20} />
                     </button>
                   )}
                   <button onClick={() => setViewingBook(null)} className="rounded-xl bg-slate-200 dark:bg-slate-800 p-3 hover:bg-slate-300 transition-all text-slate-600 dark:text-slate-400">
                     <X size={20} />
                   </button>
                </div>
              </div>

              {/* Modal Content - SECURE READER */}
              <div 
                className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 p-4 md:p-8 relative select-none"
                onContextMenu={(e) => e.preventDefault()}
              >
                {viewingBook.documentType === 'pdf' ? (
                  <div className="h-full w-full rounded-2xl overflow-hidden shadow-2xl relative bg-white">
                    {/* Protection Overlay to catch clicks on some browsers */}
                    <div className="absolute inset-0 z-10 pointer-events-none border-[12px] border-slate-900/5" />
                    <iframe 
                      src={`${API_URL}${viewingBook.pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                      className="h-full w-full"
                      style={{ border: 'none' }}
                      title="PDF Preview"
                    />
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-10 md:p-16 rounded-[2.5rem] shadow-xl text-slate-800 dark:text-slate-200 font-serif text-lg leading-relaxed whitespace-pre-wrap">
                    {viewingBook.content || "Empty manuscript content."}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Action Confirmation Modal */}
      <AnimatePresence>
        {confirmAction.show && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-2xl dark:bg-slate-900"
            >
              <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${confirmAction.type === 'approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'}`}>
                {confirmAction.type === 'approved' ? <Check size={32} /> : <AlertCircle size={32} />}
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                {confirmAction.type === 'approved' ? 'Confirm Approval' : 'Confirm Action'}
              </h3>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                Are you sure you want to {confirmAction.type} this book? This will notify the author.
              </p>
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setConfirmAction({ show: false, type: '', id: null })}
                  className="flex-1 rounded-xl bg-slate-100 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-200 transition-all dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (confirmAction.type === 'delete') {
                      handleDeleteBook(confirmAction.id);
                    } else {
                      handleUpdate(confirmAction.id, confirmAction.type);
                    }
                    setConfirmAction({ show: false, type: '', id: null });
                    setViewingBook(null);
                  }}
                  className={`flex-1 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 ${
                    confirmAction.type === 'approved' ? 'bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-500' : 
                    confirmAction.type === 'delete' ? 'bg-rose-600 shadow-rose-600/20 hover:bg-rose-500' :
                    'bg-rose-600 shadow-rose-600/20 hover:bg-rose-500'}`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectingId && (
          <div className="fixed inset-0 z-[260] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setRejectingId(null)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-md overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-white shadow-2xl dark:bg-slate-900"
             >
                <div className="bg-rose-500 p-6 md:p-8 text-white flex justify-between items-center">
                   <div>
                     <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none">Reject Submission</h2>
                     <p className="mt-1 md:mt-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-rose-100">Help the author improve</p>
                   </div>
                   <button onClick={() => setRejectingId(null)} className="rounded-xl bg-white/20 p-2 hover:bg-white/30 transition-all">
                     <X size={20} />
                   </button>
                </div>
                <div className="p-6 md:p-8">
                   <div className="rounded-2xl bg-rose-50 p-4 border border-rose-100 flex gap-3 mb-6 dark:bg-rose-500/10 dark:border-rose-500/20">
                      <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5 dark:text-rose-400" />
                      <p className="text-[9px] md:text-[10px] font-medium text-rose-600 leading-relaxed dark:text-rose-400">
                         The rejection reason will be sent to the author as a notification. Be professional and specific.
                      </p>
                   </div>
                   <textarea 
                     className="w-full rounded-2xl bg-slate-50 p-4 md:p-6 text-xs md:text-sm font-bold border-none focus:ring-2 focus:ring-rose-500 transition-all placeholder:text-slate-300 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-600"
                     rows="4"
                     placeholder="State the reason for rejection..."
                     value={rejectionReason}
                     onChange={(e) => setRejectionReason(e.target.value)}
                   />
                   <div className="mt-6 md:mt-8 flex flex-col md:flex-row gap-3 md:gap-4">
                      <button 
                        onClick={() => setRejectingId(null)}
                        className="w-full md:flex-1 rounded-2xl bg-slate-50 px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                      <button 
                        disabled={!rejectionReason.trim()}
                        onClick={() => {
                          handleUpdate(rejectingId, 'rejected', rejectionReason);
                          setViewingBook(null);
                        }}
                        className="w-full md:flex-[2] rounded-2xl bg-slate-900 px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-900/10 hover:bg-brand-600 transition-all disabled:opacity-50 dark:bg-brand-600"
                      >
                        Confirm Rejection
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBooksPage;
