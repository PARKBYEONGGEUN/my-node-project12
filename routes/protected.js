const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

module.exports = (db) => {
    router.get('/userinfo', (req, res) => {
        const userid = req.headers.userid;

        if (!userid) {
            return res.status(400).json({ msg: 'userid가 필요합니다' });
        }

        const sql = 'SELECT companynumber, userid, username, birthday, gender, phonenumber, email, created_at FROM users WHERE userid = ?';
        db.query(sql, [userid], (err, result) => {
            if (err) {
                console.error('DB Error:', err);
                return res.status(500).json({ msg: '회원 정보 조회 실패', error: err });
            }
            if (result.length === 0) {
                return res.status(404).json({ msg: '회원 정보를 찾을 수 없습니다' });
            }
            res.status(200).json(result[0]);
        });
    });

    return router;
};
