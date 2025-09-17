const twilio = require('twilio');

class TwilioService {
    constructor() {
        this.accountSid = process.env.TWILIO_ACCOUNT_SID;
        this.authToken = process.env.TWILIO_AUTH_TOKEN;
        this.fromNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!this.accountSid || !this.authToken || !this.fromNumber) {
            console.error('⚠️  Twilio credentials not configured. Please check your environment variables.');
            return;
        }

        this.client = twilio(this.accountSid, this.authToken);
        console.log('📞 Twilio service initialized');
    }

    /**
     * Place an escape call to the specified number
     * @param {string} toNumber - The phone number to call
     * @param {string} message - The message to play (optional)
     * @returns {Promise<Object>} Call details
     */
    async placeEscapeCall(toNumber, message = null) {
        if (!this.client) {
            throw new Error('Twilio client not initialized. Check your credentials.');
        }

        try {
            const twimlMessage = message || process.env.DEFAULT_MESSAGE ||
                'Hello, this is an urgent call. Please call me back immediately.';

            // Create TwiML directly in the call - no external URL needed
            const call = await this.client.calls.create({
                to: toNumber,
                from: this.fromNumber,
                twiml: `<Response>
                    <Say voice="alice" language="en-US">${this.escapeXml(twimlMessage)}</Say>
                    <Pause length="1"/>
                    <Say voice="alice" language="en-US">This call will now end. Goodbye.</Say>
                </Response>`,
                timeout: 20, // Ring for 20 seconds
                record: false, // Don't record the call for privacy
            });

            console.log(`📞 Escape call placed successfully: ${call.sid}`);

            return {
                success: true,
                callSid: call.sid,
                to: toNumber,
                from: this.fromNumber,
                status: call.status,
                message: 'Escape call placed successfully'
            };
        } catch (error) {
            console.error('❌ Failed to place escape call:', error);
            throw new Error(`Failed to place call: ${error.message}`);
        }
    }

    /**
     * Create a TwiML URL for the call content
     * @param {string} message - The message to convert to speech
     * @returns {string} TwiML URL
     */
    async createTwiMLUrl(message) {
        // For demo purposes, we'll use a simple TwiML response
        // In production, you might want to host this on your server
        const twiML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice" language="en-US">${this.escapeXml(message)}</Say>
    <Pause length="1"/>
    <Say voice="alice" language="en-US">This call will now end. Goodbye.</Say>
</Response>`;

        // For demo, we'll return a data URL (Twilio supports this for testing)
        // In production, host this TwiML on your server
        return `data:application/xml;base64,${Buffer.from(twiML).toString('base64')}`;
    }

    /**
     * Escape XML characters for TwiML
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeXml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Get call status
     * @param {string} callSid - The call SID to check
     * @returns {Promise<Object>} Call status
     */
    async getCallStatus(callSid) {
        if (!this.client) {
            throw new Error('Twilio client not initialized');
        }

        try {
            const call = await this.client.calls(callSid).fetch();
            return {
                sid: call.sid,
                status: call.status,
                duration: call.duration,
                startTime: call.startTime,
                endTime: call.endTime
            };
        } catch (error) {
            console.error('❌ Failed to get call status:', error);
            throw new Error(`Failed to get call status: ${error.message}`);
        }
    }

    /**
     * Validate phone number format
     * @param {string} phoneNumber - Phone number to validate
     * @returns {boolean} Is valid
     */
    isValidPhoneNumber(phoneNumber) {
        // Basic validation - should start with + and be 10-15 digits
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        return phoneRegex.test(phoneNumber);
    }
}

module.exports = new TwilioService();
