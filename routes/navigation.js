const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // 상위 네비게이션 항목 조회 API
    router.get('/', (req, res) => {
        const sql = 'SELECT * FROM navigation_items';
        db.query(sql, (err, results) => {
            if (err) {
                console.error('상위 네비게이션 항목 조회 중 에러 발생:', err);
                return res.status(500).json({ success: false, message: '상위 네비게이션 항목 조회 중 에러가 발생했습니다.' });
            }

            res.json({ success: true, data: results });
        });
    });

    // 하위 네비게이션 항목 조회 API
    router.get('/sub-navigation', (req, res) => {
        const sql = 'SELECT * FROM sub_navigation_items';
        db.query(sql, (err, results) => {
            if (err) {
                console.error('하위 네비게이션 항목 조회 중 에러 발생:', err);
                return res.status(500).json({ success: false, message: '하위 네비게이션 항목 조회 중 에러가 발생했습니다.' });
            }
            res.json({ success: true, data: results });
        });
    });

    // 상위 네비게이션 항목 추가 API
    router.post('/', (req, res) => {
        const { title, link } = req.body;
        const sql = 'INSERT INTO navigation_items (title, link) VALUES (?, ?)';
        db.query(sql, [title, link], (err, result) => {
            if (err) {
                console.error('상위 네비게이션 항목 추가 중 에러 발생:', err);
                return res.status(500).json({ success: false, message: '상위 네비게이션 항목 추가 중 에러가 발생했습니다.' });
            }
            res.json({ success: true, message: '상위 네비게이션 항목이 성공적으로 추가되었습니다.' });
        });
    });

    // 하위 네비게이션 항목 추가 API
    router.post('/sub-navigation', (req, res) => {
        const { parentId, title, link } = req.body;
        const sql = 'INSERT INTO sub_navigation_items (parent_id, title, link) VALUES (?, ?, ?)';
        db.query(sql, [parentId, title, link], (err, result) => {
            if (err) {
                console.error('하위 네비게이션 항목 추가 중 에러 발생:', err);
                return res.status(500).json({ success: false, message: '하위 네비게이션 항목 추가 중 에러가 발생했습니다.' });
            }
            res.json({ success: true, message: '하위 네비게이션 항목이 성공적으로 추가되었습니다.' });
        });
    });

    // 상위 네비게이션 항목 삭제 API
    router.delete('/:id', (req, res) => {
        const { id } = req.params;
        const sql = 'DELETE FROM navigation_items WHERE id = ?';
        db.query(sql, [id], (err, result) => {
            if (err) {
                console.error('상위 네비게이션 항목 삭제 중 에러 발생:', err);
                return res.status(500).json({ success: false, message: '상위 네비게이션 항목 삭제 중 에러가 발생했습니다.' });
            }
            res.json({ success: true, message: '상위 네비게이션 항목이 성공적으로 삭제되었습니다.' });
        });
    });

    // 하위 네비게이션 항목 삭제 API
    router.delete('/sub-navigation/:id', (req, res) => {
        const { id } = req.params;
        const sql = 'DELETE FROM sub_navigation_items WHERE id = ?';
        db.query(sql, [id], (err, result) => {
            if (err) {
                console.error('하위 네비게이션 항목 삭제 중 에러 발생:', err);
                return res.status(500).json({ success: false, message: '하위 네비게이션 항목 삭제 중 에러가 발생했습니다.' });
            }
            res.json({ success: true, message: '하위 네비게이션 항목이 성공적으로 삭제되었습니다.' });
        });
    });

    // 상위 네비게이션 항목 수정 API
    router.put('/:id', (req, res) => {
        const { id } = req.params;
        const { title, link } = req.body;
        const sql = 'UPDATE navigation_items SET title = ?, link = ? WHERE id = ?';
        db.query(sql, [title, link, id], (err, result) => {
            if (err) {
                console.error('상위 네비게이션 항목 수정 중 에러 발생:', err);
                return res.status(500).json({ success: false, message: '상위 네비게이션 항목 수정 중 에러가 발생했습니다.' });
            }
            res.json({ success: true, message: '상위 네비게이션 항목이 성공적으로 수정되었습니다.' });
        });
    });

    // 하위 네비게이션 항목 수정 API
    router.put('/sub-navigation/:id', (req, res) => {
        const { id } = req.params;
        const { title, link } = req.body;
        const sql = 'UPDATE sub_navigation_items SET title = ?, link = ? WHERE id = ?';
        db.query(sql, [title, link, id], (err, result) => {
            if (err) {
                console.error('하위 네비게이션 항목 수정 중 에러 발생:', err);
                return res.status(500).json({ success: false, message: '하위 네비게이션 항목 수정 중 에러가 발생했습니다.' });
            }
            res.json({ success: true, message: '하위 네비게이션 항목이 성공적으로 수정되었습니다.' });
        });
    });





    // 하위2 네비게이션 항목 조회 API
    router.get('/sub2-navigation', (req, res) => {
        const parentId = req.query.parentId;
        let sql;
        let params = [];

        if (parentId) {
            sql = 'SELECT * FROM sub2_navigation_items WHERE parent_id = ?';
            params = [parentId];
        } else {
            sql = 'SELECT * FROM sub2_navigation_items';
        }

        db.query(sql, params, (err, results) => {
            if (err) {
                console.error('하위2 네비게이션 항목 조회 중 에러 발생:', err);
                return res.status(500).json({ success: false, message: '하위2 네비게이션 항목 조회 중 에러가 발생했습니다.' });
            }
            res.json({ success: true, data: results });
        });
    });

    // 하위2 네비게이션 항목 추가 API
    router.post('/sub2-navigation', (req, res) => {
        const { parentId, title, link } = req.body;
        const sql = 'INSERT INTO sub2_navigation_items (parent_id, title, link) VALUES (?, ?, ?)';
        db.query(sql, [parentId, title, link], (err, result) => {
            if (err) {
                console.error('하위2 네비게이션 항목 추가 중 에러 발생:', err);
                return res.status(500).json({ success: false, message: '하위2 네비게이션 항목 추가 중 에러가 발생했습니다.' });
            }
            res.json({ success: true, message: '하위2 네비게이션 항목이 성공적으로 추가되었습니다.' });
        });
    });

    // 하위2 네비게이션 항목 삭제 API
    router.delete('/sub2-navigation/:id', (req, res) => {
        const { id } = req.params;
        const sql = 'DELETE FROM sub2_navigation_items WHERE id = ?';
        db.query(sql, [id], (err, result) => {
            if (err) {
                console.error('하위2 네비게이션 항목 삭제 중 에러 발생:', err);
                return res.status(500).json({ success: false, message: '하위2 네비게이션 항목 삭제 중 에러가 발생했습니다.' });
            }
            res.json({ success: true, message: '하위2 네비게이션 항목이 성공적으로 삭제되었습니다.' });
        });
    });

    // 하위2 네비게이션 항목 수정 API
    router.put('/sub2-navigation/:id', (req, res) => {
        const { id } = req.params;
        const { title, link, num } = req.body;
        const sql = 'UPDATE sub2_navigation_items SET title = ?, link = ?, num =?  WHERE id = ?';
        db.query(sql, [title, link, num, id], (err, result) => {
            if (err) {
                console.error('하위2 네비게이션 항목 수정 중 에러 발생:', err);
                return res.status(500).json({ success: false, message: '하위2 네비게이션 항목 수정 중 에러가 발생했습니다.' });
            }
            res.json({ success: true, message: '하위2 네비게이션 항목이 성공적으로 수정되었습니다.' });
        });
    });











    return router;
};
