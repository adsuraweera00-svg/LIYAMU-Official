import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const messages = [
  "Initializing Secure Protocol...",
  "Synchronizing Global Archives...",
  "Authenticating Identity...",
  "Optimizing Visual Experience...",
  "Preparing Your Library..."
];

const quotes = [
  "“A room without books is like a body without a soul.” — Marcus Tullius Cicero",
  "“Books are a uniquely portable magic.” — Stephen King",
  "“So many books, so little time.” — Frank Zappa",
  "“There is no friend as loyal as a book.” — Ernest Hemingway",
  "“Read anywhere. Read everywhere.” — Liyamu Team"
];

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Session-based check
    const hasVisited = sessionStorage.getItem('liyamu_session_boot');
    if (hasVisited) {
      onComplete();
      return;
    }
    sessionStorage.setItem('liyamu_session_boot', 'true');

    const duration = 2500; 
    const intervalTime = 50;
    const increment = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const idx = Math.min(Math.floor((progress / 100) * messages.length), messages.length - 1);
    setMessageIndex(idx);
  }, [progress]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <motion.div 
            animate={{ 
               scale: [1, 1.2, 1],
               opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-1/4 -right-1/4 h-[100%] w-[100%] rounded-full bg-brand-600/20 blur-[120px]"
         />
         <motion.div 
            animate={{ 
               scale: [1.2, 1, 1.2],
               opacity: [0.05, 0.1, 0.05]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -bottom-1/4 -left-1/4 h-[100%] w-[100%] rounded-full bg-emerald-600/10 blur-[120px]"
         />
      </div>

      <div className="relative z-10 w-full max-w-sm px-10 text-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-16"
        >
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2.5rem] overflow-hidden bg-brand-600/20 shadow-[0_20px_50px_rgba(79,70,229,0.4)] relative">
             <div className="absolute inset-0 rounded-[2.5rem] bg-white animate-pulse opacity-5 z-0" />
             <video src="/logo.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover mix-blend-screen z-10" />
          </div>
          <h1 className="text-3xl font-black tracking-widest text-white uppercase italic">Liyamu</h1>
          <p className="mt-2 text-slate-500 uppercase tracking-[0.4em] text-[8px] font-black">Digital Sovereignty / Library Hub</p>
        </motion.div>

        {/* Progress Section */}
        <div className="mb-12 relative">
          <div className="flex justify-between mb-4 text-[9px] font-black uppercase tracking-[0.2em]">
            <AnimatePresence mode="wait">
               <motion.span 
                  key={messageIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="text-brand-400"
               >
                  {messages[messageIndex]}
               </motion.span>
            </AnimatePresence>
            <span className="text-slate-500">{Math.round(progress)}%</span>
          </div>
          
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-600 to-emerald-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.2 }}
            />
          </div>
        </div>

        {/* Quote */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-xs mx-auto opacity-40 hover:opacity-100 transition-opacity"
        >
          {quotes[4]}
        </motion.p>
      </div>

      {/* Version Tag */}
      <div className="absolute bottom-10 left-0 right-0 text-center">
         <span className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-700">Enterprise Edition v2.0.4 - Premium Access</span>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
