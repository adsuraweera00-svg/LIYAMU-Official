import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Users, ShieldCheck, Mail, Info, ArrowRight, Sparkles, Heart, Search, HelpCircle, Shield, Zap, BarChart3, MessageSquare } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const HomePage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [latestBooks, setLatestBooks] = useState([]);
  const [latestCreative, setLatestCreative] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalAuthors, setTotalAuthors] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  const storyImages = [
    '/image (1).jpeg',
    '/image (2).jpeg',
    '/image (3).jpeg',
    '/image (4).jpeg',
    '/image (5).jpeg',
    '/image (6).jpeg',
    '/image (7).jpeg',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % storyImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const [booksRes, creativeRes, authorsRes] = await Promise.all([
          api.get('/books'),
          api.get('/creative'),
          api.get('/users/authors')
        ]);
        
        const books = booksRes.data;
        setTotalBooks(books.length);
        setLatestBooks(books.slice(0, 4)); // Show top 4 latest books
        setLatestCreative(creativeRes.data.slice(0, 3)); // Show top 3 latest creative works
        
        if (authorsRes.data && authorsRes.data.length > 0) {
          setTotalAuthors(authorsRes.data.length);
        }
        
        const booksWithRatings = books.filter(b => b.ratingCount > 0);
        if (booksWithRatings.length > 0) {
          const totalRating = booksWithRatings.reduce((sum, b) => sum + (b.ratingAverage || 0), 0);
          const avgRating = totalRating / booksWithRatings.length;
          setSatisfaction(Math.round((avgRating / 5) * 100));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchLatest();
  }, []);

  const features = [
    { title: 'Global Discovery', desc: 'Browse books with filters and search from authors worldwide.', icon: BookOpen },
    { title: 'Easy Publishing', desc: 'Publish text or PDF books as an author in minutes.', icon: Users },
    { title: 'Secure Platform', desc: 'Role-based dashboards for readers, authors, and admins.', icon: ShieldCheck },
    { title: 'Full Analytics', desc: 'Track earnings, ratings, and reader engagement.', icon: BarChart3 },
  ];

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <div className="space-y-16 sm:space-y-24 md:space-y-32 pb-20 min-h-screen transition-colors duration-500">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-24 md:pt-32">
        <div className="grid items-center gap-10 md:gap-16 md:grid-cols-2">
          <div>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-xs font-black uppercase tracking-[0.4em] text-brand-600"
            >
              Write it. Publish it.
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl xs:text-5xl font-black leading-[1.1] text-slate-900 dark:text-white md:text-7xl"
            >
              Empowering <span className="text-brand-600 block sm:inline">micro</span> authors.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 max-w-xl text-lg font-medium leading-relaxed text-slate-500 dark:text-slate-400"
            >
              Liyamu is a premium digital library where independent writers discover their audience and readers find unique, high-quality stories.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-col xs:flex-row gap-4"
            >
              <Link to="/auth" className="rounded-2xl bg-slate-900 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-slate-900/20 hover:bg-brand-600 transition-all hover:-translate-y-1 dark:bg-white dark:text-slate-900 dark:hover:bg-brand-500 dark:hover:text-white text-center">
                Start Reading
              </Link>
              <Link to="/auth" className="rounded-2xl border-2 border-slate-200 px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-900 hover:border-slate-900 transition-all dark:border-slate-800 dark:text-white dark:hover:border-slate-700 text-center">
                Publish Work
              </Link>
            </motion.div>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8 }} 
            className="relative block"
          >
            <div className="absolute -inset-4 bg-brand-600/5 rounded-[3rem] blur-3xl opacity-50 dark:bg-brand-600/10" />
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              src="/video.mp4" 
              className="relative rounded-[3rem] object-cover shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] w-full h-[300px] md:h-[500px] border border-white dark:border-slate-800" 
            />
            <motion.div 
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute bottom-4 left-4 md:-bottom-8 md:-left-8 rounded-[2rem] bg-white/80 p-6 md:p-8 backdrop-blur-xl border border-white dark:bg-slate-900/80 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-4 md:gap-6 z-20"
            >
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/30 relative overflow-hidden shrink-0">
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    rotate: { repeat: Infinity, duration: 10, ease: "linear" },
                    scale: { repeat: Infinity, duration: 4, ease: "easeInOut" }
                  }}
                  className="absolute"
                >
                  <div className="relative w-8 h-8">
                    <motion.div 
                      className="absolute top-0 left-0 w-5 h-5 bg-[#8fc33a] rounded-sm mix-blend-screen opacity-90 shadow-sm"
                    />
                    <motion.div 
                      className="absolute bottom-0 right-0 w-5 h-5 bg-[#3abbc3] rounded-sm mix-blend-screen opacity-90 shadow-sm"
                    />
                  </div>
                </motion.div>
                <Sparkles size={20} className="relative z-10 animate-pulse" />
              </div>
              <div className="pr-2">
                <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {totalBooks > 0 ? (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {totalBooks} Books
                    </motion.span>
                  ) : '... Books'}
                </div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1 dark:text-slate-400 opacity-70">Curated Daily</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Latest Publications Section */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-600">Discover</span>
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 md:text-4xl mt-2 dark:text-white">Latest Publications</h2>
          </div>
          <Link to="/auth" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-brand-600 transition-colors flex items-center gap-2 dark:text-slate-400 dark:hover:text-brand-400">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {latestBooks.map((book) => (
            <div key={book._id} className="group relative">
              <div className="aspect-[3/4] overflow-hidden rounded-[2rem] bg-slate-100 border border-slate-100 shadow-sm transition-all group-hover:shadow-xl group-hover:-translate-y-2 dark:bg-slate-800 dark:border-slate-700">
                <img 
                  src={book.coverUrl ? (book.coverUrl.startsWith('http') ? book.coverUrl : `${API_URL}${book.coverUrl}`) : 'https://via.placeholder.com/300x400?text=No+Cover'} 
                  alt={book.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center dark:bg-slate-950/60">
                   <button 
                    onClick={() => auth ? navigate(`/dashboard/library/${book._id}`) : navigate('/auth')}
                    className="rounded-xl bg-white px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-brand-600 hover:text-white transition-all shadow-xl dark:bg-slate-900 dark:text-white dark:hover:bg-brand-500"
                   >
                     Read Now
                   </button>
                </div>
              </div>
              <h3 className="mt-6 text-lg font-black text-slate-900 leading-tight truncate px-2 dark:text-white">{book.title}</h3>
              <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest px-2 dark:text-slate-500">{book.author?.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Creative Works Section */}
      <section className="mx-auto max-w-7xl px-4 pt-10">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Sparkles size={12} /> Community
            </span>
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 md:text-4xl mt-2 dark:text-white">Creative Corner</h2>
          </div>
          <Link to="/auth" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-2 dark:text-slate-400 dark:hover:text-emerald-400">
            Explore All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {latestCreative.map((work) => (
            <div key={work._id} className="group flex flex-col glass-theme rounded-[2.5rem] p-8 border border-white/20 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all hover:border-emerald-500/30">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-white/10">
                    {work.author?.profilePicture ? (
                      <img src={work.author.profilePicture.startsWith('http') ? work.author.profilePicture : `${API_URL}${work.author.profilePicture}`} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-black text-slate-400">{work.author?.name?.charAt(0)}</div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{work.author?.name}</h4>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{new Date(work.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest dark:bg-emerald-500/10 dark:text-emerald-400">
                  {work.category}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
                {work.title}
              </h3>
              <div 
                className="text-sm font-medium text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed italic mb-8 flex-1"
                dangerouslySetInnerHTML={{ __html: work.content }}
              />

              <div className="pt-6 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Heart size={16} />
                  <span className="text-xs font-black">{work.likesCount || 0}</span>
                </div>
                <button 
                  onClick={() => auth ? navigate(`/dashboard/creative/${work._id}`) : navigate('/auth')}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-[9px] font-black uppercase tracking-widest text-white hover:bg-brand-600 transition-all dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-brand-500 hover:text-white"
                >
                  Read Story
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="glass-theme py-32 border-y border-white/20 mt-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <span className="text-brand-600 font-black uppercase tracking-[0.3em] text-[10px]">The Platform</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-4 uppercase tracking-tight dark:text-white">Why Choose Liyamu?</h2>
            <p className="mt-4 text-slate-500 font-medium dark:text-slate-400">We bridge the gap between talented independent writers and readers looking for fresh perspectives.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div 
                whileHover={{ y: -8 }}
                key={i} 
                className="rounded-[2.5rem] glass-theme p-8 border border-white/20 hover:border-brand-500 transition-all"
              >
                <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-brand-600 mb-6 shadow-sm dark:bg-slate-800 dark:text-brand-400">
                   <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight dark:text-white">{feature.title}</h3>
                <p className="mt-3 text-sm text-slate-500 font-medium leading-relaxed dark:text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="mx-auto max-w-7xl px-4 py-16 scroll-mt-24">
        <div className="grid gap-16 md:grid-cols-2 items-center">
          <div className="order-2 md:order-1 relative h-[500px] w-full overflow-hidden rounded-[3rem] shadow-2xl dark:shadow-slate-900/50 border border-transparent dark:border-slate-800">
             <AnimatePresence mode="wait">
               <motion.img 
                key={currentSlide}
                src={storyImages[currentSlide]} 
                alt={`About slide ${currentSlide + 1}`} 
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 h-full w-full object-cover" 
               />
             </AnimatePresence>
             {/* Progress Indicators */}
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
               {storyImages.map((_, i) => (
                 <div 
                   key={i} 
                   className={`h-1 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-8 bg-brand-600' : 'w-2 bg-white/30'}`}
                 />
               ))}
             </div>
          </div>
          <div className="order-1 md:order-2">
            <span className="text-brand-600 font-black uppercase tracking-[0.3em] text-[10px]">Our Story</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-4 uppercase tracking-tight dark:text-white">About Liyamu</h2>
            <p className="mt-6 text-base md:text-lg text-slate-500 font-medium leading-relaxed dark:text-slate-400">
              Founded in 2026, Liyamu began with a single mission: to provide a premium space for independent authors who felt lost in the giant bookstores of the web. 
            </p>
            <p className="mt-4 text-slate-500 font-medium leading-relaxed dark:text-slate-400">
              We believe every voice deserves a professional shelf, and every reader deserves a high-fidelity reading experience. Today, we are home to a growing community of micro-authors who are building their legacy one book at a time.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-8">
               <div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    {totalAuthors > 0 ? totalAuthors : 'Join Now'}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 dark:text-slate-500">Authors Joined</p>
               </div>
               <div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">{satisfaction > 0 ? `${satisfaction}%` : '99%'}</div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 dark:text-slate-500">Satisfaction</p>
               </div>
            </div>
          </div>
        </div>
      </section>
      {/* Help Center Section */}
      <section id="help" className="mx-auto max-w-7xl px-4 py-24 scroll-mt-24">
        <div className="rounded-[4rem] bg-slate-50 p-8 md:p-20 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <span className="text-brand-600 font-black uppercase tracking-[0.3em] text-[10px]">Support & Resources</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-4 uppercase tracking-tight dark:text-white">Help Center</h2>
            <p className="mt-4 md:mt-6 text-base md:text-lg text-slate-500 font-medium leading-relaxed dark:text-slate-400">
              Find answers to common questions and learn how to make the most of Liyamu.
            </p>
            
            <div className="mt-12 relative group max-w-2xl mx-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={24} />
              <input 
                type="text" 
                placeholder="Search for topics, guides, or features..."
                className="w-full rounded-[2rem] bg-white border-2 border-transparent py-6 pl-16 pr-8 text-sm font-bold shadow-2xl shadow-slate-200/50 focus:border-brand-600 focus:outline-none transition-all dark:bg-slate-950 dark:shadow-none dark:text-white dark:border-slate-800 dark:focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
             {[
               { title: "How to publish?", desc: "Navigate to your author dashboard, select 'Publish', and follow our guided upload process.", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
               { title: "Account Security", desc: "We use role-based dashboards and state-of-the-art encryption to keep your works safe.", icon: Shield, color: "text-emerald-500", bg: "bg-emerald-50" },
               { title: "Platform Features", desc: "Discover personalized libraries, reader engagement analytics, and global discovery tools.", icon: Sparkles, color: "text-emerald-500", bg: "bg-emerald-50" },
               { title: "Creative Corner", desc: "A space for short-form content, poems, and community-driven storytelling interactions.", icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
               { title: "Reader Guidelines", desc: "Learn about how to rate books, manage your reading history, and interact with authors.", icon: BookOpen, color: "text-brand-600", bg: "bg-brand-50" },
               { title: "Support Center", desc: "Need direct assistance? Our dedicated support team is available via the contact section below.", icon: HelpCircle, color: "text-slate-900", bg: "bg-slate-100" }
             ].map((item, i) => (
               <motion.div 
                 key={i}
                 whileHover={{ y: -5 }}
                 onClick={() => item.title === "Support Center" ? navigate('/contact') : null}
                 className={`flex flex-col rounded-3xl bg-white p-8 border border-slate-100 shadow-sm transition-all hover:shadow-xl dark:bg-slate-900 dark:border-slate-800 ${item.title === "Support Center" ? "cursor-pointer" : ""}`}
               >
                 <div className={`h-14 w-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-6 dark:bg-slate-800`}>
                    <item.icon size={28} />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">{item.title}</h3>
                 <p className="text-sm font-medium text-slate-500 leading-relaxed dark:text-slate-400">{item.desc}</p>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="mx-auto max-w-5xl px-4 py-16 scroll-mt-24 text-center">
        <div className="rounded-[3rem] bg-brand-600 p-8 md:p-20 text-white shadow-2xl shadow-brand-200 dark:shadow-brand-900/20">
           <span className="text-white/60 font-black uppercase tracking-[0.3em] text-[10px]">Contact Us</span>
           <h2 className="text-3xl md:text-4xl font-black mt-4 uppercase tracking-tight text-white">Get in touch</h2>
           <p className="mt-6 text-base md:text-lg text-brand-100 font-medium">Have questions or want to partner with us? We'd love to hear from you.</p>
           <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-8">
              <a href="mailto:liyamu.owner@gmail.com" className="flex items-center gap-3 text-lg font-bold hover:text-slate-900 transition-colors">
                <Mail size={24} /> liyamu.owner@gmail.com
              </a>
              <div className="h-2 w-2 rounded-full bg-white/20 hidden md:block" />
              <a href="https://whatsapp.com/channel/0029VbCfpbbFCCoWcZ9H7i3N" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-lg font-bold hover:text-slate-900 transition-colors">
                <MessageSquare size={24} /> WhatsApp Channel
              </a>
           </div>
           <button 
             onClick={() => navigate('/contact')}
             className="mt-12 rounded-2xl bg-white px-10 py-5 text-xs font-black uppercase tracking-widest text-brand-600 hover:bg-slate-900 hover:text-white transition-all"
           >
             Send us a message
           </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
