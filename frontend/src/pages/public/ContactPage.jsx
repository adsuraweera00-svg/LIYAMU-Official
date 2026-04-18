import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageSquare, Send, CheckCircle, Facebook } from 'lucide-react';
import api from '../../api/client';

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contacts', form);
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { name: 'Email', value: 'liyamu.owner@gmail.com', icon: Mail, color: 'bg-brand-600', link: 'mailto:liyamu.owner@gmail.com' },
    { name: 'WhatsApp', value: '+94 77 293 4688', icon: MessageSquare, color: 'bg-emerald-600', link: 'https://whatsapp.com/channel/0029VbCfpbbFCCoWcZ9H7i3N' },
    { name: 'Facebook', value: 'facebook.com/liyamufb', icon: Facebook, color: 'bg-blue-600', link: 'https://www.facebook.com/liyamufb' },
    { name: 'Phone', value: '+94 77 293 4688', icon: Phone, color: 'bg-slate-900', link: 'tel:+94772934688' },
  ];

  return (
    <div className="pt-32 pb-20 space-y-32">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-4 text-center">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-600"
        >
          Contact
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-4xl font-black uppercase tracking-tight text-slate-900 md:text-6xl"
        >
          Get in touch
        </motion.h1>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Details */}
          <div className="space-y-8">
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">Direct Contact</h2>
            <p className="text-lg font-medium text-slate-500 leading-relaxed">
              Have a question or need assistance? Our team is here to help you. Choose your preferred way to connect.
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              {contactInfo.map((info, i) => (
                <a 
                  key={i} 
                  href={info.link} 
                  target={info.link.startsWith('http') ? "_blank" : "_self"} 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <motion.div 
                    whileHover={{ x: 10, y: -5 }}
                    className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all h-full"
                  >
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${info.color} text-white shadow-lg shadow-brand-600/10`}>
                      <info.icon size={20} strokeWidth={2.5} />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{info.name}</h4>
                    <p className="mt-1 text-sm font-black text-slate-900 truncate">{info.value}</p>
                  </motion.div>
                </a>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-[3rem] bg-slate-900 p-8 md:p-12 text-white shadow-2xl shadow-slate-900/10">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex h-full flex-col items-center justify-center text-center space-y-6"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/20">
                   <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Message Received</h3>
                <p className="text-slate-400 font-medium">Thank you for reaching out! Our team will get back to you shortly.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-xs font-black uppercase tracking-widest text-brand-600 hover:text-white transition-all underline underline-offset-8"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</label>
                  <input 
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-2 w-full rounded-2xl bg-white/10 px-6 py-4 text-sm font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all border-none"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</label>
                  <input 
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-2 w-full rounded-2xl bg-white/10 px-6 py-4 text-sm font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all border-none"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Message</label>
                  <textarea 
                    required
                    rows="4"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="mt-2 w-full rounded-2xl bg-white/10 px-6 py-4 text-sm font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all border-none resize-none"
                    placeholder="How can we help?"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-600 px-6 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-brand-500 transition-all shadow-xl shadow-brand-900/20 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                  {!loading && <Send size={16} />}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
