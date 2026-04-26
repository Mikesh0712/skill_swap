"use client";

import Link from "next/link";
import { GoogleTranslate } from "./GoogleTranslate";
import { useEffect, useState } from "react";
import { User, LogOut, MessageCircle, Home, Menu, X, Rocket, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import socket from "@/lib/socket";
import { AnimatePresence, motion } from "framer-motion";

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const LOGO_STYLES = [
    { font: "var(--font-pixel)", color: "from-primary to-blue-500" },
    { font: "var(--font-pixel)", color: "from-pink-500 to-purple-500" },
    { font: "var(--font-pixel)", color: "from-yellow-400 to-red-500" },
  ];
  const [logoIdx, setLogoIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogoIdx((prev) => (prev + 1) % LOGO_STYLES.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchProfile = () => {
      api.get("/users/profile")
        .then(res => setUser(res.data))
        .catch(() => setUser(null));
    };

    fetchProfile();
    window.addEventListener("auth-changed", fetchProfile);
    return () => window.removeEventListener("auth-changed", fetchProfile);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      socket.disconnect();
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth-changed"));
      setIsMenuOpen(false);
      alert("Session Terminated. Thank you for contributing to the Matrix. Farewell.");
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Explore", href: "/explore", icon: Rocket },
    { name: "Community", href: "/forum", icon: Shield },
    ...(user ? [{ name: "Comms", href: "/chat", icon: MessageCircle }] : []),
  ];

  return (
    <header className="fixed top-0 w-full z-50 border-b-4 border-foreground dark:border-primary bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-black text-2xl md:text-3xl tracking-tighter flex items-center gap-2 transition-all duration-1000"
          style={{ fontFamily: LOGO_STYLES[logoIdx].font }}
          onClick={() => setIsMenuOpen(false)}
        >
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${LOGO_STYLES[logoIdx].color} drop-shadow-sm pb-1 transition-all duration-1000`}>
            SkillSwap
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-bold uppercase tracking-widest font-mono">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="transition-colors hover:text-primary text-foreground/70 dark:text-gray-300 flex items-center gap-1">
              <link.icon className="w-4 h-4" /> {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:block">
            <GoogleTranslate />
          </div>

          {user ? (
            <div className="flex items-center gap-2 md:gap-3">
              <Link
                href="/profile"
                className="hidden sm:inline-flex items-center justify-center border-2 border-foreground dark:border-primary text-xs md:text-sm font-bold uppercase tracking-wider transition-all focus-visible:outline-none text-foreground dark:text-white hover:bg-primary/10 h-10 px-3 md:px-4 bg-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_var(--primary)] pixel-text-alt"
              >
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Avatar" className="w-5 h-5 mr-2 object-cover border border-primary/50" />
                ) : (
                  <User className="w-4 h-4 mr-2" />
                )}
                <span className="max-w-[80px] truncate">{user.username}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 md:gap-3 font-mono">
              <Link href="/login" className="text-xs md:text-sm font-bold uppercase tracking-wider transition-colors hover:text-primary text-foreground/60 dark:text-gray-400">
                Log in
              </Link>
              <span className="text-gray-600 hidden xs:inline">|</span>
              <Link
                href="/signup"
                className="pixel-button h-9 md:h-10 text-[10px] md:text-sm flex items-center justify-center"
              >
                Assemble
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl border border-foreground/10 dark:border-white/10 glass text-foreground dark:text-white hover:bg-foreground/5 dark:hover:bg-white/5 transition-all"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/10 bg-background/95 backdrop-blur-2xl overflow-hidden"
          >
            <div className="container mx-auto px-4 py-8 flex flex-col gap-6 font-mono">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 text-xl font-black uppercase tracking-widest text-foreground/70 dark:text-white/70 hover:text-primary transition-colors pb-4 border-b border-foreground/5 dark:border-white/5"
                >
                  <link.icon className="w-6 h-6 text-primary" />
                  {link.name}
                </Link>
              ))}
              
              {user && (
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 text-xl font-black uppercase tracking-widest text-white/70 hover:text-primary transition-colors pb-4 border-b border-white/5"
                >
                  <User className="w-6 h-6 text-primary" />
                  Profile
                </Link>
              )}

              <div className="pt-4 flex flex-col gap-4">
                <GoogleTranslate />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
