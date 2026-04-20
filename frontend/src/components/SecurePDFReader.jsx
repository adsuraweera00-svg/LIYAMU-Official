import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize,
  Loader2,
  AlertCircle,
  FileText,
  ExternalLink
} from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker for react-pdf using a more robust URL
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const SecurePDFReader = ({ fileUrl, coverUrl, title }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  useEffect(() => {
    // Disable right-click, copy, and print shortcuts
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeydown = (e) => {
      if (
        (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'c' || e.key === 'u')) ||
        (e.metaKey && (e.key === 'p' || e.key === 's' || e.key === 'c' || e.key === 'u'))
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = (err) => {
    // Instead of just showing error, try falling back to iframe
    setUseIframeFallback(true);
    setError('Primary reader failed. Attempting fallback...');
    setIsLoading(false);
    console.error(err);
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const next = prevPageNumber + offset;
      return Math.max(1, Math.min(next, numPages));
    });
  };

  const toggleFullscreen = () => {
    const elem = document.getElementById('secure-reader-container');
    if (!isFullscreen) {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div 
      id="secure-reader-container"
      className={`relative flex flex-col items-center bg-slate-900/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-100/10 shadow-2xl transition-all ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full min-h-[600px]'}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Header Toolbar */}
      <div className="w-full h-16 flex items-center justify-between px-6 bg-slate-900/40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <FileText className="text-brand-400" size={18} />
          <h3 className="hidden md:block text-[10px] font-black uppercase tracking-widest text-slate-100 truncate max-w-[200px]">
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-4">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800/50 rounded-xl p-1 border border-white/5">
            <button 
              onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
              className="p-1.5 hover:bg-slate-700/50 rounded-lg text-slate-300 transition-colors"
            >
              <ZoomOut size={16} />
            </button>
            <span className="px-3 text-[10px] font-black text-slate-100 w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button 
              onClick={() => setScale(s => Math.min(2.5, s + 0.2))}
              className="p-1.5 hover:bg-slate-700/50 rounded-lg text-slate-300 transition-colors"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          <div className="h-6 w-px bg-white/10" />

          {/* Fullscreen control */}
          <button 
            onClick={toggleFullscreen}
            className="p-2 hover:bg-slate-800/50 rounded-xl text-slate-300 transition-colors"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>

          <div className="h-6 w-px bg-white/10" />

          {/* Open in New Tab control */}
          <button 
            onClick={() => window.open(fileUrl, '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-600/20"
            title="Open in New Tab"
          >
            <ExternalLink size={16} />
            <span className="hidden sm:inline">Read PDF</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full overflow-auto flex justify-center custom-scrollbar select-none bg-slate-950/20">
        {!useIframeFallback ? (
          <div className="p-4 md:p-8 w-full flex justify-center">
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="relative w-full h-full min-h-[500px] flex flex-col items-center justify-center gap-6 overflow-hidden rounded-[2.5rem]">
                  <div className="absolute inset-0 z-0">
                    <img src={coverUrl} alt="" className="w-full h-full object-cover blur-xl opacity-20 scale-110" />
                    <div className="absolute inset-0 bg-slate-950/40" />
                  </div>
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-brand-500" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Opening Manuscript...</p>
                  </div>
                </div>
              }
            >
              <motion.div
                key={pageNumber}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="shadow-2xl rounded-lg overflow-hidden border border-white/5"
                onContextMenu={(e) => e.preventDefault()}
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale} 
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  className="max-w-full"
                  loading={<div className="h-[800px] w-[560px] bg-white/5 animate-pulse" />}
                />
              </motion.div>
            </Document>
          </div>
        ) : (
          <div className="w-full h-full min-h-[600px] relative flex items-center justify-center overflow-hidden rounded-[3rem]">
            {/* Immersive Cover Page Background */}
            <div className="absolute inset-0 z-0 scale-105">
              <img src={coverUrl} alt="" className="w-full h-full object-cover blur-2xl opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/90" />
            </div>

            {/* Front Cover Preview */}
            <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-48 md:w-64 aspect-[3/4] rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10"
              >
                <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
              </motion.div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">{title}</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-400">Digital Manuscript Available</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => window.open(fileUrl, '_blank')}
                    className="flex items-center gap-3 px-8 py-4 bg-brand-600 hover:bg-brand-500 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-brand-600/20"
                  >
                    <ExternalLink size={18} />
                    Open PDF to Read
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="w-full h-16 flex items-center justify-center px-6 bg-slate-900/40 border-t border-white/5">
        <div className="flex items-center gap-6">
          <button 
            disabled={pageNumber <= 1}
            onClick={() => changePage(-1)}
            className="p-2.5 bg-slate-800/50 hover:bg-brand-600 disabled:opacity-30 disabled:hover:bg-slate-800/50 rounded-xl text-white transition-all shadow-lg"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black tracking-widest text-white">
              PAGE {pageNumber} <span className="text-slate-500">OF</span> {numPages || '...'}
            </span>
            <div className="w-24 h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <motion.div 
                  className="h-full bg-brand-500" 
                  initial={{ width: 0 }}
                  animate={{ width: numPages ? `${(pageNumber / numPages) * 100}%` : 0 }}
                />
            </div>
          </div>

          <button 
            disabled={pageNumber >= numPages}
            onClick={() => changePage(1)}
            className="p-2.5 bg-slate-800/50 hover:bg-brand-600 disabled:opacity-30 disabled:hover:bg-slate-800/50 rounded-xl text-white transition-all shadow-lg"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Security Overlay - Optional subtle watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] flex items-center justify-center overflow-hidden z-10 select-none">
        <div className="rotate-[-45deg] whitespace-nowrap text-white text-9xl font-black">
          LIYAMU PROTECTED • LIYAMU PROTECTED • LIYAMU PROTECTED
        </div>
      </div>
    </div>
  );
};

export default SecurePDFReader;
