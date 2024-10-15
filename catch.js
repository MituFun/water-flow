const WebSocket = require('ws');
const fs = require('fs');

const wsAddress = 'ws://10.0.26.32:1112/yuxin/sum';

const filePath = 'Data.txt';

let dataBuffer = [];

const ws = new WebSocket(wsAddress);

ws.on('open', () => {
    console.log('WebSocket connection opened.');
});

ws.on('message', (message) => {
    const currentTime = new Date().toISOString();
    const dataLine = `${currentTime} ${message}`;

    fs.appendFile(filePath, dataLine + '\n', (err) => {
        if (err) throw err;
        console.log(`Saved ${currentTime}`);
    });

    dataBuffer = [];
});

ws.on('close', () => {
    console.log('WebSocket connection closed.');
});

ws.on('error', (error) => {
    console.error(`WebSocket Error: ${error}`);
});
