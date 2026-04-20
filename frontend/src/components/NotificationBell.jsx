import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const NotificationBell = () => {
  const { auth } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth?.id) {
      const q = query(
        collection(db, 'notifications'),
        where('user', '==', auth.id),
        where('read', '==', false)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setUnreadCount(snapshot.size);
      }, (err) => {
        console.error('Notification subscription error:', err);
      });

      return () => unsubscribe();
    }
  }, [auth?.id]);

  if (!auth) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => navigate('/dashboard/notifications')}
        className="group relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 bg-white text-slate-500 border border-slate-100 hover:border-brand-500/30 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 hover:shadow-md"
      >
        <Bell size={18} className={unreadCount > 0 ? 'animate-bell-ring' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-black text-white border-2 border-white shadow-xl dark:border-slate-900 ring-2 ring-brand-600/20">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default NotificationBell;
