"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, MessageSquare, Send } from "lucide-react";
import { usePathname } from "next/navigation";

const QA_DATABASE = [
  { q: "How do I swap skills?", a: "To initiate a Skill Swap:\n1. Go to your Profile and Add Skills you wish to Teach and Learn.\n2. Go to the Explore page.\n3. Identify a suitable Player and click 'Inspect Player'.\n4. Click 'Initiate Link' to send a Swap Request.\n5. Wait for them to Accept, then head to Comms to connect!" },
  { q: "How do I start a video call?", a: "Once a player accepts your swap, go to your 'Comms' (Chat Lobby). Inside the active lobby, click the 'Start Video Link' button at the top to initiate a P2P encrypted video call." },
  { q: "How do I accept a swap request?", a: "Check your Comms lobby or notifications. If a user sent you a request, their lobby card will appear. Inside the chat, you will be prompted to Accept or Decline the incoming Link." },
  { q: "How do I report a toxic player?", a: "If you encounter a hostile player, please submit their Username and infraction details directly in the Community Forum under the 'Support' category, or email admins at support@skillswap.cyber." },
  { q: "Can I add multiple skills to my profile?", a: "Yes! Navigate to your Profile page and click 'Add Skill'. You can add as many Teaching Arsenal and Learning Objective skills as you need." },
  { q: "What is the Community Forum for?", a: "The Global Forum is a hub for users to discuss learning strategies, share tips, report bugs, and post suggestions. It operates on a global scale visible to all registered players." },
  { q: "How do I search for a specific skill?", a: "Go to the 'Explore' hub. There, you can filter through the global databanks to find players offering the exact skill you are looking to acquire." },
  { q: "Why am I seeing a 500 error?", a: "System anomalies (500 errors) occasionally happen if payload targets are missing. Please refresh the grid. If it persists, report it in the Community Forum under the 'Support' tag." },
  { q: "Are my video calls secure?", a: "Yes. SkillSwap utilizes WebRTC (Real-Time Communication) for peer-to-peer tunnels. Media streams bypass our servers and go directly between you and your swap partner." },
  { q: "Can I edit my forum posts?", a: "Currently, transmissions to the Global Forum cannot be edited once broadcasted. However, you can freely Delete your own posts using the red Trash icon on the post card." },
  { q: "What happens if I reject a swap?", a: "Declining a Link request immediately closes the pending connection. The initiator is notified, and the chat lobby dissolves." },
  { q: "Is there a mobile app?", a: "SkillSwap is currently a highly responsive progressive web application (PWA). You can safely launch it from any mobile browser." },
  { q: "Can I share my profile link?", a: "Yes, you can copy the URL when viewing your public profile (`/profile/[your-id]`) and share it. Anyone with an account can inspect your stats." },
  { q: "How do I change my profile picture?", a: "Player avatars are currently dynamically hashed based on your Username's first letter. Custom avatar uploads will be enabled in Patch 2.0." },
  { q: "What is Player Rating?", a: "After successful swaps, players may vouch for your teaching proficiency. A high Player Rating increases your prestige on the Explore grid. (Feature rolling out soon!)." },
  { q: "How do I leave feedback for a swap?", a: "Once a session concludes, a feedback modal will prompt you to rate the exchange. Alternatively, drop a positive commendation on the Global Forum." },
  { q: "Are there paid features?", a: "SkillSwap operates on a strict peer-to-peer barter system. You trade knowledge for knowledge. Currently, all core systems are free." },
  { q: "How do I log out?", a: "Click the red 'Exit' (LogOut) button located in the top-right corner of the persistent Navigation bar to terminate your session." },
  { q: "How do I change my location?", a: "Location data is currently bound to your initial registration coordinates. Sector relocation tools will be added in a future update." },
  { q: "What languages does SkillSwap support?", a: "SkillSwap utilizes an integrated real-time translation module. Click the Language button in the Navbar to switch the entire UI to any of 20+ supported languages." },
  { q: "I forgot my password!", a: "Account recovery is strict. Please contact support@skillswap.cyber with your original registration email to initiate a password reset protocol." }
];

