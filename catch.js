const WebSocket = require('ws');
const fs = require('fs');

const wsAddress = 'ws://frp.freefrp.net:38293/yuxin/sum';
const filePath = 'Data.txt';

let ws;
let reconnectInterval = 5000;

function connectWebSocket() {
    ws = new WebSocket(wsAddress);

    ws.on('open', () => {
        console.log('WebSocket connection opened.');
    });

    ws.on('message', (message) => {
        const currentTime = new Date().toISOString();
        const dataLine = `${currentTime} ${message}`;

        fs.appendFile(filePath, dataLine + '\n', (err) => {
            if (err) {
                console.error(`Error writing to file: ${err.message}`);
            } else {
                console.log(`Saved ${currentTime}`);
            }
        });
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed. Reconnecting in 5 seconds...');
        setTimeout(connectWebSocket, reconnectInterval);
    });

    ws.on('error', (error) => {
        console.error(`WebSocket Error: ${error.message}`);
    });
}

connectWebSocket();
