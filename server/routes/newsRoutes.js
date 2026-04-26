import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    
    // If user hasn't provided an API key yet, return mock news so the UI doesn't break
    if (!apiKey) {
      return res.json({
        articles: [
          { title: "Placeholder: Please add NEWS_API_KEY to server/.env", url: "#", source: { name: "System" }, publishedAt: new Date().toISOString() },
          { title: "AI Agents take over repetitive coding tasks worldwide", url: "#", source: { name: "Tech Daily" }, publishedAt: new Date().toISOString() },
          { title: "Next.js 15 unveils revolutionary caching mechanisms", url: "#", source: { name: "Web Dev Weekly" }, publishedAt: new Date().toISOString() },
          { title: "The rise of Cyberneon: 2026 UI Trends", url: "#", source: { name: "Design Hub" }, publishedAt: new Date().toISOString() },
          { title: "WebRTC remains the gold standard for P2P video", url: "#", source: { name: "Network Eng News" }, publishedAt: new Date().toISOString() }
        ]
      });
    }

    // Example using NewsAPI.org structure. You can adjust the endpoint if they use GNews or something else.
    // Fetch top tech news
    const response = await axios.get(`https://newsapi.org/v2/top-headlines?category=technology&language=en&apiKey=${apiKey}`);
    
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ message: "Failed to fetch tech news" });
  }
});

export default router;
