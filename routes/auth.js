const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const generateTokens = (user) => {
    const accessToken = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '6h' });
    const refreshToken = jwt.sign({ id: user.id }, 'your_jwt_refresh_secret', { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

module.exports = (db) => {
    router.post('/login', (req, res) => {
        const { userid, password } = req.body;

        const sql = 'SELECT * FROM users WHERE userid = ?';
        db.query(sql, [userid], (err, results) => {
            if (err) {
                return res.status(500).json({ msg: '서버 에러', error: err });
            }
            if (results.length === 0) {
                return res.status(400).json({ msg: '사용자를 찾을 수 없습니다' });
            }

            const user = results[0];

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (!isMatch) {
                    return res.status(400).json({ msg: '비밀번호가 일치하지 않습니다' });
                }

                const { accessToken, refreshToken } = generateTokens(user);

                const updateSql = 'UPDATE users SET refresh_token = ? WHERE id = ?';
                db.query(updateSql, [refreshToken, user.id], (err) => {
                    if (err) {
                        return res.status(500).json({ msg: '토큰 업데이트 실패', error: err });
                    }

                    res.json({ accessToken, refreshToken, user });
                });
            });
        });
    });

    router.post('/logout', (req, res) => {
        const { refreshToken } = req.body;
        const sql = 'UPDATE users SET refresh_token = NULL WHERE refresh_token = ?';
        db.query(sql, [refreshToken], (err) => {
            if (err) {
                return res.status(500).json({ msg: '로그아웃 실패', error: err });
            }
            res.json({ msg: '로그아웃 성공d' });
        });
    });

    router.post('/verify-token', (req, res) => {
        const { token, refreshToken } = req.body;

        if (!token) {
            return res.status(400).json({ msg: '토큰이 없습니다.' });
        }

        jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
            if (err) {
                return res.status(401).json({ msg: '토큰이 유효하지 않습니다.', error: err });
            }

            const sql = 'SELECT * FROM users WHERE id = ?';
            db.query(sql, [decoded.id], (err, results) => {
                if (err || results.length === 0) {
                    return res.status(401).json({ msg: '사용자가 로그아웃되었습니다.' });
                }

                const storedRefreshToken = results[0].refresh_token;

                if (refreshToken !== storedRefreshToken) {
                    return res.status(401).json({ msg: '사용자가 로그아웃되었습니다.' });
                }

                res.json({ msg: '토큰이 유효합니다.' });
            });
        });
    });

    return router;
};
