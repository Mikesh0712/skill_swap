"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import { Send, Zap, Smile, MessageCircle, Video, Mic, MicOff, VideoOff, PhoneOff, Maximize2, Minimize2, X, Trash2, Paperclip, Image as ImageIcon, FileText, Download, File, ChevronDown, Edit2, Trash, MoreVertical, Eraser, Check, CheckCheck, ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import api from "@/lib/api";
import socket from "@/lib/socket";
import { useRouter, useSearchParams } from "next/navigation";
import { Socket } from "socket.io-client";
import { StarBackground } from "@/components/StarBackground";

const QUICK_CHATS = [
  "Hello!", 
  "Let's Swap!", 
  "Ready when you are!", 
  "Well played!", 
  "Oops!", 
  "Wait 5 mins..."
];

function ImageAttachment({ url, fileName }: { url: string; fileName: string }) {
  const [isBlurred, setIsBlurred] = useState(true);

  return (
    <div className="mb-1 mt-1 rounded-lg overflow-hidden border border-white/5 relative group/img cursor-pointer" onClick={() => setIsBlurred(false)}>
      <img 
        src={url} 
        alt={fileName} 
        className={`max-w-full max-h-64 object-cover transition-all duration-500 select-none ${isBlurred ? 'blur-xl brightness-50' : ''}`} 
      />
      
      {isBlurred && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="p-3 bg-white/10 rounded-full text-white backdrop-blur-md shadow-lg border border-white/20">
            <ImageIcon className="w-6 h-6 drop-shadow-md" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#e9edef] bg-black/50 px-2.5 py-1 rounded-full border border-white/5 shadow-sm">
            Tap to View
          </p>
        </div>
      )}

      {!isBlurred && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
          <a 
            href={url} 
            download={fileName} 
            onClick={e => e.stopPropagation()} 
            className="p-3 bg-[#00a884] text-white hover:bg-white hover:text-[#005c4b] rounded-full shadow-lg transition-all hover:scale-110"
          >
            <Download className="w-5 h-5" />
          </a>
        </div>
      )}
    </div>
  );
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showQuickChat, setShowQuickChat] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachment, setAttachment] = useState<{ url: string; fileType: string; fileName: string } | null>(null);
  const [deleteRequest, setDeleteRequest] = useState<any>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showDropdownFor, setShowDropdownFor] = useState<string | null>(null);
  const [showLobbyMenu, setShowLobbyMenu] = useState(false);
  
  // File Refs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  
  // WebRTC States
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null); // Stores offer data
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // WebRTC Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callingSoundRef = useRef<HTMLAudioElement | null>(null);
  const pendingIceCandidates = useRef<RTCIceCandidateInit[]>([]);

  useEffect(() => {
    callingSoundRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3");
    callingSoundRef.current.loop = true;

    return () => {
      callingSoundRef.current?.pause();
    };
  }, []);

  // Derived other user info
  const activeRoom = rooms.find(r => r._id === activeRoomId);
  const otherUser = activeRoom && currentUser 
    ? (activeRoom.requester._id === currentUser._id ? activeRoom.receiver : activeRoom.requester)
    : null;

  // Swap State
  const [isLocalMain, setIsLocalMain] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup WebRTC on unmount or room change
  const cleanupWebRTC = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsVideoCallActive(false);
    setIncomingCall(null);
    pendingIceCandidates.current = [];
    callingSoundRef.current?.pause();
    if (callingSoundRef.current) callingSoundRef.current.currentTime = 0;
  };

  useEffect(() => {
    const initUserData = async () => {
      try {
        const userRes = await api.get("/users/profile");
        setCurrentUser(userRes.data);

        const swapsRes = await api.get("/swaps");
        const acceptedSwaps = swapsRes.data.filter((s: any) => s.status === 'Accepted');
        setRooms(acceptedSwaps);

        // Standard Socket Connection (Singleton)
        if (!socket.connected) socket.connect();
        socketRef.current = socket;
        
        // Always ensure we are in our personal room
        socket.emit('joinUserRoom', { userId: userRes.data._id });

        // Handle auto-approval if redirected from global listener
        const preId = searchParams.get('roomId');
        const isPre = searchParams.get('accepted') === 'true';
        if (preId && isPre) setActiveRoomId(preId);

        // Register Global-ish listeners once
        socket.off('newMessage'); // Avoid duplicates
        socket.on('newMessage', (message: any) => {
          setMessages((prev) => {
            // Use functional update to ensure we check current activeRoomId
            return prev;
          });
          if (message.sender !== userRes.data._id) {
             socket.emit('markAsDelivered', { messageId: message._id, roomId: message.chatRoomId || message.roomId });
          }
        });

        const setupWebRTCListeners = () => {
          socket.off('webrtc_offer');
          socket.on('webrtc_offer', (data) => {
            console.log("Chat: Incoming Call Request from", data.callerInfo?.username);
            setIncomingCall(data);
            if (callingSoundRef.current) {
               callingSoundRef.current.currentTime = 0;
               callingSoundRef.current.play().catch(e => console.warn("Ringtone blocked", e));
            }
          });

          socket.off('webrtc_answer');
          socket.on('webrtc_answer', async (data) => {
            console.log("Chat: Received Answer");
            // Stop calling sound once peer answers
            if (callingSoundRef.current) {
              callingSoundRef.current.pause();
              callingSoundRef.current.currentTime = 0;
            }
            if (peerConnectionRef.current && peerConnectionRef.current.signalingState === 'have-local-offer') {
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer || data));
              while (pendingIceCandidates.current.length > 0) {
                const candidate = pendingIceCandidates.current.shift();
                if (candidate) await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
              }
            }
          });

          socket.off('webrtc_ice_candidate');
          socket.on('webrtc_ice_candidate', async (data) => {
            if (peerConnectionRef.current && data) {
              if (peerConnectionRef.current.remoteDescription) {
                try {
                  await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data));
                } catch (e) {
                  console.error('Error adding received ice candidate', e);
                }
              } else {
                pendingIceCandidates.current.push(data);
              }
            }
          });

          socket.off('webrtc_end_call');
          socket.on('webrtc_end_call', () => {
            console.log("Chat: Peer ended the call");
            cleanupWebRTC();
          });

          socket.off('webrtc_reject_call');
          socket.on('webrtc_reject_call', () => {
            console.log("Chat: Peer rejected the call");
            cleanupWebRTC();
            alert("Call was declined.");
          });

          // --- Deletion Logic Listeners ---
          socket.off('lobby_delete_requested');
          socket.on('lobby_delete_requested', (data) => {
            setDeleteRequest(data);
          });

          socket.off('lobby_delete_approved');
          socket.on('lobby_delete_approved', async (data) => {
            alert("Lobby deletion approved. Closing lobby.");
            try { await api.delete(`/swaps/${data.roomId}`); } catch(e){}
            setRooms(prev => prev.filter(r => r._id !== data.roomId));
            // Instead of directly checking activeRoomId from closure, let the UI handle the unset or check using setter function
            setActiveRoomId((prevId) => prevId === data.roomId ? null : prevId);
          });

          socket.off('lobby_delete_rejected');
          socket.on('lobby_delete_rejected', (data) => {
            alert(`${data.rejecterName} refused to delete the lobby.`);
          });
        };

        setupWebRTCListeners();

      } catch (err: any) {
        if (err.response?.status === 401) router.push('/login');
      }
    };

    initUserData();
    
    return () => {
      // DO NOT disconnect the singleton socket here
      // Just cleanup listeners if they are specific to this component
      socket.off('newMessage');
      socket.off('webrtc_answer');
      socket.off('webrtc_ice_candidate');
      socket.off('webrtc_end_call');
      socket.off('webrtc_reject_call');
      cleanupWebRTC();
    };
  }, []); // Only once on mount

  // Room Specific Logic
  useEffect(() => {
    if (activeRoomId && socket) {
      cleanupWebRTC();
      socket.emit('joinRoom', { roomId: activeRoomId });
      
      api.get(`/messages/${activeRoomId}`)
        .then(res => {
          setMessages(res.data);
          // Mark unread messages sent by the other user as read
          const unreadMsgs = res.data.filter((m: any) => m.sender !== currentUser._id && m.status !== 'read');
          unreadMsgs.forEach((m: any) => {
             socket.emit('markAsRead', { messageId: m._id, roomId: activeRoomId });
          });
        })
        .catch(err => console.error(err));

      // Update message listener for the active room
      socket.off('newMessage');
      socket.on('newMessage', (message: any) => {
        if (message.chatRoomId === activeRoomId || message.roomId === activeRoomId) {
          setMessages(prev => [...prev, message]);
          if (message.sender !== currentUser._id) {
            socket.emit('markAsRead', { messageId: message._id, roomId: activeRoomId });
          }
        }
      });
      socket.off('messageStatusUpdate');
      socket.on('messageStatusUpdate', (data: any) => {
        if (data.roomId === activeRoomId) {
          setMessages(prev => prev.map(m => m._id === data.messageId ? { ...m, status: data.status, isRead: data.status === 'read' } : m));
        }
      });
      socket.off('messageEdited');
      socket.on('messageEdited', (updatedMsg: any) => {
        setMessages(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
      });
      socket.off('messageDeleted');
      socket.on('messageDeleted', (updatedMsg: any) => {
        setMessages(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
      });
    }

    return () => {
      if (socket) {
        socket.off('newMessage');
        socket.off('messageStatusUpdate');
        socket.off('messageEdited');
        socket.off('messageDeleted');
      }
    };
  }, [activeRoomId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'document') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Maximum size is 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment({
        url: reader.result as string,
        fileType,
        fileName: file.name
      });
      setShowAttachMenu(false);
    };
    reader.readAsDataURL(file);
  };

  const startEditing = (msg: any) => {
    setEditingMessageId(msg._id);
    setNewMessage(msg.content || "");
    setShowDropdownFor(null);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setNewMessage("");
  };

  const handleDeleteMessage = async (msgId: string, type: 'me' | 'everyone') => {
    try {
      const res = await api.delete(`/messages/${msgId}?type=${type}`);
      setShowDropdownFor(null);
      if (type === 'me') {
        setMessages(prev => prev.filter(m => m._id !== msgId));
      } else {
        if (socketRef.current) socketRef.current.emit('deleteMessage', res.data);
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting message.");
    }
  };

  const handleClearChat = async () => {
    if (!confirm("Are you sure you want to completely wipe out this chat history? This cannot be undone (but it won't delete the other user's history).")) return;
    try {
      await api.delete(`/messages/room/${activeRoomId}/clear`);
      setMessages([]);
      setShowLobbyMenu(false);
    } catch (e) {
      console.error(e);
      alert("Failed to clear chat history.");
    }
  };

  const handleSend = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    
    const textToSend = typeof e === 'string' ? e : newMessage;
    if ((!textToSend.trim() && !attachment) || !activeRoomId) return;

    try {
      if (editingMessageId && !attachment) {
        // Edit mode (text only)
        const res = await api.put(`/messages/${editingMessageId}`, { content: textToSend });
        if (socketRef.current) socketRef.current.emit('editMessage', res.data);
        setEditingMessageId(null);
      } else {
        // New Message mode
        const res = await api.post(`/messages/${activeRoomId}`, {
          content: textToSend,
          attachment
        });
        if (socketRef.current) socketRef.current.emit('sendMessage', res.data);
      }
      
      setNewMessage("");
      setShowQuickChat(false);
      setShowEmojiPicker(false);
      setAttachment(null);
    } catch (error) {
      console.error(error);
    }
  };

  // --- WebRTC Logic ---
  const initializePeerConnection = () => {
    // For production, using a TURN server is essential for NAT traversal.
    // Replace with your own TURN credentials (e.g., from Twilio, XirSys, or Metered.ca)
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443?transport=tcp',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('webrtc_ice_candidate', {
          targetUserId: otherUser?._id,
          roomId: activeRoomId,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  };

  const startStream = async (type: 'video' | 'audio' = 'video') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: type === 'video', 
        audio: true 
      });
      localStreamRef.current = stream;
      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }
      setIsVideoMuted(type === 'audio');
      return stream;
    } catch (err: any) {
      console.error("Error accessing media devices.", err);
      if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        alert("Device Error: Your Camera or Microphone is already in use by another tab or application. Please close other apps using the camera and try again.");
      } else {
        alert("Microphone/Camera access required for calls. Please check your browser permissions.");
      }
      return null;
    }
  };

  const initiateCall = async (type: 'video' | 'audio' = 'video') => {
    if (!otherUser) return;
    setIsVideoCallActive(true);
    
    // Play calling sound
    callingSoundRef.current?.play().catch(e => console.error("Audio play failed:", e));

    const stream = await startStream(type);
    if (!stream) {
      setIsVideoCallActive(false);
      callingSoundRef.current?.pause();
      return;
    }

    const pc = initializePeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    console.log("Initiating call to:", otherUser._id, otherUser.username);
    socketRef.current?.emit('webrtc_offer', {
      targetUserId: otherUser._id.toString(),
      roomId: activeRoomId,
      offer: offer,
      callType: type,
      callerInfo: {
        _id: currentUser._id,
        username: currentUser.username
      }
    });
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    
    // Stop ringtone immediately on accept
    if (callingSoundRef.current) {
      callingSoundRef.current.pause();
      callingSoundRef.current.currentTime = 0;
    }

    setActiveRoomId(incomingCall.roomId); // Switch to the room where call is coming from
    setIsVideoCallActive(true);
    
    const stream = await startStream(incomingCall.callType);
    if (!stream) {
      setIsVideoCallActive(false);
      return;
    }

    // Small delay to ensure state and socket are ready
    setTimeout(() => {
    }, 500);

    const pc = initializePeerConnection();
    await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
    
    // Process pending candidates
    console.log("Processing pending candidates after Accept:", pendingIceCandidates.current.length);
    while (pendingIceCandidates.current.length > 0) {
      const candidate = pendingIceCandidates.current.shift();
      if (candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socketRef.current?.emit('webrtc_answer', {
      targetUserId: incomingCall.callerInfo._id,
      roomId: incomingCall.roomId,
      answer: answer
    });

    setIncomingCall(null);
  };

  const rejectCall = () => {
    if (incomingCall && socketRef.current) {
      socketRef.current.emit('webrtc_reject_call', {
        targetUserId: incomingCall.callerInfo._id
      });
    }
    setIncomingCall(null);
  };

  const endCall = () => {
    if (socketRef.current && otherUser) {
      socketRef.current.emit('webrtc_end_call', {
        targetUserId: otherUser._id,
        roomId: activeRoomId
      });
    }
    cleanupWebRTC();
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  const initiateLobbyDelete = () => {
    if (!otherUser || !activeRoomId) return;
    if (confirm("Are you sure you want to request deletion of this lobby? Both players must agree.")) {
      socketRef.current?.emit('request_lobby_delete', {
        roomId: activeRoomId,
        targetUserId: otherUser._id,
        requesterId: currentUser._id,
        requesterName: currentUser.username
      });
      alert("Sent deletion request to the other player.");
    }
  };

  const handleApproveDelete = async () => {
    if (!deleteRequest) return;
    socketRef.current?.emit('approve_lobby_delete', {
      roomId: deleteRequest.roomId,
      targetUserId: deleteRequest.targetUserId
    });
    try { await api.delete(`/swaps/${deleteRequest.roomId}`); } catch(e){}
    alert("Lobby deleted.");
    setRooms(prev => prev.filter(r => r._id !== deleteRequest.roomId));
    if (activeRoomId === deleteRequest.roomId) setActiveRoomId(null);
    setDeleteRequest(null);
  };

  const handleRejectDelete = () => {
    if (!deleteRequest) return;
    socketRef.current?.emit('reject_lobby_delete', {
      roomId: deleteRequest.roomId,
      targetUserId: deleteRequest.targetUserId,
      rejecterName: currentUser.username
    });
    setDeleteRequest(null);
  };

  if (!currentUser) return null;

  const groupedMessages = messages.reduce((acc, msg) => {
    const dateStr = new Date(msg.createdAt || Date.now()).toLocaleDateString([], {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(msg);
    return acc;
  }, {} as Record<string, typeof messages>);

  return (
    <>
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#0b141a]">
        <StarBackground className="opacity-100" />
      </div>
      <div className="container mx-auto px-0 sm:px-4 py-4 sm:py-8 mt-10 h-[calc(100vh-6rem)] flex gap-4 sm:gap-6 relative z-10 font-sans">
      {/* Incoming Call Overlay */}
      <AnimatePresence>
        {incomingCall && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm glass border-4 border-secondary rounded-3xl p-6 shadow-[0_0_50px_rgba(255,0,255,0.4)]"
          >
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-secondary/20 border-2 border-secondary flex items-center justify-center font-black text-2xl text-secondary animate-pulse">
                  {incomingCall.callerInfo.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                    Incoming {incomingCall.callType} Call
                  </p>
                  <h3 className="text-xl font-black uppercase text-white tracking-wider">
                    {incomingCall.callerInfo.username}
                  </h3>
                </div>
             </div>
             <div className="flex gap-3 mt-6">
                <button 
                  onClick={acceptCall}
                  className="flex-1 bg-primary py-3 rounded-xl text-black font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-[0_0_20px_#39ff1480]"
                >
                  Accept
                </button>
                <button 
                  onClick={rejectCall}
                  className="flex-1 bg-red-600/20 border-2 border-red-600/50 py-3 rounded-xl text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-600 hover:text-white transition-all"
                >
                  Decline
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Request Modal */}
      <AnimatePresence>
        {deleteRequest && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm glass border-4 border-red-600 rounded-3xl p-6 shadow-[0_0_50px_rgba(255,0,0,0.4)] bg-[#050c08]"
          >
             <div className="flex flex-col items-center gap-4 text-center">
                <Trash2 className="w-12 h-12 text-red-500 animate-pulse" />
                <div>
                  <h3 className="text-xl font-black uppercase text-white tracking-wider">
                    Deletion Request
                  </h3>
                  <p className="text-sm font-mono text-gray-300 mt-2">
                    <span className="text-red-400 font-bold">{deleteRequest.requesterName}</span> wants to permanently end this swap & delete the lobby.
                  </p>
                </div>
             </div>
             <div className="flex gap-3 mt-6">
                <button 
                  onClick={handleApproveDelete}
                  className="flex-1 bg-red-600 py-3 rounded-xl text-white font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-[0_0_20px_#ff000080]"
                >
                  Approve
                </button>
                <button 
                  onClick={handleRejectDelete}
                  className="flex-1 bg-gray-600/20 border-2 border-gray-600/50 py-3 rounded-xl text-gray-300 font-black uppercase tracking-widest text-xs hover:bg-gray-600 hover:text-white transition-all"
                >
                  Decline
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Lobby Sidebar */}
      <div className={`w-full md:w-1/3 md:max-w-sm rounded-2xl flex flex-col overflow-hidden z-10 bg-[#111b21] border border-[#202c33] shadow-lg ${activeRoomId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-[#202c33] bg-[#202c33]">
          <h2 className="font-bold text-[#e9edef] flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#00a884]" /> Chats
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {rooms.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4 text-primary">
              <span className="text-4xl">🎮</span>
              <p className="text-center text-sm uppercase font-bold tracking-widest">No Active Lobbies.<br/>Find Swaps in Explore.</p>
            </div>
          )}
          {rooms.map((room) => {
            const contact = room.requester._id === currentUser._id ? room.receiver : room.requester;
            const isActive = activeRoomId === room._id;
            
            return (
              <motion.div 
                whileHover={{ backgroundColor: isActive ? '#2a3942' : '#202c33' }}
                whileTap={{ scale: 0.99 }}
                key={room._id} 
                onClick={() => setActiveRoomId(room._id)}
                className={`p-3 cursor-pointer transition-all border-b border-[#202c33] last:border-0 relative overflow-hidden ${
                  isActive ? 'bg-[#2a3942]' : 'bg-transparent'
                }`}
              >
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-[#00a884]">
                      {contact.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[15px] text-[#e9edef] truncate max-w-[120px]">
                        {contact.username}
                      </span>
                      <span className="text-[13px] text-[#8696a0] truncate mt-0.5">
                        {room.skillOffered?.skillName || 'Lobby'}
                      </span>
                    </div>
                  </div>
                  {isActive && <span className="h-2 w-2 rounded-full bg-[#00a884]" />}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Active Game Chat Room */}
      <div className={`flex-1 rounded-2xl flex-col relative overflow-hidden z-10 bg-transparent sm:bg-black/40 sm:border border-[#202c33] shadow-xl ${!activeRoomId ? 'hidden md:flex' : 'flex'}`}>
        {!activeRoomId ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#0b141a]">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
              <Zap className="w-16 h-16 mb-6 opacity-20 text-gray-500" />
            </motion.div>
            <h2 className="text-xl font-light text-[#e9edef] mb-2">SkillSwap for Web</h2>
            <p className="text-sm text-[#8696a0]">Select a chat to start messaging</p>
          </div>
        ) : (
          <>
            {/* Lobby Header */}
            <div className="h-16 border-b border-[#202c33] flex items-center px-4 bg-[#202c33] z-10">
              <div className="flex items-center gap-4 w-full">
                <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center font-bold text-white shadow-sm">
                  {otherUser?.username?.substring(0,1).toUpperCase() || 'TX'}
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setActiveRoomId(null)}
                      className="md:hidden p-2 -ml-2 text-[#aebac1] hover:text-[#e9edef] transition-colors"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                      <h2 className="font-semibold text-[16px] text-[#e9edef] leading-tight">{otherUser?.username}</h2>
                      <p className="text-[11px] text-[#00a884] font-medium">online</p>
                    </div>
                  </div>
                  {/* WebRTC Call Init Buttons */}
                  {!isVideoCallActive && !incomingCall && (
                    <div className="flex gap-4 items-center relative">
                      <button 
                        onClick={() => setShowLobbyMenu(!showLobbyMenu)}
                        className="p-2 text-[#aebac1] hover:text-[#e9edef] hover:bg-white/10 rounded-full transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 pointer-events-none" />
                      </button>

                      <AnimatePresence>
                        {showLobbyMenu && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute top-10 right-0 w-48 bg-[#233138] rounded-xl shadow-2xl py-2 z-50 border border-[#202c33]"
                          >
                            <button onClick={() => { initiateCall('audio'); setShowLobbyMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-[#111b21] text-[#e9edef] text-sm flex items-center gap-3">
                              <Mic className="w-4 h-4" /> Voice Call
                            </button>
                            <button onClick={() => { initiateCall('video'); setShowLobbyMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-[#111b21] text-[#e9edef] text-sm flex items-center gap-3">
                              <Video className="w-4 h-4" /> Video Call
                            </button>
                            <button onClick={handleClearChat} className="w-full text-left px-4 py-3 hover:bg-[#111b21] text-[#e9edef] text-sm flex items-center gap-3 border-t border-white/5 mt-1 pt-2">
                              <Eraser className="w-4 h-4" /> Clear Chat
                            </button>
                            <button onClick={() => { setShowLobbyMenu(false); setActiveRoomId(null); }} className="w-full text-left px-4 py-3 hover:bg-[#111b21] text-[#e9edef] text-sm flex items-center gap-3">
                              <X className="w-4 h-4" /> Close Lobby
                            </button>
                            <button onClick={() => { setShowLobbyMenu(false); initiateLobbyDelete(); }} className="w-full text-left px-4 py-3 hover:bg-[#111b21] text-red-500 text-sm flex items-center gap-3 border-t border-white/5 mt-1 pt-2">
                              <Trash2 className="w-4 h-4" /> Delete Lobby
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* WhatsApp Style Video Call Overlay */}
            <AnimatePresence>
              {isVideoCallActive && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 z-[100] bg-[#0b141a] flex flex-col overflow-hidden"
                >
                  {/* Background: Remote Video */}
                  <div className="absolute inset-0 z-0">
                    <video 
                      ref={isLocalMain ? localVideoRef : remoteVideoRef} 
                      playsInline 
                      muted={isLocalMain}
                      onLoadedMetadata={e => { e.currentTarget.play().catch(() => {}); }}
                      className={`w-full h-full object-cover transition-all duration-700 ${isLocalMain ? 'transform scale-x-[-1]' : ''} ${((!isLocalMain && isVideoMuted) || (isLocalMain && isVideoMuted)) ? 'opacity-0' : 'opacity-100'}`}
                    />
                    
                    {/* Remote Muted Overlay */}
                    {((!isLocalMain && isVideoMuted) || (isLocalMain && isVideoMuted)) && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a1a0f] to-[#050c08]">
                        <div className="w-32 h-32 rounded-full bg-[#202c33] border-2 border-[#00a884]/30 flex items-center justify-center text-5xl font-bold text-[#e9edef] shadow-2xl">
                          {(isLocalMain ? currentUser : otherUser)?.username.charAt(0).toUpperCase()}
                        </div>
                        <p className="mt-8 text-[#00a884] font-mono text-xs uppercase tracking-[0.3em] animate-pulse">Connection Secured</p>
                      </div>
                    )}
                  </div>

                  {/* Header Overlay */}
                  <div className="absolute top-0 left-0 right-0 p-6 flex flex-col items-center z-20 bg-gradient-to-b from-black/60 to-transparent">
                    <div className="flex items-center gap-2 text-white/60 mb-1">
                      <Lock className="w-3 h-3" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">End-to-end encrypted</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{otherUser?.username}</h2>
                    <p className="text-[#00a884] text-xs font-medium mt-1">Video Call</p>
                  </div>

                  {/* Floating PiP: Local Video */}
                  <motion.div 
                    drag
                    dragConstraints={{ left: -300, right: 0, top: 0, bottom: 500 }}
                    className="absolute top-24 right-4 w-28 sm:w-40 aspect-[3/4] bg-[#111b21] border-2 border-white/10 rounded-2xl overflow-hidden shadow-2xl z-30 cursor-move"
                    onClick={() => setIsLocalMain(!isLocalMain)}
                  >
                    <video 
                      ref={isLocalMain ? remoteVideoRef : localVideoRef} 
                      playsInline 
                      muted={!isLocalMain}
                      onLoadedMetadata={e => { e.currentTarget.play().catch(() => {}); }}
                      className={`w-full h-full object-cover ${!isLocalMain ? 'transform scale-x-[-1]' : ''}`} 
                    />
                    {((isLocalMain && isVideoMuted) || (!isLocalMain && isVideoMuted)) && (
                       <div className="absolute inset-0 bg-[#202c33] flex items-center justify-center">
                          <VideoOff className="w-6 h-6 text-[#aebac1]" />
                       </div>
                    )}
                  </motion.div>

                  {/* Footer Controls */}
                  <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-8 z-40">
                    <div className="flex items-center gap-6 p-4 px-8 bg-[#202c33]/90 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl">
                      <button 
                        onClick={() => setIsCallMinimized(!isCallMinimized)} 
                        className="p-4 text-[#aebac1] hover:text-[#e9edef] transition-all hover:bg-white/5 rounded-full"
                      >
                        <Minimize2 className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={toggleVideo} 
                        className={`p-4 rounded-full transition-all ${isVideoMuted ? 'bg-white/10 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        {isVideoMuted ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                      </button>
                      <button 
                        onClick={toggleMic} 
                        className={`p-4 rounded-full transition-all ${isMicMuted ? 'bg-white/10 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        {isMicMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                      </button>
                      <button 
                        onClick={endCall} 
                        className="p-5 bg-[#ea0038] hover:bg-[#ff0040] text-white rounded-full transition-all shadow-[0_8px_25px_rgba(234,0,56,0.4)] hover:scale-110 active:scale-95"
                      >
                        <PhoneOff className="w-7 h-7" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat View Area */}
            <div className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 font-sans relative ${isVideoCallActive && !isCallMinimized ? 'max-h-64 sm:max-h-none' : ''}`}>
              
              {/* System Intro Message */}
              <div className="flex justify-center my-6">
                <span className="bg-[#182229] text-[#8696a0] px-3 py-1.5 rounded-lg text-xs uppercase tracking-widest font-semibold shadow-sm">
                  ⚡ LOBBY ESTABLISHED
                </span>
              </div>

              {Object.entries(groupedMessages as Record<string, any[]>).map(([dateLabel, msgs]) => (
                <div key={dateLabel} className="space-y-4">
                  <div className="flex justify-center my-4">
                    <span className="bg-[#182229] text-[#8696a0] px-3 py-1 text-[11px] uppercase tracking-wider rounded-lg font-bold shadow-sm">
                      {dateLabel}
                    </span>
                  </div>
                  {msgs.map((msg: any, index: number) => {
                    const isMe = msg.sender === currentUser._id;
                    
                    return (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        key={msg._id || index}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}
                      >
                        <div className={`max-w-[85%] sm:max-w-[70%] px-3 py-2 text-[15px] relative group overflow-visible shadow-sm flex flex-col ${
                          isMe 
                            ? 'bg-[#005c4b] text-[#e9edef] rounded-xl rounded-br-sm' 
                            : 'bg-[#202c33] text-[#e9edef] rounded-xl rounded-bl-sm'
                        }`}>
                          
                          {/* Context Menu Trigger */}
                          <div className={`absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 ${showDropdownFor === msg._id ? 'opacity-100' : ''}`}>
                            <button
                              onClick={() => setShowDropdownFor(showDropdownFor === msg._id ? null : msg._id)}
                              className="p-1 text-white/70 hover:text-white drop-shadow-md rounded-full bg-black/20"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Context Menu Dropdown */}
                          <AnimatePresence>
                            {showDropdownFor === msg._id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`absolute top-8 ${isMe ? 'right-4' : 'left-4'} w-48 bg-[#233138] rounded-lg shadow-xl z-50 py-2 border border-[#202c33]`}
                              >
                                {isMe && !msg.attachment && !msg.isDeleted && (
                                  <button onClick={() => startEditing(msg)} className="w-full text-left px-4 py-2 hover:bg-[#111b21] text-[#e9edef] text-sm flex items-center gap-3">
                                    <Edit2 className="w-4 h-4" /> Edit
                                  </button>
                                )}
                                <button onClick={() => handleDeleteMessage(msg._id, 'me')} className="w-full text-left px-4 py-2 hover:bg-[#111b21] text-[#e9edef] text-sm flex items-center gap-3">
                                  <Trash className="w-4 h-4" /> Delete for me
                                </button>
                                {isMe && (
                                  <button onClick={() => handleDeleteMessage(msg._id, 'everyone')} className="w-full text-left px-4 py-2 hover:bg-[#111b21] text-red-500 text-sm flex items-center gap-3">
                                    <Trash2 className="w-4 h-4" /> Delete for everyone
                                  </button>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {msg.isDeleted ? (
                            <div className="flex items-center gap-2 italic text-[#8696a0] opacity-80 py-1 pr-6">
                              <span className="text-[16px]">🚫</span>
                              <span className="text-sm">This message was deleted</span>
                            </div>
                          ) : (
                            <>
                              {msg.attachment && msg.attachment.fileType === 'image' && (
                                <ImageAttachment url={msg.attachment.url} fileName={msg.attachment.fileName} />
                              )}
                              {msg.attachment && msg.attachment.fileType === 'document' && (
                                <a href={msg.attachment.url} download={msg.attachment.fileName} className="flex items-center gap-3 p-3 mb-1 mt-1 bg-black/20 rounded-lg border border-white/5 hover:bg-black/30 transition cursor-pointer">
                                  <File className={`w-8 h-8 ${isMe ? 'text-[#e9edef]' : 'text-[#8696a0]'}`} />
                                  <div className="flex-1 truncate">
                                    <p className="font-semibold text-sm truncate max-w-[150px]">{msg.attachment.fileName}</p>
                                    <p className="text-[11px] opacity-70 uppercase tracking-wider">Document</p>
                                  </div>
                                  <Download className="w-4 h-4 text-[#8696a0] hover:text-[#e9edef]" />
                                </a>
                              )}
                              {msg.content && <p className="leading-snug pr-20 whitespace-pre-wrap">{msg.content}</p>}
                            </>
                          )}

                          <div className={`text-[10px] mt-1 text-[#8696a0] absolute bottom-1.5 right-2 font-medium flex items-center gap-1.5 ${isMe && !msg.content && !msg.isDeleted ? 'text-white/70 drop-shadow-md' : ''}`}>
                            {msg.isEdited && !msg.isDeleted && <span className="italic opacity-80">edited</span>}
                            <span>{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            {isMe && !msg.isDeleted && (
                              <span className="ml-[2px] mb-[1px]">
                                {(msg.status === 'read' || msg.isRead) ? (
                                  <CheckCheck className="w-[14px] h-[14px] text-blue-400" />
                                ) : msg.status === 'delivered' ? (
                                  <CheckCheck className="w-[14px] h-[14px] text-gray-400" />
                                ) : (
                                  <Check className="w-[14px] h-[14px] text-gray-400" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="p-3 sm:px-5 bg-[#202c33] border-t border-[#111b21] relative z-30 flex items-end">
              
              {/* Attachment Preview UI */}
              <AnimatePresence>
                {attachment && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute bottom-[calc(100%+8px)] left-6 p-2 bg-[#2a3942] rounded-xl shadow-lg flex items-center gap-3 max-w-sm z-20 border border-[#202c33]"
                  >
                    <button onClick={() => setAttachment(null)} className="absolute -top-2 -right-2 bg-[#111b21] text-[#aebac1] hover:text-white border border-[#202c33] p-1 rounded-full shadow-md transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                    {attachment.fileType === 'image' ? (
                       <img src={attachment.url} alt="preview" className="w-12 h-12 rounded-lg object-cover border border-black/20" />
                    ) : (
                       <div className="w-12 h-12 rounded-lg bg-black/20 flex flex-col items-center justify-center border border-black/10">
                         <FileText className="w-6 h-6 text-[#aebac1]" />
                       </div>
                    )}
                    <div className="flex-1 truncate">
                      <p className="text-[13px] font-semibold text-[#e9edef] truncate w-32">{attachment.fileName}</p>
                      <p className="text-[11px] text-[#8696a0] tracking-wide uppercase">{attachment.fileType}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Emoji Picker Popup */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute bottom-[calc(100%+8px)] left-4 z-40 shadow-2xl rounded-2xl overflow-hidden pointer-events-auto"
                  >
                    <EmojiPicker 
                      theme={EmojiTheme.DARK} 
                      onEmojiClick={(emojiData) => setNewMessage(prev => prev + emojiData.emoji)} 
                      lazyLoadEmojis={true}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Attach Dropdown Menu */}
              <AnimatePresence>
                {showAttachMenu && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute bottom-[calc(100%+16px)] left-16 z-40 bg-[#233138] rounded-xl shadow-xl py-3 px-2 flex flex-col gap-1 min-w-[160px] border border-[#202c33]"
                  >
                    <div className="flex justify-between items-center mb-2 px-2 border-b border-white/5 pb-2">
                       <span className="text-xs uppercase font-black tracking-widest text-[#8696a0]">Attach</span>
                       <button 
                         type="button"
                         onClick={() => setShowAttachMenu(false)}
                         className="w-6 h-6 flex items-center justify-center bg-red-500/20 hover:bg-red-500 text-white rounded-full transition-all hover:scale-110"
                       >
                         <X className="w-3 h-3" />
                       </button>
                    </div>
                    <button 
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-[#111b21] rounded-lg text-[#e9edef] font-medium text-[15px] transition-colors"
                    >
                      <ImageIcon className="w-5 h-5 text-blue-500" /> Photos
                    </button>
                    <button 
                      type="button"
                      onClick={() => docInputRef.current?.click()}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-[#111b21] rounded-lg text-[#e9edef] font-medium text-[15px] transition-colors"
                    >
                      <FileText className="w-5 h-5 text-purple-500" /> Document
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSend} className="flex gap-2 items-center w-full">
                {/* Hidden File Inputs */}
                <input type="file" ref={photoInputRef} accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                <input type="file" ref={docInputRef} accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => handleFileUpload(e, 'document')} />

                <button 
                  type="button"
                  onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowAttachMenu(false); setShowQuickChat(false); }}
                  className={`p-2 sm:p-3 shrink-0 rounded-full transition-colors ${showEmojiPicker ? 'text-[#00a884] bg-white/5' : 'text-[#aebac1] hover:text-[#e9edef]'}`}
                >
                  <Smile className="h-6 w-6" />
                </button>

                <button 
                  type="button"
                  onClick={() => { setShowAttachMenu(!showAttachMenu); setShowEmojiPicker(false); setShowQuickChat(false); }}
                  className={`p-2 sm:p-3 shrink-0 mx-1 rounded-full transition-colors ${showAttachMenu ? 'text-[#00a884] bg-white/5' : 'text-[#aebac1] hover:text-[#e9edef]'}`}
                >
                  <Paperclip className="h-5 w-5 -rotate-45 transform" />
                </button>
                
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message"
                  className="flex-1 min-w-0 bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] px-4 py-2.5 sm:py-3 rounded-lg focus:outline-none text-[15px]"
                />
                
                <button
                  type="submit"
                  disabled={!newMessage.trim() && !attachment}
                  className="p-3 bg-[#00a884] text-white rounded-full ml-1 disabled:opacity-0 disabled:scale-0 shrink-0 transition-all hover:bg-[#029777] active:scale-95"
                >
                  <Send className="h-5 w-5 ml-[2px]" />
                </button>
              </form>
              {editingMessageId && (
                <div className="absolute bottom-full left-0 right-0 bg-[#202c33] border-t border-[#111b21] p-2 flex items-center justify-between px-6 text-sm">
                  <div className="flex items-center gap-2 text-[#00a884]">
                    <Edit2 className="w-4 h-4" />
                    <span>Editing message</span>
                  </div>
                  <button onClick={cancelEditing} className="text-[#8696a0] hover:text-[#e9edef] p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b141a] flex items-center justify-center text-[#00a884] font-bold tracking-widest uppercase">Loading Chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
