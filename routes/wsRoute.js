const express = require('express');
const router = express.Router();
const WebSocket = require('ws'); // WebSocket 객체 가져오기
module.exports = (wss) => {
    router.post('/insert', (req, res) => {
        const data = req.body;

        // WebSocket 클라이언트에게 데이터 전송
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send('asd');

            }
        });

        res.status(200).json({ message: 'Data sent to WebSocket clients' });
    });

    return router;
};
