"use client";

import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Swap Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active & Upcoming Sessions (Main Col) */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="text-primary" /> Upcoming Sessions
            </h2>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 rounded-xl glass border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div>
                    <h3 className="font-semibold text-lg">React Tips with Sarah J.</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-4 h-4" /> Tomorrow at 4:00 PM
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                      Join Video Call
                    </button>
                    <button className="flex-1 sm:flex-none px-4 py-2 rounded-md border border-input text-sm font-medium hover:bg-accent transition-colors">
                      Reschedule
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Completed Sessions</h2>
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-5 rounded-xl bg-background/40 border border-border flex justify-between items-center opacity-70"
              >
                <div>
                  <h3 className="font-medium">Node.js Basics with David</h3>
                  <p className="text-sm text-muted-foreground mt-1">Oct 12, 2023</p>
                </div>
                <div className="text-yellow-500 font-medium text-sm flex items-center gap-1">
                  Rated 5.0
                </div>
              </motion.div>
            </div>
          </section>
        </div>

        {/* Requests Sidebar */}
        <div className="space-y-8">
          <section className="p-6 rounded-2xl glass border border-white/5 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
            <div className="space-y-4">
              {[1].map((i) => (
                <div key={i} className="p-4 rounded-lg bg-background/50 border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-sm">Elena R. requests a swap</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">New</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Teach: Next.js <br/> Learn: Spanish
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-green-500/10 text-green-500 hover:bg-green-500/20 text-xs font-medium transition-colors">
                      <CheckCircle2 className="w-3 h-3" /> Accept
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-medium transition-colors">
                      <XCircle className="w-3 h-3" /> Decline
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="text-center text-sm text-muted-foreground pt-2">
                No more pending requests.
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
