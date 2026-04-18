import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageSquare, 
  Eye, 
  Share2, 
  ChevronLeft, 
  Send, 
  Clock,
  Sparkles,
  User,
  Quote,
  Bookmark
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const WorkDetailsPage = () => {
  const { id } = useParams();
  const { auth } = useAuth();
  const [work, setWork] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchWork = async () => {
    try {
      const { data } = await api.get(`/creative/${id}`);
      setWork({
        ...data,
        isLiked: auth ? data.likes?.includes(auth._id) : false,
        isBookmarked: auth ? auth.bookmarkedWorks?.includes(data._id) : false
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWork();
  }, [id, auth]);

  const toggleLike = async () => {
    if (!auth || isLiking) return;
    setIsLiking(true);
    try {
      const { data } = await api.post(`/creative/${id}/like`);
      setWork(prev => ({ ...prev, likesCount: data.likesCount, isLiked: data.isLiked }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const toggleBookmark = async () => {
    if (!auth) return;
    // Optimistic Update
    setWork(prev => ({ ...prev, isBookmarked: !prev.isBookmarked }));
    try {
      await api.post(`/users/bookmarks/${id}`);
    } catch (err) {
      console.error(err);
      // Revert if error
      setWork(prev => ({ ...prev, isBookmarked: !prev.isBookmarked }));
    }
  };

  const postComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const { data } = await api.post(`/creative/${id}/comment`, { text: commentText });
      setWork(prev => ({ ...prev, comments: data }));
      setCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Sparkles className="animate-pulse text-brand-600" size={48} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Creativity...</p>
    </div>
  );

  if (!work) return <div>Work not found.</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-8 md:space-y-12 pb-20">
      {/* Navigation */}
      <Link 
        to="/dashboard/creative" 
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-600 transition-colors"
      >
        <ChevronLeft size={16} />
        Back to Corner
      </Link>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Main Content */}
        <div className="flex-1 space-y-8">
           <motion.article 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="glass-theme rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden"
           >
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/5 blur-[100px] pointer-events-none" />

              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-[9px] font-black uppercase tracking-widest dark:bg-brand-500/10 dark:text-brand-400">
                  {work.category}
                </span>
                <div className="flex items-center gap-2 text-slate-400">
                   <Clock size={12} />
                   <span className="text-[9px] font-black uppercase tracking-widest">{new Date(work.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1] dark:text-white mb-8">
                {work.title}
              </h1>

              <div 
                className="creative-content prose prose-slate max-w-none dark:prose-invert font-serif text-lg leading-relaxed text-slate-700 dark:text-slate-300 mb-12"
                dangerouslySetInnerHTML={{ __html: work.content }}
              />

              {/* Tags */}
              {work.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-8 border-t border-slate-100 dark:border-white/5">
                   {work.tags.map(tag => (
                     <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-slate-400">#{tag}</span>
                   ))}
                </div>
              )}
           </motion.article>

           {/* Feedback Stats */}
           <div className="flex items-center justify-between px-8 py-6 glass-theme rounded-[2rem] border border-white/5 shadow-xl">
              <div className="flex items-center gap-8">
                 <button 
                   onClick={toggleLike}
                   disabled={!auth}
                   className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${work.isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                 >
                    <Heart size={20} fill={work.isLiked ? 'currentColor' : 'none'} />
                    {work.likesCount || 0} Likes
                 </button>
                 <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest">
                    <Eye size={20} />
                    {work.viewCount || 0} Views
                 </div>
              </div>
               <div className="flex items-center gap-3">
                   <button 
                     onClick={toggleBookmark}
                     title="Bookmark this work"
                     className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all active:scale-90 ${work.isBookmarked ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-600'}`}
                   >
                      <Bookmark size={18} fill={work.isBookmarked ? 'currentColor' : 'none'} />
                   </button>
                  <button title="Share" className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-brand-600 transition-colors">
                     <Share2 size={18} />
                  </button>
               </div>
           </div>

           {/* Comments Section */}
           <div className="space-y-6">
              <h3 className="flex items-center gap-3 text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white pl-4">
                 <MessageSquare size={24} className="text-brand-600" />
                 Thoughts & Feedback
                 <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 dark:bg-slate-800">{work.comments?.length || 0}</span>
              </h3>

              {auth && (
                <form onSubmit={postComment} className="glass-theme rounded-[2rem] p-6 flex gap-4 items-end shadow-xl border border-white/5">
                   <div className="flex-1">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write your feedback..."
                        className="w-full bg-slate-50 rounded-2xl border-none p-4 text-sm font-medium focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-800"
                        rows="2"
                      />
                   </div>
                   <button 
                     type="submit"
                     className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg hover:bg-brand-600 transition-all active:scale-95"
                   >
                      <Send size={18} />
                   </button>
                </form>
              )}

              <div className="space-y-4">
                 {work.comments?.map((comment, i) => (
                   <motion.div 
                     key={comment._id}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className="flex gap-4 p-6 glass-theme rounded-[2.5rem] border border-white/5 shadow-sm"
                   >
                      <div className="h-10 w-10 rounded-xl overflow-hidden border border-white/10 shrink-0">
                         {comment.user?.profilePicture ? (
                           <img src={comment.user.profilePicture.startsWith('http') ? comment.user.profilePicture : `${API_URL}${comment.user.profilePicture}`} className="h-full w-full object-cover" />
                         ) : (
                           <div className="h-full w-full bg-slate-100 flex items-center justify-center font-black dark:bg-slate-800">{comment.user?.name?.charAt(0)}</div>
                         )}
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">{comment.user?.name}</h4>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</span>
                         </div>
                         <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{comment.text}</p>
                      </div>
                   </motion.div>
                 ))}
              </div>
           </div>
        </div>

        {/* Author Sidebar */}
        <div className="w-full md:w-72 space-y-6">
           <div className="glass-theme rounded-[2.5rem] p-8 border border-white/5 shadow-xl text-center">
              <div className="mx-auto h-20 w-20 rounded-[1.5rem] overflow-hidden border-2 border-brand-500 p-1 mb-4">
                 <div className="h-full w-full rounded-xl overflow-hidden">
                    {work.author?.profilePicture ? (
                      <img src={work.author.profilePicture.startsWith('http') ? work.author.profilePicture : `${API_URL}${work.author.profilePicture}`} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-emerald-50 flex items-center justify-center font-black text-emerald-400">{work.author?.name?.charAt(0)}</div>
                    )}
                 </div>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">{work.author?.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Master Author</p>
              
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 dark:border-white/5 mb-6">
                 <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{work.author?.followersCount || 0}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Followers</p>
                 </div>
                 <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">Professional</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Status</p>
                 </div>
              </div>

              <Link 
                to={`/dashboard/authors/${work.author?._id}`}
                className="block w-full py-3 rounded-xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 transition-all"
              >
                View Profile
              </Link>
           </div>

           <div className="glass-theme rounded-[2rem] p-6 border border-white/5 shadow-xl">
              <Quote className="text-brand-500 mb-3" size={24} />
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 italic leading-relaxed">
                "Writing is the only way to explain things that can't be explained by words alone."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WorkDetailsPage;
