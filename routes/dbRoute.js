const express = require('express');
const router = express.Router();
const WebSocket = require('ws'); // WebSocket 객체 가져오기

module.exports = (db, wss) => {
    router.post('/insert', (req, res) => {
        // WebSocket 클라이언트에게 데이터 전송
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send('inset 접속됨');

            }
        });


        setTimeout(() => {

            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send('이제 db로 들어감');

                }
            });
            const { userid, userpw } = req.body;
            const query = 'INSERT INTO member (userid, userpw) VALUES (?, ?)';

            db.query(query, [userid, userpw], (err, result) => {
                if (err) {
                    console.error('데이터 삽입 오류:', err);
                    if (!res.headersSent) {
                        res.status(500).send('서버 오류');
                    }
                    return;
                }


                // WebSocket을 통해 프론트엔드로 메시지 전송

                if (!res.headersSent) {
                    res.send('회원가입 성공');

                }

            });
        }, 5000);
    });



    return router;
};
