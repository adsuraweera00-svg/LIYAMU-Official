import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="mt-20 border-t border-slate-100 bg-white py-12 md:py-16 dark:bg-slate-900 dark:border-slate-800">
    <div className="mx-auto grid max-w-7xl gap-10 md:gap-12 px-6 grid-cols-1 md:grid-cols-4">
      <div className="col-span-1 md:col-span-2">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden shadow-lg shadow-slate-900/10 dark:shadow-brand-600/20">
             <video src="/logo.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-screen" />
          </div>
          <span className="text-xl font-black tracking-[0.2em] text-slate-900 uppercase dark:text-white">Liyamu</span>
        </Link>
        <p className="mt-6 max-w-xs text-sm leading-relaxed text-slate-500 font-medium dark:text-slate-400">
          The world's most advanced digital library platform for modern readers and independent authors. Write, publish, and grow with us.
        </p>
      </div>
      <div>
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-400">Platform</h4>
        <ul className="mt-6 space-y-4 text-sm font-bold text-slate-500 dark:text-slate-400">
          <li><Link to="/" className="hover:text-brand-600 transition-colors">Home</Link></li>
          <li><Link to="/dashboard/library" className="hover:text-brand-600 transition-colors">Library</Link></li>
          <li><Link to="/dashboard/authors" className="hover:text-brand-600 transition-colors">Authors</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-400">Connect</h4>
        <ul className="mt-6 space-y-4 text-sm font-bold text-slate-500 dark:text-slate-400">
          <li className="flex items-center gap-3">
             <span className="text-slate-400 shrink-0">Email:</span> 
             <a href="mailto:liyamu.owner@gmail.com" className="transition-colors hover:text-brand-600 truncate">liyamu.owner@gmail.com</a>
          </li>
          <li className="flex items-center gap-3">
             <span className="text-slate-400 shrink-0">Social:</span> 
             <div className="flex gap-4">
                <a href="https://www.facebook.com/liyamufb" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-brand-600">Facebook</a>
                <a href="https://whatsapp.com/channel/0029VbCfpbbFCCoWcZ9H7i3N" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-brand-600">WhatsApp</a>
             </div>
          </li>
        </ul>
      </div>
    </div>
    <div className="mx-auto max-w-7xl px-6">
      <div className="mt-16 border-t border-slate-50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 dark:border-slate-800">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">© 2026 LIYAMU HUB. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-6">
           <Link to="/privacy-policy" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-brand-600 transition-colors">Privacy Policy</Link>
           <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-brand-600 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
