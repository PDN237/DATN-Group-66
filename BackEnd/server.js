const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoute = require('./auth.route');
const problemsRoute = require('./problems.route');
const submitRoute = require('./routes/submit.route');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from FrondEnd directory
app.use(express.static(path.join(__dirname, '../FrondEnd')));

// API routes
app.use('/api/auth', authRoute);
app.use('/api/problems', problemsRoute);
app.use('/api/submit', submitRoute);

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../FrondEnd/Index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});
