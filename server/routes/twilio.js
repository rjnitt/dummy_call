const express = require('express');
const router = express.Router();
const twilioService = require('../services/twilioService');
const { SchedulerService } = require('../services/scheduler');

// Immediate escape call
router.post('/call/immediate', async (req, res) => {
    try {
        const { phoneNumber, message } = req.body;

        // Validation
        if (!phoneNumber) {
            return res.status(400).json({
                error: 'Phone number is required',
                example: '+1234567890'
            });
        }

        if (!twilioService.isValidPhoneNumber(phoneNumber)) {
            return res.status(400).json({
                error: 'Invalid phone number format',
                message: 'Phone number must start with + and include country code',
                example: '+1234567890'
            });
        }

        // Place the call
        const result = await twilioService.placeEscapeCall("+917200688846", message);

        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Immediate call error:', error);
        res.status(500).json({
            error: 'Failed to place escape call',
            message: error.message
        });
    }
});

// Schedule escape call
router.post('/call/schedule', async (req, res) => {
    try {
        const { phoneNumber, message, delayMinutes = 5 } = req.body;

        // Validation
        if (!phoneNumber) {
            return res.status(400).json({
                error: 'Phone number is required',
                example: '+1234567890'
            });
        }

        if (!twilioService.isValidPhoneNumber(phoneNumber)) {
            return res.status(400).json({
                error: 'Invalid phone number format',
                message: 'Phone number must start with + and include country code',
                example: '+1234567890'
            });
        }

        if (delayMinutes < 1 || delayMinutes > 1440) { // Max 24 hours
            return res.status(400).json({
                error: 'Invalid delay',
                message: 'Delay must be between 1 and 1440 minutes (24 hours)'
            });
        }

        // Schedule the call
        const result = SchedulerService.scheduleCall(phoneNumber, message, delayMinutes);

        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Schedule call error:', error);
        res.status(500).json({
            error: 'Failed to schedule escape call',
            message: error.message
        });
    }
});

// Get call status
router.get('/call/status/:callSid', async (req, res) => {
    try {
        const { callSid } = req.params;

        const status = await twilioService.getCallStatus(callSid);

        res.json({
            success: true,
            data: status,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Get call status error:', error);
        res.status(500).json({
            error: 'Failed to get call status',
            message: error.message
        });
    }
});

// Get scheduled calls
router.get('/calls/scheduled', (req, res) => {
    try {
        const scheduled = SchedulerService.getScheduledCalls();

        res.json({
            success: true,
            data: scheduled,
            count: scheduled.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Get scheduled calls error:', error);
        res.status(500).json({
            error: 'Failed to get scheduled calls',
            message: error.message
        });
    }
});

// Get call history
router.get('/calls/history', (req, res) => {
    try {
        const history = SchedulerService.getCallHistory();

        res.json({
            success: true,
            data: history,
            count: history.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Get call history error:', error);
        res.status(500).json({
            error: 'Failed to get call history',
            message: error.message
        });
    }
});

// Cancel scheduled call
router.delete('/call/schedule/:callId', (req, res) => {
    try {
        const { callId } = req.params;

        const result = SchedulerService.cancelScheduledCall(callId);

        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Cancel call error:', error);
        res.status(404).json({
            error: 'Failed to cancel scheduled call',
            message: error.message
        });
    }
});

// TwiML endpoint for call content
router.get('/twiml/escape-message', (req, res) => {
    const { message } = req.query;
    const twimlMessage = message || process.env.DEFAULT_MESSAGE ||
        'Hello, this is an urgent call. Please call me back immediately.';

    const twiML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice" language="en-US">${escapeXml(twimlMessage)}</Say>
    <Pause length="1"/>
    <Say voice="alice" language="en-US">This call will now end. Goodbye.</Say>
</Response>`;

    res.type('text/xml');
    res.send(twiML);
});

// Also support POST for backward compatibility
router.post('/twiml/escape-message', (req, res) => {
    const { message } = req.body;
    const twimlMessage = message || process.env.DEFAULT_MESSAGE ||
        'Hello, this is an urgent call. Please call me back immediately.';

    const twiML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice" language="en-US">${escapeXml(twimlMessage)}</Say>
    <Pause length="1"/>
    <Say voice="alice" language="en-US">This call will now end. Goodbye.</Say>
</Response>`;

    res.type('text/xml');
    res.send(twiML);
});

// Helper function to escape XML
function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

module.exports = router;
