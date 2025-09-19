// Basic Express.js server
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory URL store
const urlMap = {};

// Resolve shortcode and count clicks
app.get('/api/resolve/:shortcode', (req, res) => {
  const shortcode = req.params.shortcode;
  const link = urlMap[shortcode];

  if (link) {
    // Increment click count whenever resolve is requested
    link.clicks += 1;
    res.json(link);
  } else {
    res.status(404).json({ error: 'not found' });
  }
});

// Simple hello endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express backend!' });
});

// Redirect endpoint (if you want to support direct browser access)
app.get('/:shortcode', (req, res) => {
  const shortcode = req.params.shortcode;
  const link = urlMap[shortcode];

  if (!link) return res.status(404).send('Short link not found');

  link.clicks += 1; // Increment on redirect
  return res.redirect(link.longUrl);
});

// Create new short link
app.post('/api/create', (req, res) => {
  const { longUrl, shortCode, displayText } = req.body;

  if (!longUrl || !shortCode) {
    return res.status(400).json({ error: 'longUrl and shortCode are required' });
  }
  if (urlMap[shortCode]) {
    return res.status(409).json({ error: 'Short code already exists' });
  }

  urlMap[shortCode] = {
    longUrl,
    displayText: displayText || null,
    clicks: 0,
  };

  res.json({ success: true, shortCode });
});

// Stats endpoint
app.get('/api/stats/:shortcode', (req, res) => {
  const link = urlMap[req.params.shortcode];
  link ? res.json(link) : res.status(404).json({ error: 'not found' });
});

// Server start
const PORT = process.env.PORT || 5001;
app.listen(PORT, (err) => {
  if (err) {
    console.error('Failed to start server:', err);
  } else {
    console.log(`Backend server running on http://localhost:${PORT}`);
  }
});
