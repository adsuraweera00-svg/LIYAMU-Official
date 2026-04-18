import { BookOpen, Heart, PenTool, BadgeCheck, Award, ShieldCheck, Star } from 'lucide-react';

export const getRoleBadge = (role) => {
  const mapping = {
    reader: {
      label: 'Standard Reader',
      icon: BookOpen,
      color: 'bg-slate-50 text-slate-500',
      badgeColor: 'text-slate-400'
    },
    beginner_reader: {
      label: 'Beginner Reader',
      icon: BookOpen,
      color: 'bg-slate-100 text-slate-600',
      badgeColor: 'text-slate-400'
    },
    pro_reader: {
      label: 'Pro Reader',
      icon: Heart,
      color: 'bg-rose-50 text-rose-600',
      badgeColor: 'text-rose-400'
    },
    author: {
      label: 'Author',
      icon: PenTool,
      color: 'bg-emerald-50 text-emerald-600',
      badgeColor: 'text-emerald-400'
    },
    verified_author: {
      label: 'Verified Author',
      icon: BadgeCheck,
      color: 'bg-amber-50 text-amber-600',
      badgeColor: 'text-amber-500'
    },
    pro_writer: {
      label: 'Pro Writer',
      icon: Award,
      color: 'bg-emerald-50 text-emerald-600',
      badgeColor: 'text-emerald-500'
    },
    admin: {
      label: 'Administrator',
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-600',
      badgeColor: 'text-emerald-500'
    }
  };

  return mapping[role] || mapping.beginner_reader;
};

export const ProBadge = ({ isPro, size = 12, className = "fill-amber-400 text-amber-500" }) => {
  if (!isPro) return null;
  return (
    <div className="group relative inline-flex items-center">
      <Star size={size} className={`${className} transition-transform hover:scale-125`} />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 scale-0 rounded bg-slate-900 px-2 py-1 text-[10px] font-black uppercase text-white transition-all group-hover:scale-100 whitespace-nowrap">
        Liyamu Pro
      </span>
    </div>
  );
};
