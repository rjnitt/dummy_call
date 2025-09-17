// Escape Call Assistant - Main Application Logic

class EscapeCallApp {
    constructor() {
        this.apiBase = '/api/twilio';
        this.phoneNumber = localStorage.getItem('phoneNumber') || '';
        this.customMessage = localStorage.getItem('customMessage') || '';
        this.scheduledCalls = [];

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSavedSettings();
        this.checkInitialState();
        this.startScheduledCallsPolling();
    }

    bindEvents() {
        // Settings
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
        document.getElementById('editSettings').addEventListener('click', () => this.showPhoneSetup());

        // Emergency call
        document.getElementById('emergencyCall').addEventListener('click', () => this.placeImmediateCall());

        // Scheduled calls
        document.querySelectorAll('.btn-schedule[data-delay]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const delay = parseInt(e.target.dataset.delay);
                this.scheduleCall(delay);
            });
        });

        document.getElementById('customSchedule').addEventListener('click', () => {
            const delay = parseInt(document.getElementById('customDelay').value);
            if (delay && delay > 0) {
                this.scheduleCall(delay);
            } else {
                this.showToast('Please enter a valid delay in minutes', 'error');
            }
        });

        // Refresh scheduled calls
        document.getElementById('refreshScheduled').addEventListener('click', () => this.loadScheduledCalls());

        // Phone number input - no auto-formatting to avoid issues

        // Enter key handlers
        document.getElementById('phoneNumber').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveSettings();
        });

        document.getElementById('customDelay').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') document.getElementById('customSchedule').click();
        });
    }

    checkInitialState() {
        if (this.phoneNumber) {
            this.showMainActions();
        } else {
            this.showPhoneSetup();
        }
    }

    loadSavedSettings() {
        if (this.phoneNumber) {
            document.getElementById('phoneNumber').value = this.phoneNumber;
            document.getElementById('displayPhoneNumber').textContent = this.phoneNumber;
        }

        if (this.customMessage) {
            document.getElementById('customMessage').value = this.customMessage;
        }
    }

    saveSettings() {
        const phoneInput = document.getElementById('phoneNumber').value.trim();
        const messageInput = document.getElementById('customMessage').value.trim();

        if (!phoneInput) {
            this.showToast('Please enter your phone number', 'error');
            return;
        }

        if (!this.isValidPhoneNumber(phoneInput)) {
            this.showToast('Please enter a valid phone number with country code (e.g., +1234567890)', 'error');
            return;
        }

        this.phoneNumber = phoneInput;
        this.customMessage = messageInput;

        // Save to localStorage
        localStorage.setItem('phoneNumber', this.phoneNumber);
        localStorage.setItem('customMessage', this.customMessage);

        // Update display
        document.getElementById('displayPhoneNumber').textContent = this.phoneNumber;

        this.showMainActions();
        this.showToast('Settings saved successfully!', 'success');
    }

    showPhoneSetup() {
        document.getElementById('phoneSetup').style.display = 'block';
        document.getElementById('mainActions').style.display = 'none';
    }

    showMainActions() {
        document.getElementById('phoneSetup').style.display = 'none';
        document.getElementById('mainActions').style.display = 'block';
        this.loadScheduledCalls();
    }

    async placeImmediateCall() {
        if (!this.phoneNumber) {
            this.showToast('Please set up your phone number first', 'error');
            return;
        }

        this.showLoading('Placing your escape call...');

        try {
            const response = await fetch(`${this.apiBase}/call/immediate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: this.phoneNumber,
                    message: this.customMessage || undefined
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showToast('📞 Escape call placed! Your phone should ring shortly.', 'success');
                this.updateStatus(`Call placed successfully. Call ID: ${result.data.callSid}`, 'success');
            } else {
                throw new Error(result.message || 'Failed to place call');
            }
        } catch (error) {
            console.error('Error placing immediate call:', error);
            this.showToast(`Failed to place call: ${error.message}`, 'error');
            this.updateStatus(`Error: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async scheduleCall(delayMinutes) {
        if (!this.phoneNumber) {
            this.showToast('Please set up your phone number first', 'error');
            return;
        }

        this.showLoading(`Scheduling call for ${delayMinutes} minute${delayMinutes > 1 ? 's' : ''} from now...`);

        try {
            const response = await fetch(`${this.apiBase}/call/schedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: this.phoneNumber,
                    message: this.customMessage || undefined,
                    delayMinutes: delayMinutes
                })
            });

            const result = await response.json();

            if (result.success) {
                const scheduledTime = new Date(result.data.scheduledTime).toLocaleString();
                this.showToast(`📅 Call scheduled for ${scheduledTime}`, 'success');
                this.updateStatus(`Call scheduled successfully for ${scheduledTime}`, 'success');
                this.loadScheduledCalls();

                // Clear custom delay input
                document.getElementById('customDelay').value = '';
            } else {
                throw new Error(result.message || 'Failed to schedule call');
            }
        } catch (error) {
            console.error('Error scheduling call:', error);
            this.showToast(`Failed to schedule call: ${error.message}`, 'error');
            this.updateStatus(`Error: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadScheduledCalls() {
        try {
            const response = await fetch(`${this.apiBase}/calls/scheduled`);
            const result = await response.json();

            if (result.success) {
                this.scheduledCalls = result.data;
                this.renderScheduledCalls();
            } else {
                console.error('Failed to load scheduled calls:', result.message);
            }
        } catch (error) {
            console.error('Error loading scheduled calls:', error);
        }
    }

    renderScheduledCalls() {
        const container = document.getElementById('scheduledCallsList');

        if (this.scheduledCalls.length === 0) {
            container.innerHTML = '<p class="empty-state">No scheduled calls</p>';
            return;
        }

        const callsHtml = this.scheduledCalls.map(call => {
            const scheduledTime = new Date(call.scheduledTime);
            const timeStr = scheduledTime.toLocaleString();
            const timeLeft = this.getTimeLeft(scheduledTime);

            return `
                <div class="scheduled-call-item">
                    <div class="scheduled-call-info">
                        <div class="scheduled-call-time">📅 ${timeStr}</div>
                        <div class="scheduled-call-phone">📞 ${call.phoneNumber}</div>
                        <div class="scheduled-call-countdown">⏰ ${timeLeft}</div>
                    </div>
                    <button class="cancel-btn" onclick="app.cancelScheduledCall('${call.id}')">
                        ❌ Cancel
                    </button>
                </div>
            `;
        }).join('');

        container.innerHTML = callsHtml;
    }

    async cancelScheduledCall(callId) {
        try {
            const response = await fetch(`${this.apiBase}/call/schedule/${callId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                this.showToast('Scheduled call cancelled', 'success');
                this.loadScheduledCalls();
            } else {
                throw new Error(result.message || 'Failed to cancel call');
            }
        } catch (error) {
            console.error('Error cancelling call:', error);
            this.showToast(`Failed to cancel call: ${error.message}`, 'error');
        }
    }

    getTimeLeft(targetTime) {
        const now = new Date();
        const diff = targetTime - now;

        if (diff <= 0) {
            return 'Due now';
        }

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}d ${hours % 24}h left`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m left`;
        } else {
            return `${minutes}m left`;
        }
    }

    startScheduledCallsPolling() {
        // Refresh scheduled calls every 30 seconds
        setInterval(() => {
            if (document.getElementById('mainActions').style.display !== 'none') {
                this.loadScheduledCalls();
            }
        }, 30000);
    }


    isValidPhoneNumber(phoneNumber) {
        // Basic validation - should start with + and be 10-15 digits
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        return phoneRegex.test(phoneNumber);
    }

    showLoading(message = 'Loading...') {
        document.getElementById('loadingText').textContent = message;
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    updateStatus(message, type = 'info') {
        const statusDiv = document.getElementById('callStatus');
        statusDiv.innerHTML = `<p>${message}</p>`;

        // Remove existing type classes
        statusDiv.classList.remove('warning', 'error');

        if (type === 'warning' || type === 'error') {
            statusDiv.classList.add(type);
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);

        // Click to dismiss
        toast.addEventListener('click', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EscapeCallApp();
});

// PWA Install Prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;

    // Show install button/banner
    console.log('PWA install prompt available');
});

window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
});

// Handle online/offline status
window.addEventListener('online', () => {
    console.log('App is online');
    if (window.app) {
        window.app.showToast('Back online! 🌐', 'success');
    }
});

window.addEventListener('offline', () => {
    console.log('App is offline');
    if (window.app) {
        window.app.showToast('App is offline. Some features may not work. 📴', 'warning');
    }
});
