const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/workers', require('./src/routes/workerRoutes'));
app.use('/api/jobs', require('./src/routes/jobRoutes'));
app.use('/api/messages', require('./src/routes/messageRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
