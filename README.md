# 🗺️ JobTrail AI

> **Never lose track of a job application again.**

JobTrail AI connects to your Gmail, reads job application confirmation emails, and automatically tracks every application using AI — zero manual entry, ever.

**Live Demo:** [jobtrail-ai-blush.vercel.app](https://jobtrail-ai-blush.vercel.app)

---

## 📸 Screenshots

| Landing Page | Dashboard | Applications |
|---|---|---|
| ![Landing](https://via.placeholder.com/300x200/0A0D0F/00C896?text=Landing+Page) | ![Dashboard](https://via.placeholder.com/300x200/0A0D0F/00C896?text=Dashboard) | ![Applications](https://via.placeholder.com/300x200/0A0D0F/00C896?text=Applications) |

---

## ✨ Features

- 🔐 **Google OAuth2** — Sign in with Google, read-only Gmail access
- 🤖 **AI Extraction** — Llama 3.3 70B extracts company, role, date, and status from emails
- 📥 **Inbox + Sent Scanning** — Tracks both received confirmations and emails you sent directly to companies
- 🔄 **Auto Sync** — Background cron job syncs every 15 minutes automatically
- 🔔 **Notifications** — Bell icon alerts you when you get Interview, Offer, or Under Review updates
- 🗑️ **Smart Deletion** — Deleted applications are permanently blacklisted and never re-synced
- 💬 **AI Chatbot** — Ask questions about your applications in natural language
- 🔍 **Search & Filter** — Filter by status, search by company or role
- 📊 **Dashboard Stats** — Visual overview of your entire job search
- 🚫 **Zero Duplicates** — Gmail message IDs prevent duplicate entries
- 🔒 **Read-Only Forever** — We never modify, send, or delete your emails

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **Auth** | Google OAuth2, Passport.js, express-session |
| **Email** | Gmail API (googleapis) — Read-Only |
| **AI** | Groq API — Llama 3.3 70B Versatile |
| **Scheduler** | node-cron |
| **Deployment** | Vercel (Frontend) + Render (Backend) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier works)
- Google Cloud Console project with Gmail API enabled
- Groq API key

### 1. Clone the repository

```bash
git clone https://github.com/mehulkumar06/jobtrail-ai.git
cd jobtrail-ai
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_GROQ_API_KEY=your_groq_api_key
```

Start the frontend:
```bash
npm run dev
```

### 4. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project → Enable **Gmail API**
3. Configure OAuth consent screen → Add scope: `https://www.googleapis.com/auth/gmail.readonly`
4. Create OAuth 2.0 credentials → Add authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback`
   - `https://your-render-url.onrender.com/auth/google/callback`
5. Copy Client ID and Secret to your `.env`

---

## 📁 Project Structure

```
jobtrail-ai/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   ├── passport.js        # Google OAuth2 strategy
│   │   └── groq.js            # Groq client setup
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Application.js     # Job application schema
│   │   └── DeletedApplication.js  # Blacklist for deleted apps
│   ├── routes/
│   │   ├── auth.js            # OAuth routes
│   │   └── applications.js    # CRUD + sync routes
│   ├── services/
│   │   ├── gmailService.js    # Gmail API — inbox + sent
│   │   ├── groqService.js     # AI extraction logic
│   │   └── syncService.js     # Orchestration service
│   ├── jobs/
│   │   └── emailPoller.js     # 15-min cron job
│   ├── middleware/
│   │   └── isAuthenticated.js
│   └── server.js
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── Dashboard.jsx
        │   └── ApplicationsPage.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ApplicationTable.jsx
        │   ├── FilterBar.jsx
        │   ├── StatusBadge.jsx
        │   ├── NotificationBell.jsx
        │   └── AIChatbot.jsx
        └── context/
            └── AuthContext.jsx
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/auth/google` | Initiate Google OAuth |
| `GET` | `/auth/google/callback` | OAuth callback |
| `GET` | `/auth/me` | Get current user |
| `GET` | `/auth/logout` | Logout |
| `GET` | `/applications` | Get all applications (with filters) |
| `POST` | `/applications/sync` | Manual sync trigger |
| `GET` | `/applications/stats` | Get application counts by status |
| `DELETE` | `/applications/:id` | Delete + blacklist an application |

---

## 🤖 How the AI Works

1. Gmail API fetches emails matching job confirmation patterns
2. Each email is pre-filtered by sender and subject to remove job alerts/suggestions
3. Groq's Llama 3.3 70B reads the email and extracts:
   - `company` — company name
   - `role` — job title
   - `dateApplied` — application date
   - `status` — Applied / Under Review / Interview / Offer / Rejected / Unknown
   - `confidence` — 0.0 to 1.0 confidence score
4. Only emails with `confidence >= 0.75` and `isJobApplication: true` are saved
5. Gmail message ID is used for deduplication — no duplicates ever

---

## 🌐 Deployment

### Backend → Render

- Root Directory: `backend`
- Build: `npm install`
- Start: `npm start`
- Add all env vars including `NODE_ENV=production`

### Frontend → Vercel

- Root Directory: `frontend`
- Framework: Vite
- Add env vars: `VITE_API_URL` and `VITE_GROQ_API_KEY`
- Add `vercel.json` for client-side routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 🔒 Privacy & Security

- **Read-only Gmail access** — we request only `gmail.readonly` scope
- **No email modification** — we never mark emails as read, move, delete, or send emails
- **Session-based auth** — sessions stored in MongoDB, not localStorage
- **Deletion blacklist** — deleted applications are permanently excluded from future syncs

---

## 🛣️ Roadmap

- [ ] Email notifications for Interview/Offer alerts
- [ ] Export applications to CSV
- [ ] Manual application entry
- [ ] Status update tracking over time
- [ ] Browser extension for one-click tracking
- [ ] Mobile app

---

## 👨‍💻 Author

**Mehul Kumar**
- Portfolio: [portfolio-gold-beta-93.vercel.app](https://portfolio-gold-beta-93.vercel.app)
- GitHub: [@mehulkumar06](https://github.com/mehulkumar06)

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

<p align="center">Built with ❤️ · Read-only Gmail · Your data stays yours</p>