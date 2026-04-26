"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Mic, Smartphone, XCircle, CheckCircle2 } from "lucide-react";
import socket from "@/lib/socket";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export function GlobalCallListener() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    ringtoneRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
    ringtoneRef.current.loop = true;

    const initGlobalListener = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      if (!token) return;

      try {
        const res = await api.get("/users/profile");
        setCurrentUser(res.data);

        if (!socket.connected) socket.connect();
        
        const joinUser = () => {
          console.log("Global: Joining user room:", res.data._id);
          socket.emit('joinUserRoom', { userId: res.data._id });
        };

        socket.off('connect', joinUser);
        socket.on('connect', joinUser);
        if (socket.connected) joinUser();

        socket.off('webrtc_offer');
        socket.on('webrtc_offer', (data) => {
          // Only show global notification if NOT on the chat page with the same room active
          const isChatPage = window.location.pathname === '/chat';
          const params = new URLSearchParams(window.location.search);
          const activeRoomId = params.get('roomId');
          
          if (isChatPage && activeRoomId === data.roomId) {
            console.log("Global: Call received but already in the correct chat room, ignoring global popup.");
            return;
          }

          console.log("Global: !!! RECEIVED CALL FROM", data.callerInfo?.username);
          setIncomingCall(data);
          if (ringtoneRef.current) {
            ringtoneRef.current.currentTime = 0;
            ringtoneRef.current.play().catch(e => console.warn("Global: Ringtone blocked", e));
          }
        });

        socket.off('webrtc_end_call');
        socket.on('webrtc_end_call', () => {
          setIncomingCall(null);
          ringtoneRef.current?.pause();
        });

        socket.off('webrtc_reject_call');
        socket.on('webrtc_reject_call', () => {
          setIncomingCall(null);
          ringtoneRef.current?.pause();
        });

      } catch (err) {
        console.error("Global listener init failed:", err);
      }
    };

    initGlobalListener();

    // Check every 3 seconds if token appears (e.g. after login) if not yet initialized
    const interval = setInterval(() => {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      if (token && !currentUser) {
        console.log("Global: Token detected, initializing listener...");
        initGlobalListener();
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      socket.off('connect');
      socket.off('webrtc_offer');
      socket.off('webrtc_end_call');
      socket.off('webrtc_reject_call');
      ringtoneRef.current?.pause();
    };
  }, [currentUser]); // Retry if currentUser is null

  const handleAccept = () => {
    if (!incomingCall) return;
    ringtoneRef.current?.pause();
    const { roomId, callType } = incomingCall;
    // Redirect to chat with acceptance flag
    router.push(`/chat?roomId=${roomId}&accepted=true&type=${callType}`);
    setIncomingCall(null);
  };

  const handleDecline = () => {
    if (incomingCall) {
      socket.emit('webrtc_reject_call', {
        targetUserId: incomingCall.callerInfo._id
      });
    }
    setIncomingCall(null);
    ringtoneRef.current?.pause();
  };

  return (
    <AnimatePresence>
      {incomingCall && (
        <div className="fixed top-20 right-6 z-[9999] w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="bg-[#0a1a0f]/95 backdrop-blur-2xl border-2 border-secondary rounded-3xl p-6 shadow-[0_0_50px_rgba(255,0,255,0.3)] overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-transparent animate-pulse" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-secondary/20 border-2 border-secondary flex items-center justify-center font-black text-2xl text-secondary shadow-[0_0_20px_rgba(255,0,255,0.4)]">
                  {incomingCall.callerInfo.username.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full border-2 border-[#0a1a0f] flex items-center justify-center">
                  <Smartphone className="w-3 h-3 text-black" />
                </div>
              </div>

              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                  Incoming {incomingCall.callType} Call
                </p>
                <p className="text-[8px] text-yellow-500 animate-pulse font-bold uppercase mt-1">Interaction required for Audio</p>
                <h3 className="text-xl font-black uppercase text-white tracking-wider truncate">
                  {incomingCall.callerInfo.username}
                </h3>
                <p className="text-[9px] font-mono text-muted-foreground uppercase mt-0.5">Transmitting Signal...</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={handleAccept}
                className="flex-1 flex items-center justify-center gap-2 bg-primary py-3 rounded-xl text-black font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_#39ff1480]"
              >
                <CheckCircle2 className="w-4 h-4" /> Accept
              </button>
              <button 
                onClick={handleDecline}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600/20 border-2 border-red-600/50 py-3 rounded-xl text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-600 hover:text-white transition-all"
              >
                <XCircle className="w-4 h-4" /> Decline
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
