import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, Rocket, ArrowRight, ShieldCheck, Sparkles, Coins } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProUpgradePage = () => {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const plans = [
    {
      id: '1m',
      name: 'Monthly',
      price: '1000',
      duration: 'Credits / month',
      icon: Zap,
      color: 'bg-blue-500',
      shadow: 'shadow-blue-500/20',
      features: ['List books with price', 'Pro Star Badge', 'Priority Support', 'Basic Analytics']
    },
    {
      id: '3m',
      name: 'Quarterly',
      price: '2500',
      duration: 'Credits / 3 months',
      icon: Rocket,
      color: 'bg-brand-600',
      shadow: 'shadow-brand-600/20',
      popular: true,
      features: ['List books with price', 'Pro Star Badge', 'Priority Support', 'Advanced Analytics', 'Featured Listing (1 Book)']
    },
    {
      id: '1y',
      name: 'Annual',
      price: '8000',
      duration: 'Credits / year',
      icon: Crown,
      color: 'bg-amber-500',
      shadow: 'shadow-amber-500/20',
      features: ['List books with price', 'Pro Star Badge', 'Priority Support', 'Full Analytics Suite', 'Featured Listing (3 Books)', 'Early Access to Features']
    }
  ];

  const handleUpgrade = async (plan) => {
    if (auth.creditBalance < parseInt(plan.price)) {
      alert(`Insufficient credits. You need ${plan.price} credits to upgrade.`);
      return;
    }

    setLoading(plan.id);
    try {
      const { data } = await api.post('/pro/upgrade', { type: plan.id });
      setAuth({ ...data.user, token: auth.token });
      alert('Upgrade successful! You are now a Liyamu Pro member.');
      navigate('/dashboard/my-books');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Upgrade failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-600 mb-6 dark:bg-brand-500/10 dark:text-brand-400"
        >
          <Sparkles size={14} /> Liyamu Pro
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-6">
          Unlock the Full Potential <br /> of Your <span className="text-brand-600">Author Journey</span>
        </h1>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto dark:text-slate-400">
          Join Liyamu Pro to monetize your books, get exclusive badges, and reach more readers with advanced tools.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:bg-slate-800 dark:text-slate-400">
           <Coins size={14} className="text-brand-600" /> Your Balance: {auth?.creditBalance || 0} Credits
        </div>
      </div>

      {auth?.isPro && (
        <div className="mb-12 rounded-[2.5rem] bg-emerald-50 p-8 border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6 dark:bg-emerald-500/10 dark:border-emerald-500/20">
          <div className="flex items-center gap-6 text-emerald-600">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">You are a Pro Member!</h3>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">
                Expires on: {new Date(auth.proExpiryDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/dashboard/publish')}
            className="rounded-2xl bg-emerald-600 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
          >
            Go to Publishing
          </button>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan, index) => (
          <motion.div 
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative flex flex-col rounded-[2.5rem] bg-white p-10 shadow-2xl border ${plan.popular ? 'border-brand-600 ring-4 ring-brand-50 dark:bg-slate-900/50 dark:ring-brand-900/10' : 'border-slate-50 dark:bg-slate-900 dark:border-slate-800'}`}
          >
            {plan.popular && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-600/20">
                Most Popular
              </div>
            )}
            
            <div className={`mb-8 h-12 w-12 rounded-2xl ${plan.color} flex items-center justify-center text-white shadow-xl ${plan.shadow}`}>
              <plan.icon size={24} />
            </div>
            
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-black text-slate-900 dark:text-white">{plan.price}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{plan.duration}</span>
            </div>
            
            <div className="space-y-4 mb-10 flex-1">
              {plan.features.map(feature => (
                <div key={feature} className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full ${plan.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center text-brand-600 dark:text-brand-400`}>
                    <Check size={12} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{feature}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleUpgrade(plan)}
              disabled={loading !== null || (auth?.isPro && auth?.proType === '1y')}
              className={`w-full rounded-2xl py-5 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${
                plan.popular 
                  ? 'bg-brand-600 text-white shadow-xl shadow-brand-600/30 hover:bg-brand-700' 
                  : 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700'
              } disabled:opacity-50`}
            >
              {loading === plan.id ? 'Processing...' : (auth?.isPro ? 'Upgrade Plan' : 'Get Started Now')} <ArrowRight size={14} />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 rounded-[2.5rem] bg-slate-900 p-12 text-center text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <Star size={48} className="text-amber-400 mx-auto mb-8 animate-pulse" />
        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Why upgrade to Pro?</h2>
        <p className="text-slate-400 font-medium max-w-xl mx-auto text-xs leading-relaxed mb-10 uppercase tracking-widest">
           Verified authors deserve the best. Listing books with a price is the first step to your professional writing career.
        </p>
        <div className="flex flex-wrap justify-center gap-8">
           <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
               <Star size={16} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest">Exclusive Badge</span>
           </div>
           <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
               <Zap size={16} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest">0% Commission (Tiered)</span>
           </div>
           <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-blue-400">
               <ShieldCheck size={16} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest">Encrypted Sales</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProUpgradePage;
