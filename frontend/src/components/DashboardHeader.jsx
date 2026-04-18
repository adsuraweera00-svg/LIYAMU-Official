import { Search, Bell, Menu } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';

const DashboardHeader = ({ onMobileMenuOpen }) => {
  const { auth } = useAuth();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        {/* Mobile menu toggle */}
        <button 
          onClick={onMobileMenuOpen}
          className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 md:hidden dark:bg-slate-800 dark:text-slate-400"
        >
          <Menu size={20} />
        </button>

        {/* Left side: Search or Greeting */}
        <div className="hidden flex-1 md:flex">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search library, authors, or notifications..." 
              className="w-full rounded-2xl bg-slate-50 border-none py-2.5 pl-12 pr-4 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-brand-600 transition-all dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex flex-col items-end mr-2 text-right hidden xl:flex">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Welcome back,</span>
             <span className="text-xs font-black text-slate-900 dark:text-white">{auth?.name?.split(' ')[0]}</span>
          </div>
          
          <NotificationBell />
          
          <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 hidden xs:block mx-1" />
          
          <div className="flex h-9 items-center gap-2 rounded-xl bg-slate-50 pl-1.5 pr-3 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
             <div className="h-6 w-6 rounded-lg bg-emerald-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                {auth?.name?.[0]}
             </div>
             <span className="text-[9px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
               {((auth?.creditBalance || 0) + (auth?.earningsBalance || 0)).toFixed(2)}
             </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
