import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import ForumPost from '../models/ForumPost.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedForum = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillswap');
    console.log('MongoDB Connected for Seeding...');

    // Find a user to act as the author, or use the first one available
    const user = await User.findOne();
    
    if (!user) {
      console.error("No users found in database! Please create an account via the frontend first, then run this seeder.");
      process.exit(1);
    }

    const demoPosts = [
      {
        title: "The Rise of Agentic AI in 2026: Are we ready?",
        content: "I've been playing around with the latest autonomous coding agents lately and the speed is terrifyingly good. What are your thoughts on agentic workflows replacing junior dev tasks? Personally, I think it just shifts our focus from syntax to architecture, but I'd love to hear what the community thinks. Anyone actively using AI agents in production?",
        category: "Tech Skills",
        authorId: user._id,
        likes: [],
        comments: []
      },
      {
         title: "Why Next.js App Router is finally clicking for me",
         content: "For the longest time, migrating from Pages router felt like a chore. The whole Server Components vs Client Components mental model was frustrating. But after building SkillSwap, the layout paradigms and native caching just make sense. If you're struggling to learn App Router, my biggest tip: assume everything is a Server Component until it strictly needs interactivity (onClick, useState).",
         category: "Learning Tips",
         authorId: user._id,
         likes: [],
         comments: []
       },
       {
         title: "UI Trends: Is Glassmorphism here to stay?",
         content: "We're using a ton of glassmorphism and neon accents (Cyberneon style) in this platform. Does anyone feel like hyper-minimalist flat design is dying out in favor of these more immersive, textured interfaces? Or is this just a passing fad?",
         category: "Design",
         authorId: user._id,
         likes: [],
         comments: []
       },
       {
         title: "Bug Report: Video Call PiP overlay blocking chat on mobile",
         content: "Just noticed that when I'm in an active lobby and we start a video link, my local camera overlay sits right on top of the chat send button on smaller screens. Can we look into this? Temporary fix is to disable local video.",
         category: "Support",
         authorId: user._id,
         likes: [],
         comments: []
       },
       {
         title: "Feature Suggestion: Integrated Code Sandbox during Swaps",
         content: "It would be incredible if we could have a shared IDE or code execution sandbox directly within the Chat Lobby when we are swapping programming skills! Maybe something like CodeMirror integrated deeply?",
         category: "Suggestions",
         authorId: user._id,
         likes: [],
         comments: []
       }
    ];

    console.log("Wiping existing forum posts to seed fresh data...");
    await ForumPost.deleteMany({}); // Optional: clear old posts

    console.log("Seeding new tech/trending posts...");
    await ForumPost.insertMany(demoPosts);

    console.log('Forum Seeded Successfully! Data inserted.');
    process.exit();
  } catch (error) {
    console.error('Error with data seeding:', error);
    process.exit(1);
  }
};

seedForum();
