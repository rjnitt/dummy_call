const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const twilioRoutes = require('./routes/twilio');
const { scheduledCalls } = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Routes
app.use('/api/twilio', twilioRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Escape Call Assistant API is running',
        scheduledCalls: scheduledCalls.length
    });
});

// Serve PWA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Escape Call Assistant server running on http://localhost:${PORT}`);
    console.log(`📱 PWA available at: http://localhost:${PORT}`);
    console.log('📞 Ready to place escape calls!');
});

module.exports = app;
