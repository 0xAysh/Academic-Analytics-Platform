const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;
const staticDirectory = path.join(__dirname, 'public');

// Security headers - protects against common web vulnerabilities
// Why: These headers tell browsers to enable security features
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],                    // Only load resources from same origin
      scriptSrc: ["'self'"],                     // Only run scripts from same origin
      styleSrc: ["'self'", "'unsafe-inline'"],   // Allow inline styles (needed for some UI)
      imgSrc: ["'self'", "data:"],               // Allow images from self and data URIs
      connectSrc: ["'self'"],                    // Only connect to same origin APIs
      fontSrc: ["'self'"],                       // Only load fonts from same origin
      objectSrc: ["'none'"],                     // Block <object>, <embed>, <applet>
      frameAncestors: ["'none'"]                 // Prevent site from being framed (clickjacking)
    }
  },
  crossOriginEmbedderPolicy: false               // Disable for simpler local dev
}));

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
