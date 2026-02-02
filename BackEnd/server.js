const express = require('express');
const cors = require('cors');
const UserController = require('./Controller/User');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/users', UserController.getUsers);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
