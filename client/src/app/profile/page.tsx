"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Star, Plus, Shield, Sword, X, Trash2, Edit2, Clock, CheckCircle, XCircle, Camera, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [swaps, setSwaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(1.0);

  useEffect(() => {
    setIsMusicMuted(localStorage.getItem("bg-music-muted") === "true");
    const storedVol = localStorage.getItem("bg-music-volume");
    if (storedVol) setMusicVolume(parseFloat(storedVol));
  }, []);

  const toggleMusic = () => {
    const newMuted = !isMusicMuted;
    setIsMusicMuted(newMuted);
    localStorage.setItem("bg-music-muted", newMuted.toString());
    window.dispatchEvent(new Event("bg-music-toggle"));
  };

  const handleVolumeChange = (newVolume: number) => {
    setMusicVolume(newVolume);
    localStorage.setItem("bg-music-volume", newVolume.toString());
    window.dispatchEvent(new CustomEvent("bg-music-volume-change", { detail: { volume: newVolume } }));
  };

  // Modals state
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [skillType, setSkillType] = useState<"teach" | "learn">("teach");
  
  // Forms state
  const [skillForm, setSkillForm] = useState({
    skillName: "", proficiency: "Beginner", yearsOfExperience: "1", priorityLevel: "Medium"
  });
  const [editForm, setEditForm] = useState({
    name: "", bio: "", location: ""
  });

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, swapsRes] = await Promise.all([
        api.get("/users/profile"),
        api.get("/swaps")
      ]);
      setUser(profileRes.data);
      setSwaps(swapsRes.data);
      setEditForm({
        name: profileRes.data.name || "",
        bio: profileRes.data.bio || "",
        location: profileRes.data.location || ""
      });
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put("/users/profile/skills", {
        type: skillType, ...skillForm
      });
      setIsSkillModalOpen(false);
      setSkillForm({ skillName: "", proficiency: "Beginner", yearsOfExperience: "1", priorityLevel: "Medium" });
      fetchProfileData(); // Refresh UI
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSkill = async (type: string, skillId: string) => {
    try {
      await api.delete(`/users/profile/skills/${type}/${skillId}`);
      fetchProfileData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put("/users/profile", editForm);
      setIsEditModalOpen(false);
      fetchProfileData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
       alert("Image size must be less than 5MB");
       return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        await api.put("/users/profile", { profileImage: base64String });
        // Update local state to immediately show the image without a full refresh
        setUser((prev: any) => ({ ...prev, profileImage: base64String }));
      } catch (err) {
        console.error("Failed to upload image:", err);
        alert("Failed to update profile picture.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateSwapStatus = async (swapId: string, status: string) => {
    try {
      await api.put(`/swaps/${swapId}`, { status });
      fetchProfileData();
    } catch (err) {
      console.error("Failed to update swap status:", err);
      alert("Failed to update swap status.");
    }
  };

  const handleDeleteSwap = async (swapId: string) => {
    if (!confirm("Are you sure you want to delete this swap record?")) return;
    try {
      await api.delete(`/swaps/${swapId}`);
      fetchProfileData();
    } catch (err) {
      console.error("Failed to delete swap:", err);
      alert("Failed to delete swap.");
    }
  };

  const handleRequestReEntry = async () => {
    try {
      await api.post("/admin/requestReEntry");
      alert("Request dispatched to Administration successfully.");
      fetchProfileData();
    } catch (err) {
      console.error(err);
      alert("Failed to submit request.");
    }
  };

  const handleMarkNotificationsRead = async () => {
    if (!user?.notifications?.some((n: any) => !n.isRead)) return;
    try {
      await api.put("/admin/notifications/markRead");
      fetchProfileData();
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl glass overflow-hidden neon-border relative z-10 bg-background/80 backdrop-blur-xl"
      >
        <div className="h-48 bg-gradient-to-r from-blue-600 via-primary to-secondary relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90" />
          <div className="absolute top-4 right-4 flex flex-wrap justify-end gap-2 z-30">
            <div className="bg-black/50 p-2 rounded-lg border border-white/20 hover:border-primary transition-colors text-white flex items-center gap-2 sm:gap-3">
              <button 
                onClick={toggleMusic}
                className="flex items-center"
                title={isMusicMuted ? "Unmute Music" : "Mute Music"}
              >
                {isMusicMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-primary" />} 
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={musicVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 sm:w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="bg-black/50 p-2 rounded-lg border border-white/20 hover:border-primary transition-colors text-white flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" /> <span className="hidden xs:inline">Edit Config</span>
            </button>
          </div>
        </div>
        
        <div className="px-8 pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 relative z-20">
          <div className="h-32 w-32 rounded-2xl bg-card border-2 neon-border-pink flex items-center justify-center text-4xl font-black shadow-[0_0_30px_rgba(255,0,127,0.3)] transform rotate-3 hover:rotate-0 transition-all duration-300 relative group overflow-hidden">
            {user.profileImage ? (
               <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
               <span className="neon-text-pink">{user.name?.charAt(0) || "U"}</span>
            )}
            
            <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
               <Camera className="w-8 h-8 text-white mb-1" />
               <span className="text-[10px] uppercase font-bold text-white tracking-widest">Update</span>
               <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
          <div className="flex-1 text-center sm:text-left mt-4 sm:mt-0">
            <h1 className="text-3xl font-black uppercase tracking-widest neon-text">{user.username}</h1>
            <p className="text-secondary font-mono flex items-center justify-center sm:justify-start gap-2 mt-1">
              <Shield className="w-4 h-4" /> {user.name} • {user.location || "Unknown Sector"}
            </p>
          </div>
        </div>

        <div className="px-8 pb-8 pt-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-8 md:col-span-2">
            <div className="p-6 rounded-xl bg-input/40 border border-white/5 relative group hover:neon-border transition-all">
              <h3 className="text-lg font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-primary">
                <Sword className="w-5 h-5" /> Player Bio
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-mono whitespace-pre-wrap">
                {user.bio || "No bio data found in databanks. Update your config to provide more information."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Teach Column */}
              <div className="p-5 rounded-xl bg-card border border-primary/20 shadow-[0_0_20px_rgba(0,229,255,0.05)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-[30px] -z-10" />
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold uppercase tracking-widest text-primary text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Arsenal (Teach)
                  </h4>
                  <button onClick={() => { setSkillType("teach"); setIsSkillModalOpen(true); }} className="p-1.5 rounded-md bg-primary/20 text-primary hover:bg-primary hover:text-black transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <ul className="space-y-3 font-mono">
                  {user.skillsTeach?.length === 0 && <p className="text-xs text-muted-foreground italic">No arsenal equipped.</p>}
                  {user.skillsTeach?.map((s: any) => (
                    <li key={s._id} className="flex flex-col text-sm p-3 rounded bg-background/50 border border-white/5 hover:border-primary/50 transition-colors group/item">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white">{s.skillName}</span>
                        <button onClick={() => handleDeleteSkill('teach', s._id)} className="text-red-500 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">EXP: {s.yearsOfExperience}y</span>
                        <span className="px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider rounded">{s.proficiency}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Learn Column */}
              <div className="p-5 rounded-xl bg-card border border-secondary/20 shadow-[0_0_20px_rgba(255,0,127,0.05)] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-24 h-24 bg-secondary/10 rounded-full blur-[30px] -z-10" />
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold uppercase tracking-widest text-secondary text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" /> Objectives (Learn)
                  </h4>
                  <button onClick={() => { setSkillType("learn"); setIsSkillModalOpen(true); }} className="p-1.5 rounded-md bg-secondary/20 text-secondary hover:bg-secondary hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <ul className="space-y-3 font-mono">
                  {user.skillsLearn?.length === 0 && <p className="text-xs text-muted-foreground italic">No active objectives.</p>}
                  {user.skillsLearn?.map((s: any) => (
                    <li key={s._id} className="flex justify-between items-center text-sm p-3 rounded bg-background/50 border border-white/5 hover:border-secondary/50 transition-colors group/item">
                      <span className="font-bold">{s.skillName}</span>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 border uppercase tracking-wider rounded ${s.priorityLevel === 'Urgent' ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'}`}>
                          {s.priorityLevel}
                        </span>
                        <button onClick={() => handleDeleteSkill('learn', s._id)} className="text-red-500 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Swap History */}
            <div className="p-6 rounded-xl bg-input/20 border border-white/10 relative">
               <h3 className="text-lg font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-primary">
                <Clock className="w-5 h-5" /> Mission Logs (Swap History)
              </h3>
              <div className="space-y-3 font-mono">
                {swaps.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 text-center border border-white/5 bg-background/30 rounded">No swap missions logged yet.</p>
                ) : (
                  swaps.map(swap => {
                    const isRequester = swap.requester._id === user._id;
                    const otherUser = isRequester ? swap.receiver : swap.requester;
                    
                    return (
                      <div key={swap._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card/60 border border-white/10 rounded-lg hover:border-primary/50 transition-colors">
                        <div>
                          <p className="font-bold text-sm text-white flex items-center gap-2">
                            {isRequester ? "Outgoing request to" : "Incoming request from"} <span className={isRequester ? "text-primary" : "text-secondary"}>@{otherUser.username}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 text-ellipsis overflow-hidden whitespace-nowrap max-w-sm">"{swap.initialMessage}"</p>
                        </div>
                        <div className="mt-3 sm:mt-0 flex items-center gap-3">
                          {swap.status === 'Pending' && !isRequester ? (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleUpdateSwapStatus(swap._id, 'Accepted')}
                                className="px-3 py-1 bg-green-500 text-black text-[10px] font-black uppercase rounded hover:bg-green-400 transition-colors shadow-[0_0_10px_rgba(57,255,20,0.3)]"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => handleUpdateSwapStatus(swap._id, 'Declined')}
                                className="px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase rounded hover:bg-red-400 transition-colors shadow-[0_0_10px_rgba(255,0,0,0.3)]"
                              >
                                Decline
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-bold px-3 py-1 rounded border uppercase ${
                                swap.status === 'Accepted' ? 'border-green-500 text-green-500 bg-green-500/10' : 
                                swap.status === 'Declined' ? 'border-red-500 text-red-500 bg-red-500/10' : 
                                'border-yellow-500 text-yellow-500 bg-yellow-500/10'
                              }`}>
                                {swap.status}
                              </span>
                              <button 
                                onClick={() => handleDeleteSwap(swap._id)}
                                className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                                title="Delete Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-input/20 border border-white/10 backdrop-blur-md">
              <h3 className="font-bold uppercase tracking-widest mb-6 border-b border-border pb-3 flex items-center justify-between text-accent">
                Player Stats <Star className="w-4 h-4" />
              </h3>
              <div className="space-y-5 font-mono">
                <div className="flex items-center justify-between bg-background/50 p-2 rounded border border-white/5">
                  <span className="text-xs text-muted-foreground uppercase">Joined</span>
                  <span className="font-bold text-sm text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between bg-background/50 p-2 rounded border border-white/5">
                  <span className="text-xs text-muted-foreground uppercase">Swaps Completed</span>
                  <span className="font-bold text-primary">{swaps.filter(s => s.status === 'Accepted').length}</span>
                </div>
                <div className="flex items-center justify-between bg-background/50 p-2 rounded border border-white/5">
                  <span className="text-xs text-muted-foreground uppercase">Rank</span>
                  <span className="font-bold text-accent drop-shadow-[0_0_5px_rgba(176,38,255,0.5)]">Unranked</span>
                </div>
              </div>
            </div>

            {/* Notifications Inbox Segment */}
            <div className="p-6 rounded-xl bg-input/20 border border-white/10 relative" onMouseEnter={handleMarkNotificationsRead}>
              <h3 className="font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-primary border-b border-primary/20 pb-3">
                <MessageSquare className="w-4 h-4" /> Comms Inbox
                {user.notifications?.filter((n: any) => !n.isRead).length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-auto animate-pulse">
                    {user.notifications.filter((n: any) => !n.isRead).length} NEW
                  </span>
                )}
              </h3>
              <div className="space-y-3 font-mono max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {(!user.notifications || user.notifications.length === 0) ? (
                  <p className="text-xs text-muted-foreground italic text-center p-4 bg-background/30 rounded border border-white/5">Inbox empty.</p>
                ) : (
                  user.notifications.map((notif: any) => (
                    <div key={notif._id} className={`p-3 rounded-lg border text-sm flex flex-col ${!notif.isRead ? 'border-primary/50 bg-primary/10 shadow-[0_0_10px_rgba(57,255,20,0.1)]' : 'border-white/5 bg-background/50 opacity-70'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[9px] uppercase font-bold tracking-widest ${notif.type === 'suspension' ? 'text-red-500' : 'text-primary'}`}>
                          {notif.type}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{new Date(notif.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-white text-xs leading-relaxed">{notif.message}</p>
                      {notif.actionAllowed === 'request_reentry' && (
                        <button 
                          onClick={handleRequestReEntry}
                          className="mt-3 bg-red-500 hover:bg-white hover:text-red-500 text-white border border-red-500 text-[10px] uppercase font-black tracking-widest py-1.5 px-3 rounded transition-colors self-start shadow-[0_0_10px_rgba(255,0,0,0.4)]"
                        >
                          Request Forum Re-entry
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`w-full max-w-md p-6 rounded-xl border-2 bg-card relative z-50 shadow-2xl neon-border-pink`}>
              <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <h2 className={`text-2xl font-black uppercase tracking-wider mb-6 neon-text-pink`}>
                Update Config
              </h2>
              
              <form onSubmit={handleEditProfile} className="space-y-4 font-mono">
                <div className="space-y-2">
                  <label className="text-xs uppercase text-muted-foreground tracking-widest">Display Name</label>
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full px-4 py-2 bg-input border border-white/10 focus:border-secondary outline-none focus:neon-border-pink transition-all rounded" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase text-muted-foreground tracking-widest">Location Sector</label>
                  <input type="text" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} className="w-full px-4 py-2 bg-input border border-white/10 focus:border-secondary outline-none focus:neon-border-pink transition-all rounded" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase text-muted-foreground tracking-widest">Player Bio</label>
                  <textarea rows={4} value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} className="w-full px-4 py-2 bg-input border border-white/10 focus:border-secondary outline-none focus:neon-border-pink transition-all rounded resize-none" />
                </div>
                <button type="submit" className={`w-full py-3 mt-4 text-white font-bold uppercase tracking-widest transition-all bg-secondary hover:bg-pink-600`}>
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Skill Modal (Existing logic) */}
      <AnimatePresence>
        {isSkillModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSkillModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`w-full max-w-md p-6 rounded-xl border-2 bg-card relative z-50 shadow-2xl ${skillType === 'teach' ? 'neon-border' : 'neon-border-pink'}`}>
              <button onClick={() => setIsSkillModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <h2 className={`text-2xl font-black uppercase tracking-wider mb-6 ${skillType === 'teach' ? 'neon-text' : 'neon-text-pink'}`}>
                Add {skillType === 'teach' ? 'Arsenal' : 'Objective'}
              </h2>
              
              <form onSubmit={handleAddSkill} className="space-y-4 font-mono">
                <div className="space-y-2">
                  <label className="text-xs uppercase text-muted-foreground tracking-widest">Skill Name</label>
                  <input type="text" required value={skillForm.skillName} onChange={(e) => setSkillForm({...skillForm, skillName: e.target.value})} className="w-full px-4 py-2 bg-input border border-white/10 focus:border-primary outline-none focus:neon-border transition-all rounded" placeholder="e.g. React.js" />
                </div>

                {skillType === 'teach' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs uppercase text-muted-foreground tracking-widest">Proficiency</label>
                      <select value={skillForm.proficiency} onChange={(e) => setSkillForm({...skillForm, proficiency: e.target.value})} className="w-full px-4 py-2 bg-input border border-white/10 outline-none rounded">
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                        <option>Expert</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase text-muted-foreground tracking-widest">EXP (Years)</label>
                      <input type="number" min="0" value={skillForm.yearsOfExperience} onChange={(e) => setSkillForm({...skillForm, yearsOfExperience: e.target.value})} className="w-full px-4 py-2 bg-input border border-white/10 outline-none rounded" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-muted-foreground tracking-widest">Priority Level</label>
                    <select value={skillForm.priorityLevel} onChange={(e) => setSkillForm({...skillForm, priorityLevel: e.target.value})} className="w-full px-4 py-2 bg-input border border-white/10 outline-none rounded">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </select>
                  </div>
                )}

                <button type="submit" className={`w-full py-3 mt-4 text-black font-bold uppercase tracking-widest transition-all ${skillType === 'teach' ? 'bg-primary hover:bg-cyan-300' : 'bg-secondary text-white hover:bg-pink-600'}`}>
                  Confirm Upload
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
