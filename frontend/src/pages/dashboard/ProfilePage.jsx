import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { getRoleBadge } from '../../utils/badges';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Phone, Facebook, Send, User, BookOpen, Clock, CheckCircle, AlertCircle, Bookmark, Trash2, Plus, Key, Lock } from 'lucide-react';

const ProfilePage = () => {
  const { auth, setAuth } = useAuth();
  const [form, setForm] = useState({ 
    name: auth?.name || '', 
    email: auth?.email || '',
    phone: auth?.phone || '', 
    bio: auth?.bio || '', 
    socialLinks: {
      facebook: auth?.socialLinks?.facebook || '',
      whatsapp: auth?.socialLinks?.whatsapp || '',
      telegram: auth?.socialLinks?.telegram || ''
    }
  });
  const [myBooks, setMyBooks] = useState([]);
  const [bookmarkedWorks, setBookmarkedWorks] = useState([]);
  const [message, setMessage] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(auth?.profilePicture || '');
  const [deletedWorks, setDeletedWorks] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState({ text: '', type: '' });

  const badge = getRoleBadge(auth?.role);
  const isAuthor = ['author', 'verified_author', 'pro_writer'].includes(auth?.role);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (isAuthor) {
      api.get('/books/mine').then(res => setMyBooks(res.data));
    }
    api.get('/users/bookmarks').then(res => setBookmarkedWorks(res.data));
    api.get('/creative/my/deleted').then(res => setDeletedWorks(res.data));
  }, [isAuthor]);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setMessage('Image size must be less than 10MB');
        return;
      }
      setProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const removeBookmark = async (id) => {
    try {
      await api.post(`/users/bookmarks/${id}`);
      setBookmarkedWorks(prev => prev.filter(w => w._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'socialLinks') {
          formData.append(key, JSON.stringify(form[key]));
        } else {
          formData.append(key, form[key]);
        }
      });
      if (profilePictureFile) {
        formData.append('profilePicture', profilePictureFile);
      }

      const { data } = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAuth((prev) => ({ ...prev, ...data }));
      setMessage('Profile updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    }
  };

  const restoreWork = async (id) => {
    try {
      await api.post(`/creative/restore/${id}`);
      setDeletedWorks(prev => prev.filter(w => w._id !== id));
      setMessage('Work restored successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };
  const deleteAccount = async () => {
    setLoading(true);
    try {
      await api.delete('/users/me');
      setAuth(null);
      window.location.href = '/'; // Logout and redirect
    } catch (err) {
      setMessage(err.response?.data?.message || 'Deletion failed');
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMessage({ text: '', type: '' });
    try {
      await api.put('/users/password', passForm);
      setPassMessage({ text: 'Password updated successfully!', type: 'success' });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPassMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setPassMessage({ text: err.response?.data?.message || 'Failed to update password', type: 'error' });
    } finally {
      setPassLoading(false);
    }
  };
  return (
    <div className="space-y-8 pb-20">
      {/* Header & Badge */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-brand-600/20 to-transparent pointer-events-none" />
        <div className="flex items-center gap-8 relative z-10">
          <div className="relative group">
            <div className={`h-24 w-24 rounded-[2rem] ${badge.color} flex items-center justify-center border-4 border-slate-800 shadow-2xl overflow-hidden`}>
               {profilePicturePreview ? (
                 <img 
                  src={profilePicturePreview.startsWith('blob:') ? profilePicturePreview : `${API_URL}${profilePicturePreview}`} 
                  alt={auth?.name} 
                  className="h-full w-full object-cover" 
                 />
               ) : (
                 <badge.icon size={48} className={badge.badgeColor} />
               )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[2rem]">
               <Plus size={24} className="text-white" />
               <input type="file" className="hidden" accept="image/jpeg,image/png" onChange={handleProfilePictureChange} />
            </label>
            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-brand-600 flex items-center justify-center border-4 border-slate-900 shadow-lg">
               <ShieldCheck size={18} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight leading-none text-white">{auth?.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
               <span className={`rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest ${badge.color}`}>
                 {badge.label}
               </span>
               <div className="h-1 w-1 rounded-full bg-slate-700" />
               <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Joined {new Date(auth?.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        {!isAuthor && (
           <Link 
            to="/dashboard/verification"
            className="rounded-2xl bg-brand-600 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-brand-600/20 hover:bg-brand-500 transition-all hover:-translate-y-1 active:scale-95 z-10"
           >
             Apply to be an Author
           </Link>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Settings form */}
        <div className="lg:col-span-2 space-y-8">
           <div className="rounded-[2.5rem] bg-white p-10 border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
               <div className="flex items-center justify-between mb-10">
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3 dark:text-white">
                   <User size={24} className="text-brand-600" /> Account Settings
                </h2>
                {message && (
                   <motion.span 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl dark:bg-emerald-500/10 dark:text-emerald-400"
                  >
                    {message}
                  </motion.span>
                )}
              </div>
              
              <form onSubmit={save} className="grid gap-8 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input className="w-full rounded-2xl bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold border-none focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-800 dark:text-white" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input className="w-full rounded-2xl bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold border-none focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-800 dark:text-white" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input className="w-full rounded-2xl bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold border-none focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-800 dark:text-white" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                
                <div className="space-y-2 md:col-span-2 border-t border-slate-50 pt-8 mt-4 dark:border-slate-800">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-6 dark:text-white">Social Connections</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="relative">
                      <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input className="w-full rounded-xl bg-slate-50 py-3 pl-12 pr-4 text-[11px] font-bold border-none dark:bg-slate-800 dark:text-white" value={form.socialLinks.facebook} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, facebook: e.target.value } })} placeholder="Facebook profile" />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input className="w-full rounded-xl bg-slate-50 py-3 pl-12 pr-4 text-[11px] font-bold border-none dark:bg-slate-800 dark:text-white" value={form.socialLinks.whatsapp} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, whatsapp: e.target.value } })} placeholder="WhatsApp number" />
                    </div>
                    <div className="relative">
                      <Send className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input className="w-full rounded-xl bg-slate-50 py-3 pl-12 pr-4 text-[11px] font-bold border-none dark:bg-slate-800 dark:text-white" value={form.socialLinks.telegram} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, telegram: e.target.value } })} placeholder="Telegram handle" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Public Bio</label>
                  <textarea className="w-full rounded-2xl bg-slate-50 p-6 text-sm font-bold border-none focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-800 dark:text-white" rows="4" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell the community about yourself..." />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-end md:col-span-2 border-t border-slate-50 pt-8 gap-6 dark:border-slate-800">
                  <button className="w-full md:w-auto rounded-2xl bg-slate-900 px-10 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-brand-600 transition-all dark:bg-brand-600">
                    Update Profile
                  </button>
                </div>
              </form>
           </div>

            {/* Author Books Section */}
           {isAuthor && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[2.5rem] bg-white p-10 border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
              >
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3 dark:text-white">
                       <BookOpen size={24} className="text-brand-600" /> Your Publications
                    </h2>
                    <span className="rounded-xl bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                       {myBooks.length} Total
                    </span>
                 </div>

                 <div className="space-y-4">
                    {myBooks.map((book) => (
                       <div key={book._id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-6 border border-transparent hover:border-slate-100 transition-all group dark:bg-slate-800/50 dark:hover:border-slate-700">
                          <div className="flex items-center gap-4">
                             <div className="h-12 w-10 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
                                {book.coverUrl && <img src={book.coverUrl.startsWith('http') ? book.coverUrl : `${API_URL}${book.coverUrl}`} className="h-full w-full object-cover" alt="" />}
                             </div>
                             <div>
                                <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">{book.title}</h4>
                                <p className="text-[10px] font-medium text-slate-400 capitalize dark:text-slate-500">{book.category}</p>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                             <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-[8px] font-black uppercase tracking-widest ${
                                book.status === 'rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                             }`}>
                                {book.status === 'approved' ? <CheckCircle size={10} /> : 
                                 book.status === 'rejected' ? <AlertCircle size={10} /> : <Clock size={10} />}
                                {book.status}
                             </div>
                          </div>
                       </div>
                    ))}
                    {myBooks.length === 0 && (
                       <div className="py-10 text-center">
                          <p className="text-xs font-medium text-slate-400 italic">You haven't published any books yet.</p>
                       </div>
                    )}
                 </div>
              </motion.div>
           )}

            {/* Bookmarked Works Section */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="rounded-[2.5rem] bg-white p-10 border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
            >
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3 dark:text-white">
                     <Bookmark size={24} className="text-brand-600" /> Bookmarked Works
                  </h2>
                  <span className="rounded-xl bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                     {bookmarkedWorks.length} Saved
                  </span>
               </div>

               <div className="space-y-4">
                  {bookmarkedWorks.map((work) => (
                     <Link to={`/dashboard/creative/${work._id}`} key={work._id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-6 border border-transparent hover:border-slate-100 transition-all group dark:bg-slate-800/50 dark:hover:border-slate-700">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800">
                              {work.author?.profilePicture ? (
                                <img src={work.author.profilePicture.startsWith('http') ? work.author.profilePicture : `${API_URL}${work.author.profilePicture}`} className="h-full w-full object-cover" alt="" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center font-black text-slate-400">{work.author?.name?.charAt(0)}</div>
                              )}
                           </div>
                           <div>
                              <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors dark:text-white">{work.title}</h4>
                              <p className="text-[10px] font-medium text-slate-400 capitalize dark:text-slate-500">By {work.author?.name}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button 
                             onClick={(e) => {
                               e.preventDefault();
                               e.stopPropagation();
                               removeBookmark(work._id);
                             }}
                             className="rounded-xl bg-white px-3 py-1.5 shadow-sm text-slate-400 hover:text-rose-500 transition-colors dark:bg-slate-800/80"
                           >
                              <Trash2 size={14} />
                           </button>
                           <div className="rounded-xl bg-white px-3 py-1.5 shadow-sm text-brand-600 dark:bg-slate-800/80">
                              <Bookmark size={14} fill="currentColor" />
                           </div>
                        </div>
                     </Link>
                  ))}
                  {bookmarkedWorks.length === 0 && (
                     <div className="py-10 text-center">
                        <p className="text-xs font-medium text-slate-400 italic">You haven't bookmarked any works yet.</p>
                     </div>
                  )}
               </div>
            </motion.div>
        </div>

        {/* Info card */}
        <div className="space-y-6">
          <div className="rounded-[2.5rem] bg-brand-600 p-10 text-white">
            <h3 className="text-xl font-black uppercase tracking-tight leading-tight">Your Portfolio Summary</h3>
            <p className="mt-4 text-xs font-medium text-brand-100 leading-relaxed">
              Your presence on Liyamu matters. Keep your profile updated to build trust with your readers and fellow authors.
            </p>
            <div className="mt-10 space-y-4">
               <div className="flex items-center justify-between rounded-[1.5rem] bg-white/10 p-5 backdrop-blur-sm border border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest">Library Growth</span>
                  <span className="text-xl font-black">{auth?.purchasedBooks?.length || 0}</span>
               </div>
               {isAuthor && (
                 <div className="flex items-center justify-between rounded-[1.5rem] bg-slate-900/40 p-5 backdrop-blur-sm border border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-400">Total Status</span>
                    <span className="text-xl font-black">ACTIVE</span>
                 </div>
               )}
            </div>
          </div>
          
          <div className="rounded-[2.5rem] bg-white p-8 border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 dark:text-slate-500">Change Password</h4>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                 <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="password" 
                      placeholder="Current Password"
                      className="w-full rounded-xl bg-slate-50 py-3 pl-12 pr-4 text-[10px] font-bold border-none focus:ring-1 focus:ring-brand-600 transition-all dark:bg-slate-800 dark:text-white"
                      value={passForm.currentPassword}
                      onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                      required
                    />
                 </div>
                 <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="password" 
                      placeholder="New Password"
                      className="w-full rounded-xl bg-slate-50 py-3 pl-12 pr-4 text-[10px] font-bold border-none focus:ring-1 focus:ring-brand-600 transition-all dark:bg-slate-800 dark:text-white"
                      value={passForm.newPassword}
                      onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                      required
                    />
                 </div>
                 <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="password" 
                      placeholder="Confirm New Password"
                      className="w-full rounded-xl bg-slate-50 py-3 pl-12 pr-4 text-[10px] font-bold border-none focus:ring-1 focus:ring-brand-600 transition-all dark:bg-slate-800 dark:text-white"
                      value={passForm.confirmPassword}
                      onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                      required
                    />
                 </div>

                 {passMessage.text && (
                    <p className={`text-[8px] font-black uppercase tracking-widest text-center py-2 rounded-lg ${passMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                       {passMessage.text}
                    </p>
                 )}

                 <button 
                  type="submit"
                  disabled={passLoading}
                  className="w-full rounded-xl bg-slate-900 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-brand-600 transition-all disabled:opacity-50"
                 >
                   {passLoading ? 'Updating...' : 'Update Password'}
                 </button>
              </form>
           </div>

           <div className="rounded-[2.5rem] bg-white p-8 border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 dark:text-slate-500">Security & Privacy</h4>
              <button className="w-full rounded-2xl bg-slate-50 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all dark:bg-slate-800 dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 mb-4">
                 Terminate All Sessions
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="w-full rounded-2xl bg-rose-50/50 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-100 transition-all dark:bg-rose-500/10 dark:hover:bg-rose-500/20"
              >
                 Delete Account
              </button>
           </div>
           
           {/* Chat FAB */}
           <div className="rounded-[2.5rem] bg-white p-8 border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 dark:text-slate-500">Need Help?</h4>
              <Link 
                to="/dashboard/support"
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-brand-600 transition-all dark:bg-brand-600"
              >
                 <Send size={14} /> Chat with Admin
              </Link>
           </div>
        </div>
      </div>

      {/* Deleted Contributions Section */}
      {deletedWorks.length > 0 && (
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="rounded-[2.5rem] bg-white p-10 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 mt-8"
        >
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3 dark:text-white">
                 <Trash2 size={24} className="text-rose-500" /> Deleted Contributions
              </h2>
              <span className="text-[10px] font-bold text-slate-400 italic">Visible only to you</span>
           </div>

           <div className="grid gap-6 md:grid-cols-2">
              {deletedWorks.map((work) => (
                 <div key={work._id} className="flex flex-col rounded-2xl bg-slate-50/50 p-6 border border-slate-100 dark:bg-slate-800/30 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                       <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">{work.title}</h4>
                       <span className="text-[9px] font-bold text-slate-400">Deleted on {new Date(work.deletedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-auto">
                       <button 
                         onClick={() => restoreWork(work._id)}
                         className="flex-1 rounded-xl bg-white px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100 hover:bg-emerald-50 transition-all dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
                       >
                          Restore
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </motion.div>
      )}

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-10 text-left shadow-2xl dark:bg-slate-900"
            >
              <div className="mb-6 h-16 w-16 rounded-[2rem] bg-rose-50 flex items-center justify-center text-rose-500 dark:bg-rose-500/10">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Delete Account?</h3>
              <p className="mt-4 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                This action is permanent for public data. While your contribution history is archived for 30 days, your current session and active presence will be immediately removed.
              </p>
              
              <div className="mt-8 flex gap-4">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 rounded-2xl bg-slate-50 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all dark:bg-slate-800 dark:text-slate-500"
                >
                  Cancel
                </button>
                <button 
                  onClick={deleteAccount}
                  disabled={loading}
                  className="flex-1 rounded-2xl bg-rose-500 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
