"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Star, Zap, Gamepad2, User2, X, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

// Helper for gamified styling
const getCardStyle = (index: number) => {
  const styles = [
    { color: "from-primary to-blue-600", border: "hover:neon-border", role: "Frontend Mage" },
    { color: "from-secondary to-purple-600", border: "hover:shadow-[0_0_20px_rgba(255,0,255,0.4)]", role: "Pixel Architect" },
    { color: "from-accent to-orange-500", border: "hover:shadow-[0_0_20px_rgba(255,230,0,0.5)]", role: "Linguist Rogue" },
    { color: "from-green-400 to-emerald-600", border: "hover:shadow-[0_0_20px_rgba(57,255,20,0.4)]", role: "Backend Hacker" }
  ];
  return styles[index % styles.length];
};

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [minRatingFilter, setMinRatingFilter] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on their skills or username
  const filteredUsers = users.filter(user => {
    // Hide specific test users
    if (user.username.toLowerCase().includes("test") || user.username.toLowerCase().includes("lender")) {
      return false;
    }
    const term = search.toLowerCase();
    const matchName = user.username.toLowerCase().includes(term);
    const matchSkill = user.skillsTeach?.some((s: any) => s.skillName.toLowerCase().includes(term));
    const matchRating = (user.rating || 4.9) >= minRatingFilter;
    return (matchName || matchSkill) && matchRating;
  });

  return (
    <div className="container mx-auto px-4 py-8 mt-16 min-h-[calc(100vh-4rem)] relative">
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4 relative z-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic neon-text mb-2 flex items-center gap-3">
            <ShoppingBag className="w-10 h-10" /> Skill Tradeplace
          </h1>
          <p className="text-muted-foreground font-mono bg-black/40 px-3 py-1 rounded inline-block border border-white/5">
            Scan for available peers to initiate skill link.
          </p>
        </div>
        
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-primary" />
            <input
              type="text"
              placeholder="Search skills or players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#050c08] border-2 border-primary/30 rounded-xl focus:border-primary outline-none transition-all font-mono text-sm text-foreground shadow-[0_0_15px_rgba(57,255,20,0.05)] focus:shadow-[0_0_15px_rgba(57,255,20,0.2)]"
            />
          </div>
          <div className="relative z-20">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="p-3 border-2 border-[#00a884]/30 rounded-xl hover:border-[#00a884] hover:bg-[#00a884]/10 transition-all text-[#00a884] bg-[#050c08] flex items-center h-full"
            >
              <Filter className="h-5 w-5" />
            </button>
            
            <AnimatePresence>
               {showFilters && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 10, scale: 0.95 }}
                   className="absolute right-0 top-[calc(100%+10px)] w-64 bg-[#111b21] border border-[#202c33] rounded-xl shadow-2xl p-4 flex flex-col gap-4 z-50"
                 >
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="font-bold text-white text-sm uppercase tracking-widest">Filter By Ratings</span>
                      <button onClick={() => setShowFilters(false)} className="text-[#aebac1] hover:text-white bg-white/5 hover:bg-white/10 p-1 rounded-full transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <label className="text-xs text-[#aebac1] uppercase font-bold tracking-widest mb-3 block">Minimum Review Score</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="5" 
                        step="0.5" 
                        value={minRatingFilter} 
                        onChange={(e) => setMinRatingFilter(parseFloat(e.target.value))} 
                        className="w-full accent-[#00a884] h-2 bg-black rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-white font-mono mt-3">
                        <span className="opacity-50">0.0</span>
                        <span className="text-[#00a884] font-bold bg-[#00a884]/10 px-2 py-0.5 rounded border border-[#00a884]/20">{minRatingFilter.toFixed(1)}+ Stars</span>
                        <span className="opacity-50">5.0</span>
                      </div>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          <AnimatePresence>
            {filteredUsers.length === 0 && (
              <p className="text-muted-foreground font-mono col-span-full text-center py-20">No matching players in the databanks.</p>
            )}
            
            {filteredUsers.map((user, index) => {
              const style = getCardStyle(index);
              // Pick their top teaching skill to feature
              const topSkill = user.skillsTeach?.[0]?.skillName || "Undisclosed";

              return (
                <motion.div
                  layout
                  key={user._id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4, type: "spring" }}
                  whileHover={{ scale: 1.02, translateY: -5 }}
                  className="flex flex-col bg-[#0b141a] border border-[#202c33] hover:border-[#00a884]/50 rounded-2xl overflow-hidden shadow-lg transition-colors group"
                >
                  {/* Digital Product Image Header */}
                  <div className={`h-36 bg-gradient-to-br ${style.color} flex items-center justify-center relative overflow-hidden`}>
                     <div className="absolute inset-0 bg-black/20" />
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
                     <div className="text-6xl font-black text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] z-10 uppercase relative group-hover:scale-110 transition-transform duration-500">
                       {user.username.charAt(0)}
                     </div>
                     <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-widest border border-white/10 z-10">
                        {style.role}
                     </div>
                  </div>

                  {/* Product Details Area */}
                  <div className="p-5 flex-1 flex flex-col relative z-20 bg-gradient-to-b from-[#111b21] to-[#0b141a]">
                    <div className="flex justify-between items-start mb-1">
                       <h3 className="font-black text-xl text-[#e9edef] truncate group-hover:text-[#00a884] transition-colors">{user.name || user.username}</h3>
                       <div className="flex items-center text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20 text-xs font-bold font-mono">
                         <Star className="h-3 w-3 fill-current mr-1 text-yellow-500" />
                         {(user.rating || 4.9).toFixed(1)}
                       </div>
                    </div>
                    <p className="text-xs text-[#8696a0] font-mono mb-4 flex items-center gap-1">
                      <User2 className="w-3 h-3" /> @{user.username}
                    </p>
                    
                    <p className="text-[13px] text-[#aebac1] leading-relaxed line-clamp-3 mb-5 min-h-[60px] italic">
                      "{user.bio || "Enthusiastic expert ready to swap digital services and knowledge. Connect to initiate a skill trade!"}"
                    </p>

                    <div className="flex items-center gap-2 mb-6 flex-wrap">
                      {user.skillsTeach?.slice(0, 2).map((s: any, i: number) => (
                        <span key={i} className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 bg-[#00a884]/10 text-[#00a884] rounded-md border border-[#00a884]/20 shadow-sm">
                          {s.skillName}
                        </span>
                      ))}
                      {(!user.skillsTeach || user.skillsTeach.length === 0) && (
                        <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 bg-white/5 text-gray-400 rounded-md border border-white/10">Undisclosed</span>
                      )}
                    </div>
                    
                    <div className="mt-auto flex justify-between items-center border-t border-white/5 pt-4">
                       <div className="text-[11px] text-[#8696a0] uppercase tracking-widest font-bold">
                         <span className="text-white text-sm mr-1">{user.reviewsCount || Math.floor(Math.random() * 50) + 12}</span> 
                         Reviews
                       </div>
                       <Link
                         href={`/profile/${user._id}`}
                         className="px-5 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-black font-black text-[11px] uppercase tracking-widest rounded-lg border border-primary/30 hover:border-primary transition-all hover:scale-105"
                       >
                         View Details
                       </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
