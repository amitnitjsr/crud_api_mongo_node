const express = require('express');
const connectDB = require('./config/db');
const users = require('./routes/api/users');
const auth = require('./routes/api/auth');
const app = express();

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
connectDB();

// Init middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('Hello World'));

// Use Routes
app.use('/api/users', users);
app.use('/api/auth', auth);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
