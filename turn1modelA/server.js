// server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        // Assume message is JSON.parse-able
        const msg = JSON.parse(message);

        if (msg.type === 'heartbeat') {
            // Respond to heartbeat if necessary
            console.log('Heartbeat received');
        } else if (msg.type === 'data') {
            // Process sensor data
            console.log('Processing sensor data:', msg.payload);
            // Send acknowledgment back
            ws.send(JSON.stringify({ type: 'ack', id: msg.id }));
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });
});

console.log('WebSocket server started at ws://localhost:8080');
