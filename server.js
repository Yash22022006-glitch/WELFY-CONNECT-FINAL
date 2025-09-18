// server.js - Express backend for Welfy Connect
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const port = 5000; // change as needed

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// In-memory data stores (replace with DB in production)
const users = [];
const locations = [];
const rescueReports = [];
const hospitalContacts = [
  { id: 1, name: 'Dr. Rajesh Kumar', phone: '+91 9876543210', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: 2, name: 'Dr. Priya Sharma', phone: '+91 9876543211', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: 3, name: 'Dr. Anil Gupta', phone: '+91 9876543212', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
];
const availableVolunteers = [
  { id: 1, name: 'Volunteer A', phone: '+91 9876543213', avatar: 'https://randomuser.me/api/portraits/men/4.jpg' },
  { id: 2, name: 'Volunteer B', phone: '+91 9876543214', avatar: 'https://randomuser.me/api/portraits/women/5.jpg' },
  { id: 3, name: 'Volunteer C', phone: '+91 9876543215', avatar: 'https://randomuser.me/api/portraits/men/6.jpg' },
];

// Simple password hashing (replace with bcrypt in production)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Signup API
app.post('/api/signup', (req, res) => {
  const { name, email, dob, aadhar, phone, password, registerVolunteer } = req.body;
  if (!name || !email || !dob || !aadhar || !phone || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }
  if (users.find(u => u.email === email || u.aadhar === aadhar)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  const userId = `USR${users.length + 1}`;
  users.push({
    userId,
    name,
    email,
    dob,
    aadhar,
    phone,
    isVolunteer: registerVolunteer === 'yes',
    passwordHash: hashPassword(password),
  });
  res.json({ message: 'Signup successful', userId });
});

// Login API
app.post('/api/login', (req, res) => {
  const { userId, password } = req.body;
  if (!userId || !password) {
    return res.status(400).json({ error: 'User ID and password required' });
  }
  const user = users.find(u => u.userId === userId);
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ userId: user.userId, name: user.name, isVolunteer: user.isVolunteer });
});

// Location endpoint
app.post('/api/location', (req, res) => {
  const { userId, latitude, longitude } = req.body;
  if (!userId || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'Invalid location data' });
  }
  locations.push({ userId, latitude, longitude, timestamp: Date.now() });
  res.json({ message: 'Location stored' });
});

// Rescue report endpoint
app.post('/api/rescue-report', (req, res) => {
  const { volunteerId, location, victimCount, additionalInfo, backService } = req.body;
  if (!volunteerId || !location || !victimCount) {
    return res.status(400).json({ error: 'Missing report data' });
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

// Retrieve rescue reports for volunteer
app.get('/api/rescue-reports/:volunteerId', (req, res) => {
  const { volunteerId } = req.params;
  const reports = rescueReports.filter(r => r.volunteerId === volunteerId);
  res.json({ reports });
});

// Get hospital contacts
app.get('/api/hospital-contacts', (req, res) => {
  res.json({ contacts: hospitalContacts });
});

// Get available volunteers
app.get('/api/available-volunteers', (req, res) => {
  res.json({ volunteers: availableVolunteers });
});

// Start server
app.listen(port, () => {
  console.log(`Welfy Connect backend listening at http://localhost:${port}`);
});
