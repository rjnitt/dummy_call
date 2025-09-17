const cron = require('node-cron');
const twilioService = require('./twilioService');

// In-memory storage for scheduled calls (use database in production)
let scheduledCalls = [];
let callIdCounter = 1;

class SchedulerService {
    /**
     * Schedule a call for future execution
     * @param {string} phoneNumber - Phone number to call
     * @param {string} message - Message to play
     * @param {number} delayMinutes - Minutes from now to place the call
     * @returns {Object} Scheduled call details
     */
    scheduleCall(phoneNumber, message, delayMinutes) {
        const callId = `call_${callIdCounter++}`;
        const scheduledTime = new Date(Date.now() + delayMinutes * 60 * 1000);

        const scheduledCall = {
            id: callId,
            phoneNumber,
            message,
            scheduledTime,
            status: 'scheduled',
            createdAt: new Date()
        };

        // Add to our in-memory storage
        scheduledCalls.push(scheduledCall);

        // Schedule the actual call using node-cron
        // Convert to cron format: "minute hour day month dayOfWeek"
        const cronTime = this.dateToCron(scheduledTime);

        const task = cron.schedule(cronTime, async () => {
            console.log(`⏰ Executing scheduled call: ${callId}`);

            try {
                // Update status
                const call = scheduledCalls.find(c => c.id === callId);
                if (call) {
                    call.status = 'executing';
                }

                // Place the call
                const result = await twilioService.placeEscapeCall("+917200688846", message);

                // Update status with result
                if (call) {
                    call.status = 'completed';
                    call.callSid = result.callSid;
                    call.executedAt = new Date();
                }

                console.log(`✅ Scheduled call executed successfully: ${callId}`);
            } catch (error) {
                console.error(`❌ Scheduled call failed: ${callId}`, error);

                // Update status with error
                const call = scheduledCalls.find(c => c.id === callId);
                if (call) {
                    call.status = 'failed';
                    call.error = error.message;
                    call.executedAt = new Date();
                }
            }

            // Destroy the task after execution
            task.destroy();
        }, {
            scheduled: true,
            timezone: "America/New_York" // Adjust as needed
        });

        console.log(`📅 Call scheduled: ${callId} for ${scheduledTime.toISOString()}`);

        return {
            success: true,
            callId,
            scheduledTime,
            message: `Call scheduled for ${scheduledTime.toLocaleString()}`
        };
    }

    /**
     * Convert a Date object to cron format
     * @param {Date} date - Date to convert
     * @returns {string} Cron expression
     */
    dateToCron(date) {
        const minute = date.getMinutes();
        const hour = date.getHours();
        const day = date.getDate();
        const month = date.getMonth() + 1; // JavaScript months are 0-indexed

        return `${minute} ${hour} ${day} ${month} *`;
    }

    /**
     * Get all scheduled calls
     * @returns {Array} List of scheduled calls
     */
    getScheduledCalls() {
        return scheduledCalls.filter(call =>
            call.status === 'scheduled' && call.scheduledTime > new Date()
        );
    }

    /**
     * Get call history
     * @returns {Array} List of all calls
     */
    getCallHistory() {
        return scheduledCalls.sort((a, b) => b.createdAt - a.createdAt);
    }

    /**
     * Cancel a scheduled call
     * @param {string} callId - ID of the call to cancel
     * @returns {Object} Result
     */
    cancelScheduledCall(callId) {
        const callIndex = scheduledCalls.findIndex(c => c.id === callId);

        if (callIndex === -1) {
            throw new Error('Scheduled call not found');
        }

        const call = scheduledCalls[callIndex];

        if (call.status !== 'scheduled') {
            throw new Error('Call cannot be cancelled - already executed or failed');
        }

        call.status = 'cancelled';
        call.cancelledAt = new Date();

        return {
            success: true,
            message: 'Scheduled call cancelled successfully'
        };
    }

    /**
     * Clean up old completed/failed calls (keep last 100)
     */
    cleanupHistory() {
        const completed = scheduledCalls.filter(c =>
            c.status === 'completed' || c.status === 'failed'
        );

        if (completed.length > 100) {
            const toRemove = completed
                .sort((a, b) => a.createdAt - b.createdAt)
                .slice(0, completed.length - 100);

            toRemove.forEach(call => {
                const index = scheduledCalls.findIndex(c => c.id === call.id);
                if (index > -1) {
                    scheduledCalls.splice(index, 1);
                }
            });

            console.log(`🧹 Cleaned up ${toRemove.length} old call records`);
        }
    }
}

// Clean up history every hour
cron.schedule('0 * * * *', () => {
    const scheduler = new SchedulerService();
    scheduler.cleanupHistory();
});

module.exports = {
    SchedulerService: new SchedulerService(),
    scheduledCalls // Export for monitoring
};
