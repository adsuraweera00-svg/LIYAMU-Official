import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, ShieldCheck, Clock, Check, MoreVertical, MessageSquare } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const SupportPage = () => {
  const { auth } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();

  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/users/chat');
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.some(m => m.sender === 'admin' && !m.isRead)) {
      api.put('/users/chat/read');
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = newMessage;
    setNewMessage('');
    
    try {
      const { data } = await api.post('/users/chat', { message: msg });
      setMessages(prev => [...prev, data]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-5rem)] md:h-[calc(100vh-7rem)] flex flex-col space-y-6">
      <div className="flex items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-xl shadow-brand-600/20">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Admin Support</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" /> Support Online
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-6 scrollbar-hide">
        {loading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            <p className="text-[10px] font-black uppercase tracking-widest">Connecting to Support...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-10">
            <div className="h-20 w-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-300 dark:bg-slate-800 dark:text-slate-600">
               <MessageSquare size={40} />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white">Start a Conversation</h3>
              <p className="text-xs font-medium text-slate-500 max-w-xs mt-2 dark:text-slate-400">Our administrative team is here to help you with your inquiries.</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isAdmin = msg.sender === 'admin';
            return (
              <motion.div 
                key={msg._id}
                initial={{ opacity: 0, x: isAdmin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[80%] space-y-2`}>
                  <div className={`rounded-2xl px-6 py-4 text-sm font-medium shadow-sm ${
                    isAdmin 
                      ? 'bg-white text-slate-900 rounded-bl-none dark:bg-slate-800 dark:text-white' 
                      : 'bg-brand-600 text-white rounded-br-none shadow-brand-600/20'
                  }`}>
                    {msg.message}
                  </div>
                  <div className={`flex items-center gap-2 px-1 ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {!isAdmin && (
                      <Check size={10} className={msg.isRead ? 'text-brand-600' : 'text-slate-300'} />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-slate-100 shadow-2xl flex items-center gap-2 dark:bg-slate-900/50 dark:border-slate-800">
         <input 
            type="text"
            placeholder="Type your message here..."
            className="flex-1 bg-transparent border-none py-4 px-6 text-sm font-bold text-slate-900 focus:ring-0 dark:text-white dark:placeholder:text-slate-600"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
         />
         <button 
           type="submit"
           disabled={!newMessage.trim()}
           className="h-12 w-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-xl shadow-brand-600/30 hover:bg-brand-700 transition-all active:scale-90 disabled:opacity-50 disabled:grayscale"
         >
           <Send size={18} />
         </button>
      </form>
      
      <div className="px-10 py-4 text-center">
         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <Clock size={10} /> We usually respond within 24 hours
          </p>
      </div>
    </div>
  );
};

export default SupportPage;
