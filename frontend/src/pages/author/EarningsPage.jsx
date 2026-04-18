import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Activity, 
  ArrowUpRight, 
  Download,
  AlertCircle,
  CheckCircle2,
  Coins
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const EarningsPage = () => {
  const { auth } = useAuth();
  const [data, setData] = useState({ balance: 0, total: 0, purchases: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { 
    api.get('/earnings')
      .then((res) => setData(res.data))
      .finally(() => setIsLoading(false)); 
  }, []);

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

  // Default to zeroed trends if no purchases exist
  const trendPoints = data.purchases.length > 0 
    ? data.purchases.slice(0, 7).map(p => p.authorEarnings)
    : [0, 0, 0, 0, 0, 0, 0];

  if (isLoading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
    </div>
  );

  const totalBalance = (auth?.creditBalance || 0) + (auth?.earningsBalance || 0);

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-20"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Earnings Desk</h1>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400">Track and manage your professional revenue</p>
         </div>
         <button className="flex w-full md:w-auto items-center justify-center gap-3 rounded-2xl bg-brand-600 px-6 py-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-brand-600/20 hover:bg-brand-500 transition-all">
            <Coins size={18} />
            Wallet Details
         </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Stats */}
        <motion.div 
           variants={item}
           className="lg:col-span-1 space-y-6"
        >
           <div className="rounded-3xl md:rounded-[2.5rem] bg-white p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/20 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                 <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-500/10">
                    <DollarSign size={20} />
                 </div>
                 <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Combined Balance</h4>
              </div>
              <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white break-all">
                {totalBalance.toFixed(2)} Credits
              </p>
              <div className="mt-4 md:mt-6 flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-500">
                 <CheckCircle2 size={14} />
                 Available in wallet
              </div>
           </div>

           <div className="rounded-3xl md:rounded-[2.5rem] bg-slate-900 p-6 md:p-8 text-white shadow-2xl shadow-slate-900/20">
              <div className="flex items-center gap-3 mb-4 text-brand-400">
                 <TrendingUp size={20} className="shrink-0" />
                 <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60">Lifetime Earnings</h4>
              </div>
              <p className="text-3xl md:text-4xl font-black break-all">{data.total?.toFixed(2) || '0.00'} Credits</p>
              <div className="mt-4 md:mt-6 p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                 <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                 <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60">Verified Revenue</p>
              </div>
           </div>
        </motion.div>

        {/* Visual Trends */}
        <motion.div 
           variants={item}
           className="lg:col-span-2 rounded-3xl md:rounded-[2.5rem] bg-white p-6 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/20 dark:bg-slate-900 dark:border-slate-800 relative overflow-hidden"
        >
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 shrink-0 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center dark:bg-brand-500/10">
                    <Activity size={20} />
                 </div>
                 <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Revenue Trends</h3>
              </div>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Last 7 Transactions</p>
           </div>

           {/* Simple SVG Chart */}
           <div className="relative h-48 w-full">
              <svg className="h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                 <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                       <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                 </defs>
                 <path 
                    d={`M 0 40 L ${trendPoints.map((p, i) => `${(i / (trendPoints.length - 1)) * 100} ${40 - (p / Math.max(...trendPoints)) * 30}`).join(' L ')} L 100 40 Z`}
                    fill="url(#trendGradient)"
                 />
                 <path 
                    d={`M ${trendPoints.map((p, i) => `${(i / (trendPoints.length - 1)) * 100} ${40 - (p / Math.max(...trendPoints)) * 30}`).join(' L ')}`}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                 />
              </svg>
              
              <div className="absolute inset-0 flex items-center justify-between pointer-events-none opacity-20">
                 {[...Array(6)].map((_, i) => <div key={i} className="h-full w-px border-r border-dashed border-slate-300 dark:border-slate-700" />)}
              </div>
           </div>
           
           <div className="mt-8 grid grid-cols-7 text-[8px] font-black uppercase tracking-widest text-slate-400 text-center">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => <span key={day}>{day}</span>)}
           </div>
        </motion.div>
      </div>

      {/* History Table */}
      <motion.div 
         variants={item}
         className="rounded-3xl md:rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 dark:bg-slate-900 dark:border-slate-800 overflow-hidden"
      >
         <div className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Transaction History</h3>
            <button className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-brand-600 flex items-center gap-2 hover:opacity-70">
               <Download size={14} /> Export CSV
            </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap modern-table">
               <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <th className="px-5 py-4 md:px-8 md:py-6">Date</th>
                     <th className="px-5 py-4 md:px-8 md:py-6">Item / Work</th>
                     <th className="px-5 py-4 md:px-8 md:py-6">Sold Price</th>
                     <th className="px-5 py-4 md:px-8 md:py-6">Network Fee</th>
                     <th className="px-5 py-4 md:px-8 md:py-6 text-right">Net Earning</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {data.purchases.length > 0 ? data.purchases.map((item) => (
                    <tr key={item._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                       <td className="px-5 py-5 md:px-8 md:py-6 text-[10px] md:text-xs font-bold text-slate-500" data-label="Date">
                          {new Date(item.createdAt).toLocaleDateString()}
                       </td>
                       <td className="px-5 py-5 md:px-8 md:py-6" data-label="Item / Work">
                          <p className="text-xs md:text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white max-w-[150px] md:max-w-xs truncate">{item.book?.title}</p>
                          <p className="text-[9px] md:text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Digital Publication</p>
                       </td>
                       <td className="px-5 py-5 md:px-8 md:py-6 text-[10px] md:text-sm font-black text-slate-700 dark:text-slate-300" data-label="Sold Price">
                          {item.soldPrice} Credits
                       </td>
                       <td className="px-5 py-5 md:px-8 md:py-6 text-[10px] md:text-xs font-bold text-rose-500" data-label="Network Fee">
                          -{item.websiteTax} Credits
                       </td>
                       <td className="px-5 py-5 md:px-8 md:py-6 text-right" data-label="Net Earning">
                          <span className="inline-block rounded-xl bg-emerald-50 px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-sm font-black text-emerald-600 dark:bg-emerald-500/10">
                             +{item.authorEarnings?.toFixed(2)} Credits
                          </span>
                       </td>
                    </tr>
                  )) : (
                    <tr>
                       <td colSpan="5" className="p-0 border-none">
                          <div className="w-full flex flex-col items-center px-5 py-16 md:px-8 md:py-20 text-center opacity-30 whitespace-normal">
                             <AlertCircle size={40} className="mb-4 md:h-12 md:w-12" />
                             <p className="text-[10px] md:text-sm font-black uppercase tracking-widest">No transactions found</p>
                          </div>
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </motion.div>
    </motion.div>
  );
};

export default EarningsPage;