export function Chatbot() {
  const pathname = usePathname();
  const isChat = pathname?.startsWith("/chat");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'bot' | 'user'; text: string }[]>([
    { role: 'bot', text: "GREETINGS PLAYER. I am the SkillSwap AI Matrix. I have 20+ answers pre-loaded into my databanks. Ask me anything or select a query below." }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const processQuery = (userMsg: string) => {
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput("");

    setTimeout(() => {
      let botResponse = "I am processing your query, but my databanks did not find a direct match. Please contact a human admin or try rewording your query.";
      const lowerReq = userMsg.toLowerCase();

      // Simple fuzzy match checking against our DB
      let highestMatchScore = 0;
      let bestAnswer = "";

      QA_DATABASE.forEach(item => {
        const qWords = item.q.toLowerCase().split(" ");
        let score = 0;
        
        qWords.forEach(w => {
           if (w.length > 3 && lowerReq.includes(w)) score += 1;
        });

        // Exact substring matches get heavy weighting
        if (lowerReq.includes(item.q.toLowerCase().replace("?", ""))) {
           score += 10;
        }

        if (score > highestMatchScore) {
           highestMatchScore = score;
           bestAnswer = item.a;
        }
      });

      // Threshold for a "good enough" match
      if (highestMatchScore >= 1) {
         botResponse = bestAnswer;
      }

      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    }, 500);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    processQuery(input.trim());
  };

  // Select 4 random questions for quick-chips
  const suggestedQuestions = QA_DATABASE.sort(() => 0.5 - Math.random()).slice(0, 4);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className={`fixed ${isChat ? 'bottom-[100px]' : 'bottom-6'} right-6 z-50 w-14 h-14 bg-primary text-black rounded-full flex items-center justify-center shadow-[0_0_20px_#39ff14] hover:scale-110 transition-transform animate-pulse`}
          >
            <Bot className="w-7 h-7" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed ${isChat ? 'bottom-[100px]' : 'bottom-6'} right-6 z-50 w-[350px] sm:w-[400px] h-[580px] bg-[#050c08] border-2 border-primary/50 shadow-[0_0_30px_rgba(57,255,20,0.15)] rounded-[2rem] flex flex-col overflow-hidden`}
          >
            <div className="h-16 bg-gradient-to-r from-primary/20 to-transparent border-b-2 border-primary/20 flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-widest text-primary text-sm">System AI</h3>
                  <p className="text-[10px] uppercase font-mono text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" /> Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-red-500 transition-colors"
               >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-repeat">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-primary text-black rounded-br-none shadow-[0_5px_15px_rgba(57,255,20,0.2)] font-bold' 
                      : 'bg-black border border-primary/30 text-primary rounded-bl-none shadow-lg leading-relaxed'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            <div className="bg-[#0a1a0f] border-t border-primary/20 flex flex-col">
              <div className="flex overflow-x-auto gap-2 p-3 no-scrollbar border-b border-white/5">
                 {QA_DATABASE.map((qa, index) => (
                    <button 
                       key={index}
                       onClick={() => processQuery(qa.q)}
                       className="whitespace-nowrap px-3 py-1.5 bg-black text-primary border border-primary/30 rounded-full text-[10px] font-bold uppercase hover:bg-primary hover:text-black transition-colors"
                    >
                       {qa.q}
                    </button>
                 ))}
              </div>
              <div className="p-3">
                <form onSubmit={handleSend} className="flex gap-2 relative">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="QUERY THE MATRIX..."
                    className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(57,255,20,0.2)]"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim()}
                    className="w-12 h-[42px] bg-primary text-black flex items-center justify-center rounded-xl absolute right-1 top-1 disabled:opacity-50 disabled:grayscale transition-transform hover:scale-105"
                  >
                    <Send className="w-4 h-4 ml-[-2px]" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
