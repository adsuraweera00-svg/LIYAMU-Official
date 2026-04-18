import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User, Bot, HelpCircle, Book, Shield } from 'lucide-react';

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your Liyamu assistant. How can I help you today?", sender: 'bot', time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const responses = {
    'hello': "Hi there! I'm here to help you navigate Liyamu. Do you have questions about reading, authoring, or your account?",
    'hi': "Hi there! I'm here to help you navigate Liyamu. Do you have questions about reading, authoring, or your account?",
    'author': "Becoming an author is easy! Just head to your profile settings and apply for Author verification. You'll then be able to publish your own digital books.",
    'publish': "To publish a book, go to Dashboard > Publish. You'll need to provide a title, category, price, and upload your PDF and cover image.",
    'account': "You can manage your account details, privacy settings, and appearance through the Dashboard > Profile page.",
    'privacy': "We take your privacy seriously. You can view our full Privacy Policy in the footer of any page.",
    'help': "I can help with: \n1. Account setup\n2. Book publishing\n3. Reading library\n4. Verified Author status\n\nNeed to [Talk to a Human?](/dashboard/support)",
    'default': "I'm not sure I understand. Could you try rephrasing that? You can also ask for 'help' to see what I can do, or visit our [Human Support Page](/dashboard/support)."
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input, sender: 'user', time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      let botText = responses.default;
      
      for (const key in responses) {
        if (lowerInput.includes(key)) {
          botText = responses[key];
          break;
        }
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, text: botText, sender: 'bot', time: new Date() }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[200]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-80 md:w-96 overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl dark:bg-slate-800 dark:border-slate-700"
          >
            {/* Header */}
            <div className="bg-brand-600 p-6 text-white flex justify-between items-center bg-gradient-to-br from-brand-600 to-brand-700">
               <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
                     <Bot size={20} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-100">AI Assistant</h3>
                    <p className="text-sm font-black uppercase tracking-tight">Liyamu Support</p>
                  </div>
               </div>
               <button onClick={() => setIsOpen(false)} className="rounded-xl bg-white/10 p-2 hover:bg-white/20 transition-all">
                  <X size={18} />
               </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="h-96 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/50"
            >
               {messages.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] rounded-2xl p-4 text-xs font-medium leading-relaxed ${
                     msg.sender === 'user' 
                     ? 'bg-brand-600 text-white rounded-tr-none' 
                     : 'bg-white text-slate-600 shadow-sm border border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-tl-none'
                   }`}>
                     {msg.text.split('\n').map((line, i) => (
                       <p key={i}>{line}</p>
                     ))}
                   </div>
                 </div>
               ))}
               {isTyping && (
                 <div className="flex justify-start">
                   <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                   </div>
                 </div>
               )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
               <div className="relative flex items-center">
                  <input 
                    className="w-full rounded-2xl bg-slate-50 px-5 py-4 pr-14 text-xs font-black uppercase tracking-widest text-slate-900 border-none focus:ring-2 focus:ring-brand-600 dark:bg-slate-900 dark:text-white"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <button 
                    onClick={handleSend}
                    className="absolute right-2 h-10 w-10 flex items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/20"
                  >
                    <Send size={16} />
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button 
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-16 w-16 items-center justify-center rounded-[2rem] shadow-2xl transition-all duration-500 ${
          isOpen ? 'bg-slate-900 scale-90' : 'bg-brand-600 shadow-brand-600/30'
        }`}
      >
        {isOpen ? (
          <X className="text-white" size={24} strokeWidth={3} />
        ) : (
          <MessageCircle className="text-white" size={24} strokeWidth={3} />
        )}
      </motion.button>
    </div>
  );
};

export default SupportChat;
