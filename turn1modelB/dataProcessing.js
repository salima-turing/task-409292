// Implementation of the Real-Time Data Processing Protocol using WebSockets.

const ws = require('ws');
const EventEmitter = require('events');

class RealTimeDataProtocol extends EventEmitter {
    constructor(url, heartbeatInterval = 5000, messageTimeout = 30000) {
        super();
        this.url = url;
        this.heartbeatInterval = heartbeatInterval;
        this.messageTimeout = messageTimeout;
        this.socket = null;
        this.initializeSocket();
    }

    initializeSocket() {
        this.socket = new ws(this.url);

        this.socket.on('open', () => {
            this.log('Connected');
            this.startHeartbeat();
        });

        this.socket.on('message', (data) => {
            this.log('Received Message:', data);
            try {
                const parsedData = JSON.parse(data);
                this.emit('message', parsedData);
            } catch (error) {
                this.log('Error parsing message:', error);
            }
        });

        this.socket.on('error', (error) => {
            this.log('Socket Error:', error);
        });

        this.socket.on('close', (code, reason) => {
            this.log('Connection Closed:', code, reason);
            this.closeHeartbeat();
            if (code === 1000) {
                // Normal closure, don't reconnect
                return;
            }
            this.reconnect();
        });
    }

    send(data) {
        if (this.socket.readyState === ws.OPEN) {
            const jsonData = JSON.stringify(data);
            this.socket.send(jsonData, (error) => {
                if (error) {
                    this.log('Error sending message:', error);
                }
            });
        } else {
            this.log('Socket not open, message discarded.');
        }
    }

    sendHeartbeat() {
        this.send({ type: 'heartbeat' });
    }

    startHeartbeat() {
        if (!this.heartbeatIntervalId) {
            this.heartbeatIntervalId = setInterval(
                () => this.sendHeartbeat(),
                this.heartbeatInterval
            );
        }
    }

    closeHeartbeat() {
        if (this.heartbeatIntervalId) {
            clearInterval(this.heartbeatIntervalId);
            this.heartbeatIntervalId = null;
        }
    }
    reconnect() {
        this.log('Reconnecting...');
        setTimeout(() => {
            this.initializeSocket();
        }, 5000); // Reconnect after 5 seconds
    }

    close() {
        if (this.socket) {
            this.socket.close();
            this.closeHeartbeat();
        }
    }

    log(...message) {
        console.log('[RealTimeDataProtocol]', ...message);
    }
}

module.exports = RealTimeDataProtocol;
