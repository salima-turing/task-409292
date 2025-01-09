// dataProcesssing.js
class WebSocketClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.heartbeatInterval = null;
        this.reconnectInterval = 1000; // Reconnect every second
        this.isAlive = true; // For heartbeat tracking
        this.init();
    }

    init() {
        this.connect();
    }

    connect() {
        this.ws = new WebSocket(this.url);

        this.ws.on('open', () => {
            console.log('WebSocket connection established');
            this.isAlive = true;
            this.startHeartbeat();
        });

        this.ws.on('message', (message) => {
            // Handle incoming messages
            const msg = JSON.parse(message);
            if (msg.type === 'ack') {
                console.log('Acknowledgment received for message id:', msg.id);
            }
        });

        this.ws.on('close', () => {
            console.log('WebSocket connection closed. Attempting to reconnect...');
            this.stopHeartbeat();
            this.reconnect();
        });

        this.ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            this.reconnect();
        });
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.isAlive) {
                this.sendHeartbeat();
            }
        }, 5000); // Send heartbeat every 5 seconds
    }

    sendHeartbeat() {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'heartbeat' }));
        }
    }

    stopHeartbeat() {
        clearInterval(this.heartbeatInterval);
    }

    reconnect() {
        setTimeout(() => {
            this.connect();
        }, this.reconnectInterval);
    }

    sendData(data) {
        const message = {
            type: 'data',
            id: data.id, // Your message ID logic here
            payload: data.payload,
        };
        this.ws.send(JSON.stringify(message));
    }
}

// Usage
const client = new WebSocketClient('ws://localhost:8081');

// Simulating sensor data sending
setInterval(() => {
    client.sendData({ id: 'sensor1', payload: { temperature: Math.random() * 100 } });
}, 1000);
