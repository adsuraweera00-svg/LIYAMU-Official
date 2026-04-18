import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, ShieldCheck, Clock, Check, MoreVertical, MessageSquare, Search, ChevronRight, Bell } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const AdminChatPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/chat');
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const { data } = await api.get(`/admin/chat/${userId}`);
      setMessages(data);
      api.put(`/admin/chat/read/${userId}`);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 10000); // Refresh list every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
      const interval = setInterval(() => fetchMessages(selectedUser._id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const msg = newMessage;
    setNewMessage('');
    
    try {
      const { data } = await api.post('/admin/chat', { 
        message: msg, 
        recipientId: selectedUser._id 
      });
      setMessages(prev => [...prev, data]);
    } catch (err) {
      console.error(err);
    }
  };

  const [mobileView, setMobileView] = useState('list'); // 'list' or 'chat'

  useEffect(() => {
    if (selectedUser) {
      setMobileView('chat');
    }
  }, [selectedUser]);

  const handleBack = () => {
    setSelectedUser(null);
    setMobileView('list');
  };

  return (
    <div className="grid lg:grid-cols-[300px_1fr] h-[calc(100vh-5rem)] md:h-[calc(100vh-7rem)] gap-4 transition-all duration-500">
      {/* User Sidebar */}
      <div className={`
        ${mobileView === 'chat' ? 'hidden' : 'flex'} 
        lg:flex flex-col bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800
      `}>
        <div className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-800">
           <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
             <MessageSquare size={16} /> Discussions
           </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
           {users.map(user => (
             <button 
               key={user._id}
               onClick={() => setSelectedUser(user)}
               className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                 selectedUser?._id === user._id 
                   ? 'bg-slate-900 text-white shadow-xl dark:bg-brand-600' 
                   : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400'
               }`}
             >
               <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black dark:bg-slate-800 shrink-0">
                 {user.name.charAt(0)}
               </div>
               <div className="text-left overflow-hidden">
                 <h4 className="text-xs font-bold truncate">{user.name}</h4>
                 <p className="text-[10px] font-medium opacity-60 truncate capitalize">{user.role?.replace('_', ' ')}</p>
               </div>
               <ChevronRight size={14} className="ml-auto opacity-40" />
             </button>
           ))}
           {users.length === 0 && !loading && (
             <div className="text-center py-10 opacity-30">
                <MessageSquare className="mx-auto mb-2" size={32} />
                <p className="text-[9px] font-black uppercase">No Active Chats</p>
             </div>
           )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`
        ${mobileView === 'list' ? 'hidden' : 'flex'} 
        lg:flex flex-col bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800
      `}>
        {selectedUser ? (
          <>
            <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between dark:border-slate-800">
               <div className="flex items-center gap-3">
                  <button 
                    onClick={handleBack}
                    className="lg:hidden h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                  >
                    <ChevronRight size={20} className="rotate-180" />
                  </button>
                  <div className="h-10 w-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black shadow-lg shadow-brand-600/20">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{selectedUser.name}</h4>
                    <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-widest">Live Conversation</p>
                  </div>
               </div>
               <button className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
                 <Bell size={16} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6 md:py-8 space-y-6 scrollbar-hide">
              {messages.map((msg, index) => {
                const isAdmin = msg.sender === 'admin';
                return (
                  <motion.div 
                    key={msg._id}
                    initial={{ opacity: 0, x: isAdmin ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] md:max-w-[70%] space-y-2`}>
                      <div className={`rounded-2xl md:rounded-3xl px-5 py-3 md:px-6 md:py-4 text-xs font-medium leading-relaxed shadow-sm ${
                        isAdmin 
                          ? 'bg-slate-950 text-white rounded-br-none shadow-xl dark:bg-brand-600 shadow-brand-600/10' 
                          : 'bg-slate-50 text-slate-900 rounded-bl-none dark:bg-slate-800 dark:text-white'
                      }`}>
                        {msg.message}
                      </div>
                      <div className={`flex items-center gap-2 px-1 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[9px] font-medium text-slate-400">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 md:p-6 bg-slate-50/50 flex items-center gap-4 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
               <input 
                  type="text"
                  placeholder="Type message..."
                  className="flex-1 bg-white rounded-2xl py-3.5 px-6 text-sm font-medium border border-slate-100 text-slate-900 focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
               />
               <button 
                 type="submit"
                 disabled={!newMessage.trim()}
                 className="h-12 w-12 md:w-28 rounded-2xl bg-brand-600 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-600/30 hover:bg-brand-700 transition-all active:scale-95 disabled:opacity-50"
               >
                 <span className="hidden md:block">Send</span> <Send size={14} />
               </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-6">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-[2.5rem] md:rounded-[3rem] bg-slate-50 flex items-center justify-center text-slate-300 dark:bg-slate-800 dark:text-slate-700">
               <ShieldCheck size={40} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Admin Support</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed mt-2 opacity-60">Select a discussion from the list to start provided live support to our users.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatPage;
