"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await api.post("/auth/forgot-password", { email });
      if (res.status === 200) {
        setMessage("Password reset link has been sent to your email.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to process request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background px-4 py-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-72 md:h-72 bg-blue-500/20 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-72 md:h-72 bg-purple-500/20 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-6 md:p-8 rounded-2xl glass border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white">Reset Password</h2>
        <p className="text-sm text-foreground/80 mb-6 text-center">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20">{error}</div>}
        {message && <div className="p-3 mb-4 text-sm text-green-500 bg-green-500/10 rounded-md border border-green-500/20">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="name@example.com"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/60">
          Remember your password?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
