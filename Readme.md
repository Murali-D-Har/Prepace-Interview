# PrepAce — AI-Powered Interview Practice App
## 🌐 Live Demo

[Visit PrepAce](https://prepace-frontend.vercel.app) | [API Health](https://prepace-backend.vercel.app/health)

![PrepAce Banner](https://img.shields.io/badge/PrepAce-Interview%20Practice-c8f135?style=for-the-badge&labelColor=0a0a10)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-F55036?style=flat-square&logo=groq)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

> A full-stack interview preparation platform with AI-powered answer feedback, streak tracking, session history, and a competitive leaderboard.

---

## 📸 Screenshots

| Auth             | Dashboard                          | Practice                        |
| ---------------- | ---------------------------------- | ------------------------------- |
| Login & Register | Stats, category scores, weak areas | Timed sessions with AI feedback |

---

## ✨ Features

- 🤖 **AI Feedback** — Every answer is analyzed by Groq (Llama 3.3 70B) and scored out of 10 with strengths, improvements, and keyword detection
- ⏱ **3 Session Modes** — Timed (countdown per question), Relaxed (no timer), Mock (realistic simulation)
- 📚 **Question Bank** — 22 pre-seeded questions across 6 categories: Behavioral, Technical, HR, Situational, Leadership, Problem-Solving
- 🔥 **Streak Tracking** — Daily check-in system with current and longest streak
- 📊 **Performance Dashboard** — Avg score, category breakdown, weak area detection, 30-day trend
- 🏆 **Leaderboard** — Top 10 by average score (weekly/monthly/all-time) and top streaks
- 🔖 **Bookmarks** — Save answers for later review
- 💡 **Question of the Day** — A new question every day, no scheduling needed
- 🛡️ **JWT Auth** — Secure register/login with bcrypt password hashing
- 📱 **Responsive UI** — Works on desktop and mobile

---

## 🗂 Project Structure

```
prepace/
├── interview-practice-backend/     # Node.js + Express API
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── middleware/
│   │   └── auth.js                 # JWT protect + admin guard
│   ├── models/
│   │   ├── User.js                 # User schema (streak, prefs)
│   │   ├── Question.js             # Question schema
│   │   ├── Session.js              # Session schema
│   │   └── Answer.js               # Answer + AI feedback schema
│   ├── routes/
│   │   ├── auth.js                 # Register, login, profile
│   │   ├── questions.js            # CRUD, daily, random
│   │   ├── sessions.js             # Start, complete, history
│   │   ├── answers.js              # Submit answer → AI feedback
│   │   ├── feedback.js             # View + regenerate feedback
│   │   ├── stats.js                # Overview, trends, weak areas
│   │   ├── streak.js               # Daily check-in
│   │   └── leaderboard.js          # Score + streak boards
│   ├── services/
│   │   └── aiFeedback.js           # OpenAI integration
│   ├── seed.js                     # Seed 22 questions
│   ├── server.js                   # Entry point
│   └── package.json
│
└── prepace-frontend/               # Vanilla HTML + CSS + JS
    ├── index.html                  # Login / Register
    ├── css/
    │   ├── global.css              # Design system + layout
    │   ├── auth.css                # Auth page styles
    │   └── pages.css               # All page-specific styles
    ├── js/
    │   ├── app.js                  # API client, auth state, utils
    │   ├── auth.js                 # Login/register logic
    │   ├── dashboard.js            # Stats + daily question
    │   ├── practice.js             # Full session + AI feedback flow
    │   ├── history.js              # Session history
    │   └── leaderboard.js          # Leaderboard boards
    └── pages/
        ├── dashboard.html
        ├── practice.html
        ├── history.html
        └── leaderboard.html
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) (local) or a free [MongoDB Atlas](https://cloud.mongodb.com) cluster
- An [Groq API key](https://platform.groq.com/) _(optional — mock feedback works without it)_

---

### Backend Setup

**1. Clone the repository**

```bash
git clone https://github.com/Murali-D-Har/Prepace-Interview.git
cd prepace/interview-practice-backend
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/interview-practice
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
GROQ_API_KEY=sk-...        # Leave blank to use mock feedback
CLIENT_URL=http://localhost:3000
```

**4. Seed the question bank**

```bash
npm run seed
```

This populates MongoDB with 22 pre-written questions across all categories.

**5. Start the server**

```bash
npm run dev
```

The API will be running at `http://localhost:5000`

> ✅ Test it: Open `http://localhost:5000/health` in your browser — you should see `{"status":"ok"}`

---

### Frontend Setup

No build tools required. Just open the HTML files directly.

**1. Navigate to the frontend folder**

```bash
cd ../prepace-frontend
```

**2. Open in browser**

Simply double-click `index.html` in File Explorer, or open it with VS Code's Live Server extension.

**3. Make sure the backend is running first**, then register an account and start practicing!

---

## 🔌 API Reference

### Auth

| Method | Endpoint                    | Description                      |
| ------ | --------------------------- | -------------------------------- |
| POST   | `/api/auth/register`        | Create a new account             |
| POST   | `/api/auth/login`           | Login and receive JWT            |
| GET    | `/api/auth/me`              | Get current user profile         |
| PATCH  | `/api/auth/preferences`     | Update daily goal and categories |
| PATCH  | `/api/auth/change-password` | Change password                  |

### Questions

| Method | Endpoint                        | Description                        |
| ------ | ------------------------------- | ---------------------------------- |
| GET    | `/api/questions`                | List all questions (filterable)    |
| GET    | `/api/questions/daily`          | Get today's question of the day    |
| GET    | `/api/questions/random?count=5` | Get random questions for a session |
| POST   | `/api/questions`                | _(Admin)_ Create a question        |
| POST   | `/api/questions/bulk`           | _(Admin)_ Bulk upload questions    |

### Sessions

| Method | Endpoint                     | Description              |
| ------ | ---------------------------- | ------------------------ |
| POST   | `/api/sessions`              | Start a new session      |
| GET    | `/api/sessions`              | Get session history      |
| PATCH  | `/api/sessions/:id/complete` | Mark session as complete |
| PATCH  | `/api/sessions/:id/abandon`  | Abandon a session        |

### Answers

| Method | Endpoint                       | Description                       |
| ------ | ------------------------------ | --------------------------------- |
| POST   | `/api/answers`                 | Submit answer and get AI feedback |
| GET    | `/api/answers`                 | Get all user answers              |
| PATCH  | `/api/answers/:id/bookmark`    | Toggle bookmark                   |
| PATCH  | `/api/answers/:id/self-rating` | Set 1–5 star self-rating          |

### Stats

| Method | Endpoint                 | Description                        |
| ------ | ------------------------ | ---------------------------------- |
| GET    | `/api/stats/overview`    | Total answers, sessions, avg score |
| GET    | `/api/stats/by-category` | Score breakdown by category        |
| GET    | `/api/stats/progress`    | 30-day score trend                 |
| GET    | `/api/stats/weak-areas`  | Categories scoring below 6         |

### Streak & Leaderboard

| Method | Endpoint                       | Description                    |
| ------ | ------------------------------ | ------------------------------ |
| POST   | `/api/streak/check-in`         | Log daily activity             |
| GET    | `/api/streak`                  | Get current and longest streak |
| GET    | `/api/leaderboard?period=week` | Top 10 by avg score            |
| GET    | `/api/leaderboard/streaks`     | Top 10 by streak               |

---

## 🤖 AI Feedback Response

When you submit an answer, the AI returns:

```json
{
  "score": 7.5,
  "strengths": [
    "Clear use of STAR method",
    "Specific measurable outcome mentioned"
  ],
  "improvements": [
    "Could expand on stakeholder communication",
    "Add more context around the initial challenge"
  ],
  "summary": "Well-structured response with a concrete example. Consider elaborating on lessons learned.",
  "keywords": ["leadership", "communication", "result", "team"]
}
```

> If no Groq API key is set, the app automatically falls back to mock feedback so you can still develop and test locally.

---

## 🧰 Tech Stack

| Layer          | Technology                         |
| -------------- | ---------------------------------- |
| Backend        | Node.js, Express.js                |
| Database       | MongoDB, Mongoose                  |
| Authentication | JWT, bcryptjs                      |
| AI             | Groq (Llama 3.3 70B)               |
| Frontend       | Vanilla HTML, CSS, JavaScript      |
| Fonts          | Bebas Neue, Outfit, JetBrains Mono |
| Security       | Helmet, CORS, express-rate-limit   |

---

## 📦 NPM Scripts

```bash
npm run dev     # Start with nodemon (auto-restart on changes)
npm start       # Start in production mode
npm run seed    # Seed the database with 22 questions
```

---

## 🌱 Environment Variables

| Variable         | Description                 | Required |
| ---------------- | --------------------------- | -------- |
| `PORT`           | Server port (default: 5000) | No       |
| `MONGO_URI`      | MongoDB connection string   | ✅ Yes   |
| `JWT_SECRET`     | Secret for signing tokens   | ✅ Yes   |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d)  | No       |
| `GROQ_API_KEY`   | GROQ key for AI feedback    | No       |
| `CLIENT_URL`     | Frontend URL for CORS       | No       |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/my-feature`
3. Commit your changes — `git commit -m 'Add my feature'`
4. Push to the branch — `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

Built with ❤️ as a portfolio project to demonstrate full-stack development with AI integration.

> ⭐ If you found this project useful, please give it a star on GitHub!
