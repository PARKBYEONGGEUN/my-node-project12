const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

module.exports = (db) => {
    // 회원 가입 라우트
    router.post('/register', (req, res) => {
        const { companynumber, userid, password, username, birthday, gender, phonenumber, email } = req.body;

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) throw err;

            const sql = 'INSERT INTO users (companynumber, userid, password, username, birthday, gender, phonenumber, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            db.query(sql, [companynumber, userid, hash, username, birthday, gender, phonenumber, email], (err, result) => {
                if (err) {
                    return res.status(400).json({ msg: '회원가입 실패 관리자에게 문의하세요', error: err });
                }
                res.status(200).json({ msg: '회원가입 성공' });
            });
        });
    });

    // 로그인 라우트
    router.post('/login', (req, res) => {
        const { userid, password } = req.body;

        const sql = 'SELECT * FROM users WHERE userid = ?';
        db.query(sql, [userid], (err, results) => {
            if (err) throw err;
            if (results.length === 0) {
                return res.status(400).json({ msg: '사용자를 찾을 수 없습니다.' });
            }

            const user = results[0];
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (!isMatch) {
                    return res.status(400).json({ msg: '비밀번호가 일치하지 않습니다.' });
                }

                const token = jwt.sign({ id: user.userid }, 'your_jwt_secret', { expiresIn: '2h' });
                res.json({ token });
            });
        });
    });

    // 사용자 정보 조회 라우트
    router.get('/user', authenticateToken, (req, res) => {
        const userid = req.user.id;

        const sql = 'SELECT companynumber, userid, username, birthday, gender, phonenumber, email, created_at FROM users WHERE userid = ?';
        db.query(sql, [userid], (err, result) => {
            if (err) {
                return res.status(500).json({ msg: '회원 정보 조회 실패', error: err });
            }
            if (result.length === 0) {
                return res.status(404).json({ msg: '회원 정보를 찾을 수 없습니다' });
            }
            res.status(200).json(result[0]);
        });
    });

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

    return router;
};
