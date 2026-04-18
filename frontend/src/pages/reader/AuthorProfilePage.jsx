import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  Sparkles, 
  Heart, 
  MapPin, 
  Globe, 
  Mail, 
  Phone,
  ChevronLeft,
  UserPlus,
  UserMinus,
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
  Quote,
  Clock,
  ExternalLink,
  ShieldCheck,
  Star
} from 'lucide-react';
import api from '../../api/client';
import { getRoleBadge } from '../../utils/badges';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AuthorProfilePage = () => {
  const { id } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState([]);
  const [activeTab, setActiveTab] = useState('books');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/${id}`);
      setAuthor(data);
      
      if (auth) {
        const meRes = await api.get('/auth/me');
        setFollowingIds(meRes.data.following || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile');
      navigate('/dashboard/authors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, auth]);

  const handleFollow = async () => {
    if (!auth) return toast.error('Please login to follow authors');
    const isFollowing = followingIds.includes(author._id);
    
    setFollowingIds(prev => isFollowing 
      ? prev.filter(fid => fid !== author._id) 
      : [...prev, author._id]
    );

    try {
      const { data } = await api.post(`/users/follow/${author._id}`);
      setAuthor(prev => ({ ...prev, followersCount: data.followersCount }));
      toast.success(isFollowing ? `Unfollowed ${author.name}` : `Following ${author.name}`);
    } catch (err) {
      setFollowingIds(prev => isFollowing ? [...prev, author._id] : prev.filter(fid => fid !== author._id));
      toast.error('Connection error');
    }
  };

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Summoning profile...</p>
    </div>
  );

  if (!author) return null;

  const badge = getRoleBadge(author.role);
  const isFollowing = followingIds.includes(author._id);
  const isMe = auth?._id === author._id;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 md:space-y-12 pb-20">
      {/* Navigation */}
      <Link 
        to="/dashboard/authors" 
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-600 transition-colors"
      >
        <ChevronLeft size={16} />
        Back to Authors
      </Link>

      {/* Header Profile Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[3rem] glass-theme border border-white/5 shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-32 md:h-48 bg-slate-900" />
        <div className="relative p-8 pt-20 md:p-12 md:pt-28 flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-12 text-center md:text-left">
           <div className="relative group">
              <div className={`h-40 w-40 md:h-52 md:w-52 rounded-[3.5rem] border-8 border-white dark:border-slate-900 ${badge.color} flex items-center justify-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] group-hover:scale-[1.02] transition-transform duration-500 overflow-hidden`}>
                 {author.profilePicture ? (
                   <img src={author.profilePicture.startsWith('http') ? author.profilePicture : `${API_URL}${author.profilePicture}`} alt="" className="h-full w-full object-cover" />
                 ) : (
                   <badge.icon size={80} className={badge.badgeColor} />
                 )}
              </div>
              <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-2xl bg-brand-600 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-xl">
                 <ShieldCheck size={24} className="text-white" />
              </div>
           </div>

           <div className="flex-1 space-y-4">
              <div className="space-y-2">
                 <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">{author.name}</h1>
                 <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">{author.role.replace('_', ' ')}</p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                 <span className={`rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${badge.color}`}>
                    {badge.label}
                 </span>
                 <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Joined {new Date(author.createdAt).getFullYear()}</span>
                 </div>
              </div>

              {!isMe && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                   <button 
                     onClick={handleFollow}
                     className={`
                       flex items-center gap-3 rounded-2xl px-10 py-4 text-xs font-black uppercase tracking-widest transition-all shadow-xl
                       ${isFollowing 
                         ? 'bg-slate-900 text-white dark:bg-slate-800' 
                         : 'bg-brand-600 text-white shadow-brand-600/20 hover:bg-brand-500 hover:-translate-y-1 active:scale-95'}
                     `}
                   >
                      {isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />}
                      {isFollowing ? 'Following' : 'Follow Author'}
                   </button>
                </div>
              )}
           </div>

           <div className="grid grid-cols-2 gap-8 px-10 py-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/10 border border-slate-100 dark:border-white/5">
              <div className="text-center">
                 <p className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{author.books?.length || 0}</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Publications</p>
              </div>
              <div className="text-center">
                 <p className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{author.followersCount || 0}</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Followers</p>
              </div>
           </div>
        </div>

        {/* Bio Section */}
        <div className="px-8 md:px-12 py-10 md:py-16 border-t border-slate-50 dark:border-white/5 bg-slate-50/30 dark:bg-slate-900/40">
           <div className="max-w-4xl mx-auto text-center">
              <Quote className="mx-auto text-brand-500 mb-6 opacity-40" size={40} />
              <p className="text-lg md:text-2xl font-bold text-slate-700 dark:text-slate-300 leading-relaxed font-serif italic">
                 {author.bio || "This author preferes to let their works speak for themselves. Dive into their stories below to discover their unique voice."}
              </p>
              
              <div className="flex items-center justify-center gap-6 mt-10">
                 {author.socialLinks?.facebook && <a href={author.socialLinks.facebook} className="text-slate-400 hover:text-blue-600 transition-colors"><Facebook size={24} /></a>}
                 {author.socialLinks?.twitter && <a href={author.socialLinks.twitter} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Twitter size={24} /></a>}
                 {author.socialLinks?.instagram && <a href={author.socialLinks.instagram} className="text-slate-400 hover:text-rose-600 transition-colors"><Instagram size={24} /></a>}
                 {author.socialLinks?.website && <a href={author.socialLinks.website} className="text-slate-400 hover:text-brand-600 transition-colors"><Globe size={24} /></a>}
              </div>
           </div>
        </div>
      </motion.section>

      {/* Content Tabs */}
      <section className="space-y-10">
         <div className="flex items-center justify-center gap-10 border-b border-slate-100 dark:border-white/5">
            {[
              { id: 'books', label: 'Published Books', icon: BookOpen, count: author.books?.length || 0 },
              { id: 'creative', label: 'Creative Corner', icon: Sparkles, count: author.creativeWorks?.length || 0 }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 pb-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
              >
                <tab.icon size={16} />
                {tab.label}
                <span className="ml-1 opacity-40">({tab.count})</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="tabline" className="absolute bottom-0 left-0 h-1 w-full bg-brand-600 rounded-full" />
                )}
              </button>
            ))}
         </div>

         <AnimatePresence mode="wait">
            {activeTab === 'books' ? (
              <motion.div 
                key="books"
                variants={container}
                initial="hidden" animate="show"
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                 {author.books?.length > 0 ? author.books.map((book) => (
                   <motion.div key={book._id} variants={item} className="group relative overflow-hidden rounded-[2.5rem] glass-theme border border-white/5 p-6 hover:shadow-2xl transition-all">
                      <div className="flex gap-6">
                         <div className="h-40 w-28 shrink-0 overflow-hidden rounded-2xl shadow-xl group-hover:scale-105 transition-transform duration-500">
                            {book.coverUrl ? (
                              <img src={book.coverUrl.startsWith('http') ? book.coverUrl : `${API_URL}${book.coverUrl}`} className="h-full w-full object-cover" alt="" />
                            ) : (
                              <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-300 dark:bg-slate-800"><BookOpen size={30} /></div>
                            )}
                         </div>
                         <div className="flex flex-col justify-between py-2">
                            <div>
                               <h4 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white line-clamp-2">{book.title}</h4>
                               <div className="mt-4 flex items-center gap-2">
                                  <Star size={14} className="text-amber-500 fill-amber-500" />
                                  <span className="text-[10px] font-black text-slate-900 dark:text-white">{book.rating?.toFixed(1) || '0.0'}</span>
                               </div>
                            </div>
                            <Link 
                              to={`/dashboard/library/${book._id}`}
                              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 hover:text-brand-500"
                            >
                               Read Now <ChevronLeft size={14} className="rotate-180" />
                            </Link>
                         </div>
                      </div>
                   </motion.div>
                 )) : (
                   <div className="col-span-full py-20 text-center text-slate-400">
                      <BookOpen size={48} className="mx-auto mb-4 opacity-10" />
                      <p className="text-xs font-black uppercase tracking-widest">No public books yet</p>
                   </div>
                 )}
              </motion.div>
            ) : (
              <motion.div 
                key="creative"
                variants={container}
                initial="hidden" animate="show"
                className="grid gap-6 md:grid-cols-2"
              >
                 {author.creativeWorks?.length > 0 ? author.creativeWorks.map((work) => (
                   <motion.div key={work._id} variants={item} className="group rounded-[2rem] glass-theme p-8 border border-white/5 hover:shadow-2xl transition-all">
                      <div className="flex items-center justify-between mb-4">
                         <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest dark:bg-emerald-500/10 dark:text-emerald-400">
                            {work.category}
                         </span>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Clock size={12} /> {new Date(work.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">{work.title}</h4>
                      <Link 
                        to={`/dashboard/creative/${work._id}`}
                        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-brand-600"
                      >
                         Read Full Piece <ExternalLink size={12} />
                      </Link>
                   </motion.div>
                 )) : (
                   <div className="col-span-full py-20 text-center text-slate-400">
                      <Sparkles size={48} className="mx-auto mb-4 opacity-10" />
                      <p className="text-xs font-black uppercase tracking-widest">No creative pieces yet</p>
                   </div>
                 )}
              </motion.div>
            )}
         </AnimatePresence>
      </section>
    </div>
  );
};

export default AuthorProfilePage;
