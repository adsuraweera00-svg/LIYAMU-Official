import { motion } from 'framer-motion';
import { ShieldCheck, Eye, Lock, FileText, Smartphone, Globe, Mail } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const sections = [
    {
      title: "Data Collection",
      icon: Eye,
      content: "We collect information you provide directly to us when you create an account, publish a book, or communicate with us. This includes your name, email address, profile picture, and any social media handles you choose to share."
    },
    {
      title: "How We Use Your Data",
      icon: FileText,
      content: "Your data is used to provide, maintain, and improve our services, including processing transactions, sending technical notices, and providing customer support. We also use it to personalize your experience and protect the security of our platform."
    },
    {
      title: "Data Sharing & Disclosure",
      icon: Globe,
      content: "We do not share your private personal information with third parties except as described in this policy. We may share information with service providers who perform services for us, or when required by law."
    },
    {
      title: "Your Rights & Controls",
      icon: Lock,
      content: "You have the right to access, update, or delete your personal information at any time through your account settings. You can also opt-out of promotional communications."
    }
  ];

  return (
    <div className="pt-32 pb-20 dark:bg-slate-900 min-h-screen">
      <div className="mx-auto max-w-4xl px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-600/10 text-brand-600 mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white md:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-lg font-medium text-slate-500 dark:text-slate-400">Last updated: April 1, 2026</p>
        </motion.div>

        <div className="space-y-12">
          {sections.map((section, i) => (
            <motion.section 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm dark:bg-slate-800 dark:border-slate-700 hover:shadow-xl transition-all"
            >
              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-900 dark:bg-slate-700 dark:text-white">
                   <section.icon size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-4">{section.title}</h2>
                  <p className="text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">{section.content}</p>
                </div>
              </div>
            </motion.section>
          ))}

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="p-10 rounded-[2.5rem] bg-slate-900 text-white text-center"
          >
             <Mail className="mx-auto mb-6 text-brand-500" size={32} />
             <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Questions?</h3>
             <p className="text-slate-400 font-medium mb-8">If you have any questions about this Privacy Policy, please contact us.</p>
             <a href="mailto:liyamu.owner@gmail.com?subject=Privacy%20Inquiry%20-%20Liyamu%20Platform" className="inline-block rounded-2xl bg-brand-600 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-brand-500 transition-all shadow-xl shadow-brand-600/20">
                Contact Privacy Team
             </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
