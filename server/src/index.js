const express = require('express');
const cors = require('cors');
const releasesRouter = require('./routes/releases');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));
app.use(express.json());

// Routes
app.use('/api/releases', releasesRouter);

// Steps endpoint is mounted on the releases router as /api/releases/steps
// But let's also provide a top-level convenience route
app.get('/api/steps', (req, res) => {
  const STEPS = require('./constants/steps');
  res.json(STEPS);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server only if not in a serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
