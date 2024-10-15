const WebSocket = require('ws');

const port = 1112;

const wss = new WebSocket.Server({ port }, () => {
    console.log(`WebSocket server is running on ws://localhost:${port}`);
});

wss.on('connection', (ws) => {
    console.log('Client connected.');

    const sendDataInterval = setInterval(() => {
        const randomFloat = (Math.random() * 10).toFixed(14);

        ws.send(randomFloat);
    }, 1000);

    ws.on('close', () => {
        console.log('Client disconnected.');
        clearInterval(sendDataInterval);
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error: ${error}`);
    });
});
