"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showBridge, setShowBridge] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.status === 200) {
        setShowBridge(true);
        window.dispatchEvent(new Event("auth-changed"));
        setTimeout(() => {
          router.push("/");
        }, 2500); // Delay to allow the bridge animation to play
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background px-4 py-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-72 md:h-72 bg-blue-500/20 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-72 md:h-72 bg-purple-500/20 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />

      {/* Animated Matrix Bridge */}
      {showBridge && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center pointer-events-none p-4"
        >
          <img src="/gif.gif" alt="Matrix Entry Bridge" className="w-[80%] md:w-[60%] lg:w-[40%] max-w-[500px] h-auto object-contain mix-blend-screen opacity-90 mx-auto" />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-6 md:p-8 rounded-2xl glass border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white">Welcome Back</h2>

        {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Email or Username</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="name@example.com or username"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-blue-500 hover:underline">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/60">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
