# 🌐 SkillSwap Matrix

![SkillSwap Banner](https://img.shields.io/badge/Status-Live_Production-39ff14?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

> **A Peer-to-Peer Knowledge Exchange Platform.** Trade skills, not currency. 

### 🔗 **[Experience the Live Platform Here](https://skill-swap-iota-snowy.vercel.app)**

---

## 🎯 The Vision
In a world driven by micro-transactions, **SkillSwap** introduces a zero-currency economy for learning. It is a secure, real-time network where users can trade their expertise. You teach what you know, and in return, you learn what you want. 

This project was engineered to demonstrate full-stack proficiency, encompassing secure authentication, real-time bi-directional communication, and advanced responsive UI/UX design.

---

## 🚀 Key Features

*   **Real-Time WebRTC Communication:** Built-in peer-to-peer video and audio calling capabilities, allowing users to conduct teaching sessions directly in the browser without third-party plugins.
*   **Live Global Forum:** A community intranet powered by `Socket.io` and `MongoDB` for instantaneous data transmission, discussions, and skill-matching.
*   **Secure Authentication Architecture:** Features JWT-based authentication with highly secure, cross-domain `SameSite=None` cookies, elegantly handled via Next.js Edge Rewrites to bypass strict browser tracking protections.
*   **Immersive Matrix-Themed UI:** A meticulously crafted, responsive interface utilizing `Framer Motion` and `Tailwind CSS` to deliver a premium, cyberpunk aesthetic.
*   **Live Tech News Integration:** Dynamically fetches and displays the latest technology headlines to keep the community informed.

---

## 🛠️ Technical Stack & Architecture

### Frontend (Vercel)
*   **Framework:** Next.js (React)
*   **Styling:** Tailwind CSS + Custom Pixel Art Utilities
*   **Animations:** Framer Motion
*   **API Client:** Axios (Configured for secure cross-origin credentials)

### Backend (Render)
*   **Environment:** Node.js & Express.js
*   **Real-Time:** Socket.IO
*   **Database:** MongoDB Atlas + Mongoose
*   **Security:** bcryptjs (Password Hashing), jsonwebtoken (JWT), express-rate-limit, CORS

---

## 💡 Note for Recruiters & Hiring Managers

This platform was built as a comprehensive showcase of modern web engineering. Some specific technical challenges overcome during development include:

1.  **Cross-Origin Authentication:** Successfully implemented a robust architecture to allow secure HTTP-Only cookies to be passed between a Vercel-hosted frontend and a Render-hosted backend, bypassing modern browser third-party cookie restrictions using Next.js proxy rewrites.
2.  **WebRTC Signaling:** Engineered a custom signaling server using Socket.io to negotiate ICE candidates and SDP offers/answers, ensuring stable peer-to-peer video connections.
3.  **Performant UI/UX:** Utilized React `Suspense` boundaries to optimize static generation and ensure seamless client-side hydration, particularly for complex route parameters and animated components.

---

## 👨‍💻 Author

**Mikesh Kumar Pradhan**
*Full-Stack Web Developer*

[Connect on LinkedIn](https://www.linkedin.com/in/mikesh-kumar-pradhan-a16308294) | [Email Me](mailto:mikeshpradhan7@gmail.com)
