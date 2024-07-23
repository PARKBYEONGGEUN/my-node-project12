const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // 공지사항 조회 API
    router.get('/', (req, res) => {
        const category = req.query.category;
        let sql;
        let params = [];

        if (category) {
            sql = 'SELECT * FROM notices WHERE category = ?';
            params = [category];
        } else {
            sql = 'SELECT * FROM notices';
        }

        db.query(sql, params, (err, results) => {
            if (err) {
                console.error('공지사항 조회 중 에러 발생:', err);
                return res.status(500).json({ success: false, message: '공지사항 조회 중 에러가 발생했습니다.' });
            }
            res.json({ success: true, data: results });
        });
    });

    // 공지사항 추가 API
    router.post('/', (req, res) => {
        const { category, title, author } = req.body;
        const sql = 'INSERT INTO notices (category, title, author) VALUES (?, ?, ?)';
        db.query(sql, [category, title, author], (err, result) => {
            if (err) {
                console.error('공지사항 추가 중 에러 발생:', err);
                return res.status(500).json({ success: false, message: '공지사항 추가 중 에러가 발생했습니다.' });
            }
            res.json({ success: true, message: '공지사항이 성공적으로 추가되었습니다.' });
        });
    });

    return router;
};
