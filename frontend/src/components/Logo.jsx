import React from 'react';

const Logo = ({ className = "h-8 w-8 text-brand-600", showText = true }) => {
  return (
    <div className={`flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 cursor-pointer`}>
      <div className="relative group">
        <div className="absolute inset-0 bg-brand-600/20 rounded-xl blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100" />
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden">
          <video src="/logo.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-screen" />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-widest text-slate-900 uppercase leading-none block">
            Liyamu
          </span>
          <span className="text-[7px] font-black text-brand-600 uppercase tracking-[0.3em] mt-1 block">
            Digital Library
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
