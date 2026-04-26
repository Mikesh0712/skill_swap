"use client";

import { motion } from "framer-motion";
import { Shield, Sword, X, MessageSquare, Plus, Star, ArrowLeft } from "lucide-react";
import { use, useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PublicProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [linkMessage, setLinkMessage] = useState("Hey! Let's swap skills.");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${params.id}`);
        setUser(res.data);
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 401) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [params.id, router]);

  const handleInitiateSwap = async () => {
    try {
      if (!preferredDate || !preferredTime) {
         return alert("Please select a preferred date and time.");
      }

      // Create swap request using the first available teach/learn combinations for now.
      // In a fully robust system, you'd let the user select WHICH exact skills to swap.
      const skillOfferedId = user.skillsLearn[0]?._id; // What they want to learn is what I offer
      const skillRequestedId = user.skillsTeach[0]?._id; // What they teach is what I request

      await api.post("/swaps", {
        receiverId: user._id,
        skillOfferedId,
        skillRequestedId,
        initialMessage: linkMessage,
        preferredDate,
        preferredTime
      });
      
      alert("Swap Request Transmitted Successfully!");
      setIsLinking(false);
    } catch (err: any) {
      if (err.response?.status === 400) {
        // Expected validation from backend (e.g., pending request already exists)
        alert(err.response.data.message);
      } else {
        console.error("Transmission error:", err);
        alert(err.response?.data?.message || "Failed to transmit request.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full flex items-center justify-center animate-spin">
          <div className="w-8 h-8 rounded-full bg-primary/20" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-4xl font-black neon-text-pink mb-4">404 - PLAYER OFFLINE</h1>
        <p className="text-muted-foreground font-mono">This user signature could not be located in our databanks.</p>
        <Link href="/explore" className="mt-8 px-8 py-3 bg-primary/20 border border-primary text-primary font-bold uppercase tracking-widest hover:neon-border">
          Return to Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-10 max-w-5xl relative">
      <div className="mb-6 z-20 relative">
        <button 
          onClick={() => router.push('/explore')}
          className="inline-flex items-center text-muted-foreground hover:text-white transition-colors font-mono text-sm uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Explore
        </button>
      </div>
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[2rem] glass overflow-hidden border-2 border-secondary/30 relative z-10 bg-[#0a1a0f]/90 backdrop-blur-xl shadow-[0_0_30px_rgba(255,0,255,0.1)]"
      >
        <div className="h-48 bg-gradient-to-r from-secondary to-pink-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a1a0f]" />
        </div>
        
        <div className="px-8 pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-8 -mt-16 relative z-20">
          <div className="h-40 w-40 rounded-3xl bg-black border-4 neon-border-pink flex items-center justify-center text-6xl font-black shadow-[0_0_40px_rgba(255,0,255,0.3)] transform -rotate-3">
            <span className="neon-text-pink">{user.name?.charAt(0) || "U"}</span>
          </div>
          <div className="flex-1 text-center sm:text-left mt-4 sm:mt-0">
            <h1 className="text-4xl font-black uppercase tracking-widest neon-text-pink drop-shadow-lg">{user.username}</h1>
            <p className="text-muted-foreground font-mono flex items-center justify-center sm:justify-start gap-2 mt-2">
              <Shield className="w-4 h-4 text-secondary" /> {user.name} • {user.location || "Unknown Sector"}
            </p>
          </div>
          <div className="flex gap-4 mt-6 sm:mt-0">
            <button 
              onClick={() => setIsLinking(true)}
              className="inline-flex items-center justify-center rounded-xl text-sm font-bold uppercase tracking-widest transition-all focus-visible:outline-none bg-primary text-black hover:bg-white hover:shadow-[0_0_25px_#39ff14] h-12 px-8"
            >
              <Plus className="mr-2 h-5 w-5" /> Initiate Link
            </button>
          </div>
        </div>

        <div className="px-8 pb-8 pt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bio & Stats */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#050c08] border border-white/10 relative">
              <h3 className="text-lg font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-secondary">
                <Sword className="w-5 h-5" /> Player Bio
              </h3>
              <p className="text-white/80 text-sm leading-relaxed font-mono whitespace-pre-wrap">
                {user.bio || "This player operates in silence. No bio signature detected."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Teach Column */}
            <div className="p-6 rounded-2xl bg-[#050c08] border-2 border-primary/20 shadow-[0_0_20px_rgba(57,255,20,0.05)]">
              <h4 className="font-bold uppercase tracking-widest text-primary text-sm flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Arsenal (Teaching)
              </h4>
              <ul className="space-y-3 font-mono">
                {user.skillsTeach?.length === 0 && <p className="text-xs text-muted-foreground italic">Empty Arsenal.</p>}
                {user.skillsTeach?.map((s: any) => (
                  <li key={s._id} className="flex justify-between items-center text-sm p-3 rounded-xl bg-black/50 border border-white/5">
                    <span className="font-bold text-white">{s.skillName}</span>
                    <span className="px-2 py-1 bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider rounded text-[10px]">{s.proficiency}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Learn Column */}
            <div className="p-6 rounded-2xl bg-[#050c08] border-2 border-secondary/20 shadow-[0_0_20px_rgba(255,0,255,0.05)]">
              <h4 className="font-bold uppercase tracking-widest text-secondary text-sm flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" /> Objectives (Learning)
              </h4>
              <ul className="space-y-3 font-mono">
                {user.skillsLearn?.length === 0 && <p className="text-xs text-muted-foreground italic">No active objectives.</p>}
                {user.skillsLearn?.map((s: any) => (
                  <li key={s._id} className="flex justify-between items-center text-sm p-3 rounded-xl bg-black/50 border border-white/5">
                    <span className="font-bold text-white">{s.skillName}</span>
                    <span className="px-2 py-1 bg-secondary/20 text-secondary border border-secondary/30 uppercase tracking-wider rounded text-[10px]">{s.priorityLevel}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Link Request Modal */}
      {isLinking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsLinking(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-8 rounded-[2rem] border-4 bg-[#050c08] relative z-50 shadow-2xl neon-border"
          >
            <button onClick={() => setIsLinking(false)} className="absolute top-6 right-6 text-muted-foreground hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-black uppercase tracking-wider mb-2 neon-text">Link Request</h2>
            <p className="text-xs font-mono text-muted-foreground mb-6">Initiating swap procedures with {user.username}</p>
            
            <div className="space-y-4 font-mono">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] uppercase text-primary font-bold tracking-widest">Preferred Date</label>
                   <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3 py-2 bg-black/50 border-2 border-white/10 focus:border-primary outline-none focus:neon-border transition-all rounded-xl text-xs text-white"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] uppercase text-primary font-bold tracking-widest">Preferred Time</label>
                   <input
                      type="time"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full px-3 py-2 bg-black/50 border-2 border-white/10 focus:border-primary outline-none focus:neon-border transition-all rounded-xl text-xs text-white"
                   />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase text-primary font-bold tracking-widest">Transmission Payload</label>
                <textarea
                  rows={3}
                  value={linkMessage}
                  onChange={(e) => setLinkMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border-2 border-white/10 focus:border-primary outline-none focus:neon-border transition-all rounded-xl resize-none text-sm text-white"
                  placeholder="Enter your initial comms..."
                />
              </div>
              <button
                onClick={handleInitiateSwap}
                className="w-full py-4 mt-2 text-black font-black uppercase tracking-widest transition-all bg-primary hover:bg-white hover:shadow-[0_0_20px_#39ff14] rounded-xl flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" /> Transmit Request
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
