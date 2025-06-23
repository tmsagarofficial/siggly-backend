// Basic Express.js server
const express = require('express');
const cors = require('cors');
//const admin = require("firebase-admin");

// Use the actual filename of your service account key
//const serviceAccount = require("./siggly-a8423-firebase-adminsdk-fbsvc-6153cf8efc.json");

//admin.initializeApp({
//  credential: admin.credential.cert(serviceAccount),
//  storageBucket: "siggly-a8423.appspot.com"
//});

//const db = admin.firestore();
//const bucket = admin.storage().bucket();

const app = express();
app.use(cors());
app.use(express.json());

const urlMap = {};

// Test endpoint to confirm Firestore connection
app.get('/firebase-test', async (req, res) => {
  try {
    // Try to get a list of collections
    const collections = await db.listCollections();
    res.json({ success: true, collections: collections.map(col => col.id) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/resolve/:shortcode', (req, res) => {
  const link = urlMap[req.params.shortcode];
  if (link) {
    res.json(link);
  } else {
    res.status(404).json({ error: 'not found' });
  }
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express backend!' });
});

// Redirect short codes
app.get('/:shortcode', async (req, res) => {
  const { shortcode } = req.params;

  // Check in-memory first
  if (urlMap[shortcode]) {
    return res.redirect(urlMap[shortcode]);
  }

  // If Firebase fallback is needed (leave as-is or comment out for now)
  try {
    const doc = await db.collection('shortLinks').doc(shortcode).get();

    if (!doc.exists) {
      return res.status(404).send('Short link not found');
    }

    const { longUrl } = doc.data();
    return res.redirect(longUrl);
  } catch (err) {
    console.error('Redirect error:', err);
    return res.status(500).send('Internal Server Error');
  }
});


app.get('/:shortcode', (req, res) => {
  const link = urlMap[req.params.shortcode];
  if (!link) return res.status(404).send('Short link not found');

  link.clicks += 1;
  return res.redirect(link.longUrl);
});



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


app.get('/api/stats/:shortcode', (req, res) => {
  const link = urlMap[req.params.shortcode];
  link ? res.json(link) : res.status(404).json({ error: 'not found' });
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, (err) => {
  if (err) {
    console.error('Failed to start server:', err);
  } else {
    console.log(`Backend server running on http://localhost:${PORT}`);
  }
});
