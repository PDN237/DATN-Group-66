const express = require('express');
const cors = require('cors');
const authRoute = require('./auth.route');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoute);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server đang chạy!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});