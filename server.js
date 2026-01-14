const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;
const staticDirectory = path.join(__dirname, 'public');

// ===========================================
// RATE LIMITING
// ===========================================
// Strict limiter for auth endpoints (login, register)
// Why: These are the most attacked endpoints - brute force targets
// 5 attempts per 15 minutes per IP address
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 requests per window
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,      // Return rate limit info in headers
  legacyHeaders: false        // Disable X-RateLimit-* headers
});

// General API limiter - less strict
// Why: Prevents API abuse but doesn't block normal usage
// 100 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute
  max: 100,                   // 100 requests per window
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false
});

// ===========================================
// MIDDLEWARE
// ===========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(staticDirectory));

// Apply rate limiters
app.use('/api', apiLimiter);                    // All API routes
app.use('/api/auth/login', authLimiter);        // Extra strict on login
app.use('/api/auth/register', authLimiter);     // Extra strict on register

const authRoutes = require('./routes/auth');
const transcriptRoutes = require('./routes/transcripts');

app.use('/api/auth', authRoutes);
app.use('/api/transcripts', transcriptRoutes);

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

app.get('/', (req, res) => {
  res.sendFile(path.join(staticDirectory, 'html', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on http://127.0.0.1:${port}/`);
});
