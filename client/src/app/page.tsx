"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Code, Palette, Zap, Star, Mail, Linkedin } from "lucide-react";
import { useEffect, useState } from "react";

const TYPING_SPEED = 100;
const HEADLINE_TEXT = "Trade Skills. Build Connections.";

export default function Home() {
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    let i = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const type = () => {
      if (isDeleting) {
        setTypedText(HEADLINE_TEXT.substring(0, i - 1));
        i--;
      } else {
        setTypedText(HEADLINE_TEXT.substring(0, i + 1));
        i++;
      }

      let typeSpeed = isDeleting ? 40 : TYPING_SPEED;

      if (!isDeleting && i === HEADLINE_TEXT.length) {
        typeSpeed = 2500; // Pause when full text is typed
        isDeleting = true;
      } else if (isDeleting && i === 0) {
        isDeleting = false;
        typeSpeed = 1000; // Pause before typing again
      }

      timeoutId = setTimeout(type, typeSpeed);
    };

    timeoutId = setTimeout(type, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] pt-10 pb-0 overflow-hidden relative w-full">

      <section className="container px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center border-4 border-foreground dark:border-primary px-4 py-2 text-xs font-bold text-foreground dark:text-primary tracking-widest uppercase pixel-text-alt bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_var(--primary)]">
            ✨ Peer-to-Peer Knowledge Matrix
          </div>
          
          <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl tracking-tight h-[60px] sm:h-[80px] flex items-center justify-center pixel-text !text-black dark:!text-blue-900 drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)] whitespace-nowrap w-full">
            {typedText}
            <span className="animate-pulse w-3 sm:w-4 ml-1 sm:ml-2 bg-primary h-[0.8em]" />
          </h1>
          
          <p className="text-base md:text-lg !text-black dark:!text-blue-900 max-w-2xl mx-auto pixel-text-alt px-2 leading-relaxed">
            SkillSwap is a secure network where you can teach what you know and learn what you want. No currency involved, just pure data exchange.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 pixel-text-alt tracking-widest px-4">
            <Link
              href="/signup"
              className="pixel-button scale-110"
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4 inline" />
            </Link>
            <Link
              href="/explore"
              className="pixel-button bg-secondary text-secondary-foreground"
            >
              Explore Network
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="container px-4 mt-20 md:mt-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 pixel-card hover:-translate-y-1 transition-transform"
          >
            <Code className="h-10 w-10 text-blue-500 mb-4" />
            <h3 className="text-lg md:text-xl font-bold mb-2 text-foreground dark:text-white pixel-text-alt uppercase tracking-tight">Teach & Learn</h3>
            <p className="text-sm md:text-base text-muted-foreground pixel-text-alt leading-relaxed">List skills you can offer and discover people who have the skills you need.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 pixel-card hover:-translate-y-1 transition-transform"
          >
            <Zap className="h-10 w-10 text-purple-500 mb-4" />
            <h3 className="text-lg md:text-xl font-bold mb-2 text-foreground dark:text-white pixel-text-alt uppercase tracking-tight">Real-time Sessions</h3>
            <p className="text-sm md:text-base text-muted-foreground pixel-text-alt leading-relaxed">Schedule and communicate in real-time through our built-in video and chat system.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-6 pixel-card hover:-translate-y-1 transition-transform col-span-1 sm:col-span-2 md:col-span-1"
          >
            <Palette className="h-10 w-10 text-pink-500 mb-4" />
            <h3 className="text-lg md:text-xl font-bold mb-2 text-foreground dark:text-white pixel-text-alt uppercase tracking-tight">Build Reputation</h3>
            <p className="text-sm md:text-base text-muted-foreground pixel-text-alt leading-relaxed">Get rated for your teaching and rise in the community leaderboard of experts.</p>
          </motion.div>
        </div>
      </section>

      {/* User Reviews Section */}
      <section className="container px-4 mt-20 md:mt-32 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl mb-10 md:mb-16 tracking-widest uppercase pixel-text text-center !text-black dark:!text-blue-900">Player Testimonials</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {[
            { name: "Alex Chen", role: "Frontend Dev -> UI/UX", review: "Traded my React knowledge for Figma masterclasses. Surprisingly efficient system, though the timezones were a bit tricky at first.", rating: 4.5, stars: [1, 1, 1, 1, 0.5] },
            { name: "Sarah Jenkins", role: "Data Scientist -> Python", review: "SkillSwap completely bypassed the need for expensive bootcamps. I found an amazing Python architect who helped me deploy my first model.", rating: 5, stars: [1, 1, 1, 1, 1] },
            { name: "Omar Farooq", role: "Beginner -> Fullstack", review: "I had nothing to trade initially, but someone agreed to teach me HTML if I helped them practice English conversational skills. Great community.", rating: 4.8, stars: [1, 1, 1, 1, 0.8] }
          ].map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className={`p-6 pixel-card bg-background dark:bg-[#050c08] border-2 group ${i === 2 ? 'sm:col-span-2 md:col-span-1' : ''}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-500">
                  {testimonial.stars.map((fill, idx) => (
                    <div key={idx} className="relative">
                      <Star className="w-4 h-4 text-gray-600" />
                      <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      </div>
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold text-muted-foreground">{testimonial.rating}</span>
              </div>
              <p className="text-foreground dark:text-gray-300 mb-6 font-mono text-sm leading-relaxed">&quot;{testimonial.review}&quot;</p>
              <div className="flex items-center gap-3 border-t border-muted pt-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary border border-primary/50">
                  {testimonial.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-foreground dark:text-white uppercase text-sm tracking-wide group-hover:text-primary transition-colors">{testimonial.name}</h4>
                  <p className="text-[10px] text-muted-foreground dark:text-gray-400 uppercase tracking-widest font-mono">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Light Themed Comprehensive Footer */}
      <footer className="w-full mt-32 bg-black text-white border-t-4 border-primary">
        <div className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-12 font-sans relative z-10">
          
          {/* Brand & Developer Info */}
          <div className="space-y-4">
            <h3 className="font-black text-2xl tracking-tighter text-white">SkillSwap</h3>
            <p className="text-sm text-gray-300 leading-relaxed font-mono">
              A peer-to-peer knowledge matrix. Trade skills without currency.
            </p>
            <div className="pt-4 border-t border-gray-700">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Architected by</p>
              <h4 className="font-black text-lg text-primary drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]">Mikesh Kumar Pradhan</h4>
              <p className="text-sm font-medium text-gray-300">Full-Stack Web Developer</p>
            </div>
          </div>

          {/* Quick Links & Learning References */}
          <div className="space-y-4">
            <h4 className="font-bold uppercase tracking-widest text-sm border-b-2 border-primary/30 pb-2 inline-block text-white">Learning Hubs</h4>
            <ul className="space-y-3 text-sm text-gray-300 font-medium">
              <li>
                <a href="https://www.coursera.org" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Coursera
                </a>
              </li>
              <li>
                 <a href="https://www.udemy.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Udemy
                </a>
              </li>
               <li>
                 <a href="https://www.edx.org" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> edX
                </a>
              </li>
              <li>
                 <a href="https://freecodecamp.org" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> freeCodeCamp
                </a>
              </li>
            </ul>
          </div>

          {/* FAQs */}
          <div className="space-y-4">
            <h4 className="font-bold uppercase tracking-widest text-sm border-b-2 border-secondary/30 pb-2 inline-block text-white">FAQs</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <strong className="block text-white">Is SkillSwap free?</strong>
                <span className="text-gray-300">Yes, it operates purely on trading skills. No money is involved.</span>
              </li>
              <li>
                <strong className="block text-white">How do video calls work?</strong>
                <span className="text-gray-300">We use built-in WebRTC for secure peer-to-peer browser connections.</span>
              </li>
              <li>
                <strong className="block text-white">Can I request multiple skills?</strong>
                <span className="text-gray-300">Yes, you can list multiple 'Teach' and 'Learn' preferences on your profile.</span>
              </li>
            </ul>
          </div>

          {/* Contact / Feedback Form */}
          <div className="space-y-4">
            <h4 className="font-bold uppercase tracking-widest text-sm border-b-2 border-blue-500/30 pb-2 inline-block text-white">Send Feedback</h4>
            <form action="mailto:mikeshpradhan7@gmail.com" method="GET" encType="text/plain" className="space-y-3" suppressHydrationWarning>
              <input 
                type="text" 
                name="subject"
                placeholder="Subject" 
                className="w-full px-3 py-2 bg-white/10 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-primary text-sm text-white shadow-sm placeholder-gray-400"
                required
                suppressHydrationWarning
              />
              <textarea 
                name="body"
                placeholder="How can we improve the Matrix?" 
                rows={3}
                className="w-full px-3 py-2 bg-white/10 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-primary text-sm text-white shadow-sm resize-none placeholder-gray-400"
                required
                suppressHydrationWarning
              />
              <button 
                type="submit" 
                className="w-full py-2 bg-primary text-black font-bold uppercase tracking-widest text-xs rounded hover:bg-white hover:text-black transition-colors shadow-md flex items-center justify-center gap-2"
                suppressHydrationWarning
              >
                <Mail className="w-4 h-4" /> Dispatch to Mikesh
              </button>
            </form>
            <div className="pt-4 flex items-center gap-4 justify-center">
              <a href="https://www.linkedin.com/in/mikesh-kumar-pradhan-a16308294" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

        </div>
        
        {/* Bottom Bar */}
        <div className="bg-black border-t border-gray-800 text-center py-4 text-xs text-gray-500 font-mono font-medium" suppressHydrationWarning>
          © 2026 SkillSwap by Mikesh Kumar Pradhan. All systems operational.
        </div>
      </footer>

    </div>
  );
}
