require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./config/passport');
const connectDB = require('./config/db');
const authRouter = require('./routes/auth');
const applicationsRouter = require('./routes/applications');
const isAuthenticated = require('./middleware/isAuthenticated');
const { startEmailPoller } = require('./jobs/emailPoller');

const app = express();

// Connect to MongoDB
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());

const sessionStore = MongoStore.create({ mongoUrl: process.env.MONGODB_URI });

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
  maxAge: 1000 * 60 * 60 * 24 * 7,
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production' ? true : false
}
}));

app.use(passport.initialize());
app.use(passport.session());

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/auth', authRouter);
app.use('/applications', isAuthenticated, applicationsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ─── Debug route — REMOVE AFTER FIXING ───────────────────────────────────────
app.get('/debug-session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    session: req.session,
    isAuthenticated: req.isAuthenticated(),
    user: req.user || null,
    cookies: req.headers.cookie
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startEmailPoller();
});