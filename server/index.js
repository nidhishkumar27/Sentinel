const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const path = require('path');

dotenv.config(); // Load from .env in current directory

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('Sentinel API Server is Running');
});

// Database Connection and Server Start
const startServer = async () => {
    try {
        if (!MONGO_URI) {
            console.warn('⚠️ No MONGO_URI found. Database features will fail.');
        } else {
            await mongoose.connect(MONGO_URI);
            console.log('✅ MongoDB Connected');
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
        // process.exit(1); // Optional: Exit if DB is critical
    }
};

startServer();
