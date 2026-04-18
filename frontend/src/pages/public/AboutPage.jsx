import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Users, Award } from 'lucide-react';

const AboutPage = () => {
  const team = [
    { name: 'Aminda Didula', role: 'Owner & Head Developer', image: '/Aminda Didula.jpg' },
    { name: 'Janindu Karunathilaka', role: 'IT Developer', image: '/Janindu Karunathilaka.png' },
    { name: 'Anton Trewon', role: 'Admin', image: '/Anton Trewon.png' },
  ];

  return (
    <div className="pt-32 pb-20 space-y-32">
      {/* Intro Section */}
      <section id="about" className="mx-auto max-w-7xl px-4 text-center">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-600"
        >
          Our Story
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-4xl font-black uppercase tracking-tight text-slate-900 md:text-6xl dark:text-white"
        >
          About Liyamu
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-8 max-w-3xl text-lg font-medium leading-relaxed text-slate-500 dark:text-slate-400"
        >
          Founded in 2026, Liyamu was born from a simple realization: independent authors lack a professional, full-fidelity sanctuary for their work. We built a platform that treats digital publishing with the same reverence as a physical library.
        </motion.p>
      </section>

      {/* Mission & Vision */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 md:grid-cols-2">
          <motion.div 
            whileHover={{ y: -10 }}
            className="rounded-[3rem] bg-slate-900 p-12 text-white shadow-2xl shadow-slate-900/20"
          >
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/20">
              <Target size={32} strokeWidth={2.5} />
            </div>
            <h2 id="mission" className="text-3xl font-black uppercase tracking-tight">Our Mission</h2>
            <p className="mt-6 text-lg font-medium leading-relaxed text-slate-400">
              To empower micro-authors by providing world-class publishing tools, transparent earnings, and a prestigious digital shelf that connects them with readers who value quality.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10 }}
            className="rounded-[3rem] bg-brand-600 p-12 text-white shadow-2xl shadow-brand-600/20"
          >
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-white/10">
              <Eye size={32} strokeWidth={2.5} className="text-brand-600" />
            </div>
            <h2 id="vision" className="text-3xl font-black uppercase tracking-tight text-white">Our Vision</h2>
            <p className="mt-6 text-lg font-medium leading-relaxed text-brand-100">
              To become the world's most trusted ecosystem for independent literature, where creativity is protected and every author has the infrastructure to build a lasting legacy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="mx-auto max-w-5xl px-4 lg:px-6 relative">
        <div className="absolute inset-0 bg-brand-600/5 blur-[120px] rounded-full -z-10" />
        <div className="mb-20 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-600">Collaborators</span>
          <h2 className="mt-4 text-5xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Our Team</h2>
        </div>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              whileHover={{ y: -15 }}
              className="group relative flex flex-col items-center glass-theme rounded-[3rem] p-8 border border-white/20 shadow-2xl transition-all hover:border-brand-500/50 hover:shadow-brand-600/10 dark:bg-slate-900/40"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-[2.5rem] bg-slate-100 shadow-inner group-hover:shadow-2xl transition-all duration-700">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-8 text-center space-y-2">
                <h3 className="text-2xl font-black text-slate-900 leading-tight dark:text-white group-hover:text-brand-600 transition-colors uppercase tracking-tight">{member.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600 bg-brand-600/10 px-4 py-1.5 rounded-full inline-block dark:bg-brand-600/20">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-slate-50 py-32 border-y border-slate-100 dark:bg-slate-950 dark:border-white/5">
        <div className="mx-auto max-w-7xl px-4 text-center">
           <div className="grid gap-16 md:grid-cols-3">
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-8 rounded-[2.5rem] transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm hover:shadow-xl group"
              >
                <div className="mx-auto h-16 w-16 rounded-2xl bg-brand-600/10 flex items-center justify-center text-brand-600 mb-8 transition-transform group-hover:scale-110">
                  <Award size={32} />
                </div>
                <h4 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Quality First</h4>
                <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">We prioritize high-fidelity reading and writing experiences above all else.</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="p-8 rounded-[2.5rem] transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm hover:shadow-xl group"
              >
                <div className="mx-auto h-16 w-16 rounded-2xl bg-brand-600/10 flex items-center justify-center text-brand-600 mb-8 transition-transform group-hover:scale-110">
                  <Users size={32} />
                </div>
                <h4 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Community Driven</h4>
                <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">Our platform is built for and by authors and readers who value deep literature.</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="p-8 rounded-[2.5rem] transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm hover:shadow-xl group"
              >
                <div className="mx-auto h-16 w-16 rounded-2xl bg-brand-600/10 flex items-center justify-center text-brand-600 mb-8 transition-transform group-hover:scale-110">
                  <Target size={32} />
                </div>
                <h4 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Author First</h4>
                <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">Every feature we build is designed to empower the independent creator's journey.</p>
              </motion.div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
