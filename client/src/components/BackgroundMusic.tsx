"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      api.get("/users/profile")
        .then(() => setIsAuthenticated(true))
        .catch(() => setIsAuthenticated(false));
    };

    checkAuth();
    window.addEventListener("auth-changed", checkAuth);
    return () => window.removeEventListener("auth-changed", checkAuth);
  }, []);

  useEffect(() => {
    // Initial loads
    const mutedValue = localStorage.getItem("bg-music-muted");
    const volumeValue = localStorage.getItem("bg-music-volume");
    
    setIsMuted(mutedValue === "true");

    if (audioRef.current) {
      audioRef.current.volume = volumeValue !== null ? parseFloat(volumeValue) : 1.0;
    }

    const handleStorageChange = () => {
      const currentlyMuted = localStorage.getItem("bg-music-muted") === "true";
      setIsMuted(currentlyMuted);
      
      if (audioRef.current) {
        if (!currentlyMuted && isAuthenticated) {
          audioRef.current.play().catch(e => {
            console.log("Autoplay prevented:", e.message);
          });
        } else {
          audioRef.current.pause();
        }
      }
    };

    const handleVolumeChange = (e: any) => {
      const newVol = e.detail?.volume;
      if (typeof newVol === 'number' && audioRef.current) {
        audioRef.current.volume = newVol;
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("bg-music-toggle", handleStorageChange);
    window.addEventListener("bg-music-volume-change", handleVolumeChange);

    // Browsers require interaction before playing audio
    const handleInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        handleStorageChange();
      }
    };

    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });

    // Initial attempt 
    setTimeout(handleStorageChange, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("bg-music-toggle", handleStorageChange);
      window.removeEventListener("bg-music-volume-change", handleVolumeChange);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [hasInteracted, isAuthenticated]);

  return (
    <audio 
      ref={audioRef} 
      src="/bg-music.mp3" 
      loop 
      preload="auto"
    />
  );
}
