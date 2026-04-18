import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  PenTool, 
  Heart, 
  Search,
  UserPlus,
  UserMinus,
  Globe,
  Plus
} from 'lucide-react';
import api from '../../api/client';
import { getRoleBadge } from '../../utils/badges';
import { useAuth } from '../../context/AuthContext';

const AuthorsPage = () => {
  const { auth } = useAuth();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [followingIds, setFollowingIds] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/authors');
      setAuthors(data);
      
      // Separately fetch me if auth is likely present
      if (auth) {
        try {
          const meRes = await api.get('/auth/me');
          setFollowingIds(meRes.data.following || []);
        } catch (meErr) {
          console.error('Guest or session expired');
        }
      }
    } catch (err) {
      console.error('Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleFollow = async (authorId) => {
    const isFollowing = followingIds.includes(authorId);
    
    // Optimistic Update
    setFollowingIds(prev => isFollowing 
      ? prev.filter(id => id !== authorId) 
      : [...prev, authorId]
    );

    try {
      const { data } = await api.post(`/users/follow/${authorId}`);
      // Sync actual count if needed
      setAuthors(prev => prev.map(a => 
        a._id === authorId ? { ...a, followersCount: data.followersCount } : a
      ));
    } catch (err) {
      // Revert on error
      setFollowingIds(prev => isFollowing 
        ? [...prev, authorId] 
        : prev.filter(id => id !== authorId)
      );
    }
  };

  const isAuthor = ['author', 'verified_author', 'pro_writer'].includes(auth?.role);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const filteredAuthors = authors.filter(author => {
    return author.name.toLowerCase().includes(search.toLowerCase());
  });

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

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
       <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      {/* Header & Search Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">Verified Authors</h1>
          <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-[9px] md:text-[10px] dark:text-slate-400">Connect with {authors.length} recognized literary voices</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="w-full rounded-[1.5rem] border-none bg-white pl-12 pr-4 py-3 md:py-4 shadow-xl shadow-slate-200/20 focus:ring-2 focus:ring-brand-500 transition-all font-bold text-[10px] md:text-xs dark:bg-slate-900 dark:text-white dark:shadow-none" 
              placeholder="Search Authors..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* Recruitment Banner for Readers */}
      {!isAuthor && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-brand-600 p-8 md:p-12 text-white shadow-2xl shadow-brand-600/20"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none">Are you a Writer?</h2>
              <p className="mt-3 text-sm md:text-lg font-medium text-brand-100 max-w-xl">
                Join our community of verified authors and share your stories with thousands of readers worldwide.
              </p>
            </div>
            <Link 
              to="/dashboard/verification"
              className="group flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-brand-600 shadow-xl transition-all hover:-translate-y-1 hover:bg-brand-50 active:scale-95 whitespace-nowrap"
            >
              Apply to be an Author
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Plus size={16} />
              </motion.div>
            </Link>
          </div>
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-brand-400/20 blur-3xl pointer-events-none" />
        </motion.div>
      )}

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {filteredAuthors.map((author) => {
          const badge = getRoleBadge(author.role);
          const isFollowing = followingIds.includes(author._id);
          const isMe = auth?._id === author._id;

          return (
            <motion.div 
               key={author._id}
               variants={item}
               className="group relative flex flex-col rounded-3xl md:rounded-[2.5rem] bg-white p-6 md:p-8 shadow-xl shadow-slate-200/20 hover:shadow-2xl transition-all duration-500 border border-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none hover:border-brand-500/20"
            >
               {/* Avatar Section */}
                <div className="relative mb-6 self-center">
                   <div className="h-24 w-24 md:h-28 md:w-28 overflow-hidden rounded-3xl md:rounded-[2rem] bg-slate-100 shadow-xl dark:bg-slate-800">
                      {author.profilePicture ? (
                        <img 
                         src={author.profilePicture.startsWith('http') ? author.profilePicture : `${API_URL}${author.profilePicture}`} 
                         alt="" 
                         className="h-full w-full object-cover" 
                        />
                      ) : (
                       <div className="flex h-full w-full items-center justify-center text-3xl font-black text-brand-600 bg-brand-50 dark:bg-brand-500/10 uppercase">
                          {author.name[0]}
                       </div>
                     )}
                  </div>
                  <div className={`absolute -bottom-2 -right-2 h-8 w-8 md:h-10 md:w-10 rounded-xl md:rounded-2xl ${badge.color} flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900`}>
                     <badge.icon size={16} className="md:h-[18px] md:w-[18px]" />
                  </div>
               </div>

               {/* Info */}
               <div className="text-center mb-8 flex-1">
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white truncate">{author.name}</h3>
                  <span className={`mt-2 inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${badge.color}`}>
                     {badge.label}
                  </span>
                  <p className="mt-4 text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed dark:text-slate-400">
                     {author.bio || `Creative mind shaping stories on Liyamu since ${new Date(author.createdAt).getFullYear()}.`}
                  </p>
               </div>

               {/* Stats Row */}
               <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                     <span className="text-[10px] font-black text-slate-900 dark:text-white">{author.bookCount || 0}</span>
                     <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Works</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                     <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{author.followersCount || 0}</span>
                     <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Followers</span>
                  </div>
               </div>

               {/* CTA */}
               <div className="flex flex-col gap-3">
                  {!isMe && (
                    <button 
                      onClick={() => handleFollow(author._id)}
                      className={`
                         w-full flex items-center justify-center gap-3 rounded-2xl px-6 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all
                         ${isFollowing 
                           ? 'bg-slate-900 text-white dark:bg-slate-800' 
                           : 'bg-brand-600 text-white shadow-xl shadow-brand-600/20 hover:bg-brand-500 hover:-translate-y-1 active:scale-95'}
                      `}
                    >
                       {isFollowing ? (
                         <> <UserMinus size={14} /> Unfollow </>
                       ) : (
                         <> <UserPlus size={14} /> Follow </>
                       ) }
                    </button>
                  )}
                  <Link 
                    to={`/dashboard/authors/${author._id}`}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl bg-slate-50 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all dark:bg-slate-800 dark:text-slate-300"
                  >
                     View Profile
                  </Link>
               </div>
            </motion.div>
          );
        })}
      </motion.div>

      {filteredAuthors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 md:py-20 text-center">
          <Globe size={40} className="md:h-12 md:w-12 text-slate-100 mb-6 dark:text-slate-800" />
          <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Author not found</h3>
          <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 mt-2 dark:text-slate-500">Try a different name or role filter</p>
        </div>
      )}
    </div>
  );
};

export default AuthorsPage;
