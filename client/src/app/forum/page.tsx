"use client";

import { MessageSquare, ThumbsUp, Plus, Trash2, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ForumPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [isComposing, setIsComposing] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Tech Skills' });
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const CATEGORIES = ["Tech Skills", "Design", "Learning Tips", "Support", "Suggestions"];

  useEffect(() => {
    // Attempt to figure out if logged in for delete rights
    api.get("/users/profile")
      .then(res => setCurrentUser(res.data))
      .catch(() => setCurrentUser(null));

    fetchPosts();
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setNewsLoading(true);
      const res = await api.get("/news");
      if (res.data && res.data.articles) {
        // filter out any articles without a title
        setNews(res.data.articles.filter((a: any) => a.title && a.title !== "[Removed]").slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNewsLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/forum");
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert("Must be logged in to post.");
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    try {
      const res = await api.post("/forum", newPost);
      setPosts([res.data, ...posts]);
      setIsComposing(false);
      setNewPost({ title: '', content: '', category: 'Tech Skills' });
    } catch (err) {
      console.error(err);
      alert("Failed to submit post.");
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!currentUser) return router.push("/login");

    try {
      const res = await api.put(`/forum/${postId}/like`);
      setPosts(posts.map(p => p._id === postId ? res.data : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this transmission?")) return;

    try {
      await api.delete(`/forum/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete post.");
    }
  };

  const handleToggleComments = (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      setCommentText("");
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm("Ban this user from the forum? This deletes all their posts and issues a notification.")) return;
    try {
      await api.put(`/admin/banUser/${userId}`);
      alert("USER BANNED AND NOTIFIED. Transmissions wiped.");
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Failed to execute admin action.");
    }
  };

  const handleAddComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return router.push("/login");
    if (!commentText.trim()) return;

    try {
      const res = await api.post(`/forum/${postId}/comments`, {
        content: commentText
      });
      
      setPosts(posts.map(p => p._id === postId ? res.data : p));
      setCommentText("");
    } catch (err) {
      console.error(err);
      alert("Failed to post comment.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16 min-h-[calc(100vh-4rem)] max-w-6xl relative">
      <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6 relative z-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic neon-text mb-2 flex items-center gap-3">
            <MessageSquare className="w-10 h-10" /> Global Forum
          </h1>
          <p className="text-muted-foreground mt-1 font-mono bg-black/40 px-3 py-1 inline-block rounded border border-white/5">Discuss strategies, exchange intel, and report system anomalies.</p>
        </div>
        
        {currentUser?.isForumBanned ? (
           <div className="px-6 py-3 border border-red-500/50 text-red-500 bg-red-500/10 rounded-xl text-xs uppercase font-bold tracking-widest text-center shadow-[0_0_15px_rgba(255,0,0,0.3)]">
              ACCESS RESTRICTED. Check Profile Inbox.
           </div>
        ) : (
          <button 
            onClick={() => {
              if (!currentUser) return router.push("/login");
              setIsComposing(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_15px_#39ff14] hover:shadow-[0_0_25px_#39ff14] hover:scale-105"
          >
            <Plus className="h-5 w-5" /> Transmit Post
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10 font-mono">
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : posts.length === 0 ? (
            <p className="text-muted-foreground text-center py-20 italic">No transmissions found in the database.</p>
          ) : (
            posts.map((post, i) => {
              const hasLiked = currentUser && post.likes.includes(currentUser._id);
              const isAuthor = currentUser && post.authorId?._id === currentUser._id;
              
              // Deterministic fake likes based on post ID (0-350 range) + real likes
              const baseLikes = parseInt(post._id.substring(0, 4), 16) % 350;
              const displayLikes = baseLikes + post.likes.length;
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={post._id}
                  className="p-6 rounded-[1.5rem] bg-[#050c08] border-2 border-white/5 hover:border-primary/50 transition-all shadow-lg group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent translate-y-[-100%] group-hover:animate-[scan_2s_ease-in-out_infinite] pointer-events-none" />
                  
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 inline-block">
                        {post.category}
                      </span>
                      {currentUser?.isAdmin && !isAuthor && post.authorId?._id && (
                        <button onClick={() => handleBanUser(post.authorId._id)} className="text-red-500 hover:text-white bg-red-500/10 hover:bg-red-600 transition-colors px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-widest border border-red-500/30 shadow-[0_0_10px_rgba(255,0,0,0.3)]">
                          BAN USER
                        </button>
                      )}
                    </div>
                    {isAuthor && (
                      <button onClick={() => handleDeletePost(post._id)} className="text-muted-foreground hover:text-red-500 transition-colors p-2 bg-black rounded-full">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-black uppercase tracking-wider mb-2 text-white group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="text-sm text-gray-300 mb-6 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  
                  <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs font-bold text-muted-foreground">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleToggleLike(post._id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${hasLiked ? 'bg-secondary/20 border-secondary text-secondary shadow-[0_0_10px_rgba(255,0,255,0.3)]' : 'bg-black border-white/10 hover:border-secondary hover:text-secondary'}`}
                      >
                        <ThumbsUp className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} /> 
                        {displayLikes} LIKES
                      </button>
                      <button 
                        onClick={() => handleToggleComments(post._id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${expandedPostId === post._id ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(57,255,20,0.2)]' : 'bg-black border-white/10 hover:border-primary hover:text-primary'}`}
                      >
                        <MessageSquare className="h-4 w-4" /> 
                        {post.comments ? post.comments.length : 0} REPLIES
                      </button>
                    </div>
                    <div className="uppercase tracking-widest text-[10px]">
                      By <span className="text-primary">@{post.authorId?.username || "Unknown"}</span> • {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Expandable Comments Section */}
                  <AnimatePresence>
                    {expandedPostId === post._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-white/5 mt-4 pt-4"
                      >
                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                          {(!post.comments || post.comments.length === 0) ? (
                            <p className="text-xs text-muted-foreground italic pl-2">No replies yet. Be the first to transmit.</p>
                          ) : (
                            post.comments.map((comment: any) => (
                              <div key={comment._id} className="bg-black/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1">
                                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-muted-foreground">
                                  <span className="text-primary font-bold">@{comment.authorId?.username || "Unknown"}</span>
                                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                              </div>
                            ))
                          )}
                        </div>
                        
                        <form onSubmit={(e) => handleAddComment(post._id, e)} className="flex items-center gap-2 relative z-20">
                          <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Transmit a reply..."
                            className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                          />
                          <button 
                            type="submit"
                            disabled={!commentText.trim()}
                            className="bg-primary/20 hover:bg-primary text-primary hover:text-black p-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-primary/30"
                          >
                            <Send className="w-5 h-5 ml-[-2px]" />
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-[1.5rem] bg-[#050c08] border-2 border-white/5 font-mono">
            <h3 className="font-black text-primary uppercase tracking-widest mb-4 border-b border-white/10 pb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Frequencies
            </h3>
            <ul className="space-y-3 text-xs uppercase font-bold tracking-widest">
              <li className="flex justify-between items-center cursor-pointer text-primary hover:text-white transition-colors bg-primary/10 p-2 rounded border border-primary/20">
                All Topics 
              </li>
              {CATEGORIES.map(cat => (
                <li key={cat} className="flex justify-between items-center cursor-pointer text-muted-foreground hover:text-primary transition-colors p-2 rounded hover:bg-white/5 border border-transparent hover:border-primary/20">
                  {cat}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-[1.5rem] bg-gradient-to-b from-[#0a1a0f] to-[#050c08] border-2 border-primary/20 shadow-[0_0_15px_rgba(57,255,20,0.05)] font-mono">
             <h3 className="font-black text-white uppercase tracking-widest mb-4 border-b border-primary/20 pb-3 flex flex-col gap-1">
               <span className="text-[10px] text-primary">GLOBAL INTRANET</span>
               Trending Tech News
             </h3>
             <div className="space-y-4">
               {newsLoading ? (
                  <div className="flex justify-center py-4">
                     <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
               ) : news.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground italic">No uplink stable.</p>
               ) : (
                  news.map((item, idx) => (
                     <a 
                        key={idx} 
                        href={item.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="block p-3 rounded-lg bg-black/40 hover:bg-primary/10 border border-white/5 hover:border-primary/30 transition-all group"
                     >
                        <h4 className="text-xs font-bold text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-2">
                           {item.title}
                        </h4>
                        <div className="flex justify-between items-center text-[9px] text-muted-foreground uppercase tracking-widest">
                           <span>{item.source?.name || "Matrix Node"}</span>
                           <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                        </div>
                     </a>
                  ))
               )}
             </div>
          </div>
        </div>
      </div>

      {/* Compose Post Modal */}
      <AnimatePresence>
        {isComposing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsComposing(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#050c08] border-2 border-primary/50 relative z-50 shadow-[0_0_30px_rgba(57,255,20,0.15)] rounded-[2rem] overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent flex justify-between items-center">
                <h2 className="text-xl font-black uppercase tracking-widest neon-text">New Transmission</h2>
                <button onClick={() => setIsComposing(false)} className="text-muted-foreground hover:text-red-500 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreatePost} className="p-6 space-y-4 font-mono">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-primary">Subject Query</label>
                  <input
                    type="text"
                    required
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(57,255,20,0.2)]"
                    placeholder="Enter subject..."
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-primary">Frequency Channel</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-primary">Data Payload</label>
                  <textarea
                    required
                    rows={6}
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(57,255,20,0.2)] resize-none"
                    placeholder="Describe your query or transmission..."
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-8 py-4 bg-primary text-black rounded-xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_15px_#39ff14] hover:shadow-[0_0_25px_#39ff14] hover:scale-105"
                  >
                    <Send className="w-5 h-5 ml-[-4px]" /> Broadcast
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
