// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// In-memory data store (replace with database in production)
const users = [];
const locations = [];
const rescueReports = [];

// Simple password hashing (use bcrypt in real app)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Signup endpoint
app.post('/api/signup', (req, res) => {
  const { name, email, dob, aadhar, phone, password, registerVolunteer } = req.body;
  if (!name || !email || !dob || !aadhar || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (users.find(u => u.email === email || u.aadhar === aadhar)) {
    return res.status(400).json({ error: 'User email or Aadhar already exists.' });
  }

  const userId = `USR${users.length + 1}`;
  const user = {
    userId,
    name,
    email,
    dob,
    aadhar,
    phone,
    isVolunteer: (registerVolunteer === 'yes' || registerVolunteer === true),
    passwordHash: hashPassword(password),
  };
  users.push(user);

  res.json({ message: 'Signup successful.', userId });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { userId, password } = req.body;
  if (!userId || !password) {
    return res.status(400).json({ error: 'User ID and password required.' });
  }
  const user = users.find(u => u.userId === userId);
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }
  // Return basic user info; consider JWT in production
  res.json({ userId: user.userId, name: user.name, isVolunteer: user.isVolunteer });
});

// Submit location endpoint
app.post('/api/location', (req, res) => {
  const { userId, latitude, longitude, timestamp } = req.body;
  if (!userId || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'Invalid or missing location data.' });
  }
  locations.push({ userId, latitude, longitude, timestamp: timestamp || Date.now() });
  res.json({ message: 'Location stored' });
});

// Submit volunteer rescue report endpoint
app.post('/api/volunteer/report', (req, res) => {
  const { volunteerId, location, victimCount, additionalInfo, backService } = req.body;
  if (!volunteerId || !location || !victimCount) {
    return res.status(400).json({ error: 'Missing required report data.' });
  }
  rescueReports.push({
    volunteerId,
    location,
    victimCount,
    additionalInfo: additionalInfo || '',
    backService: backService || false,
    timestamp: Date.now(),
  });
  res.json({ message: 'Rescue report submitted' });
});

// Retrieve volunteer reports endpoint
app.get('/api/volunteer/reports/:volunteerId', (req, res) => {
  const { volunteerId } = req.params;
  const reports = rescueReports.filter(r => r.volunteerId === volunteerId);
  res.json({ reports });
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  console.log(`Welfy Connect backend running at http://localhost:${port}`);
});
