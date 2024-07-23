const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// 업로드 디렉토리 확인 및 생성
const uploadDir = path.join(__dirname, '..', 'logos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8'); // 한글 파일명을 처리
        cb(null, `${timestamp}-${originalName}`);
    }
});

const upload = multer({ storage });

module.exports = (db) => {
    // 파일 업로드 API
    router.post('/', upload.single('file'), (req, res) => {
        if (!req.file) {
            return res.status(400).json({ success: false, message: '파일이 업로드되지 않았습니다.' });
        }

        const { originalname, filename } = req.file;
        const filePath = path.join('logos', filename).replace(/\\/g, '/'); // 경로를 상대 경로로 설정

        const sql = 'INSERT INTO logo (originalname, filename, filepath) VALUES (?, ?, ?)';

        db.query(sql, [originalname, filename, filePath], (err, result) => {
            if (err) {
                console.error('파일 정보 저장 중 에러 발생:', err);
                return res.status(500).json({ success: false, message: '파일 정보 저장 중 에러가 발생했습니다.' });
            }

            res.json({ success: true, message: '파일이 성공적으로 업로드되었습니다.' });
        });
    });

    // 파일 정보 조회 API
    router.get('/files', (req, res) => {
        const sql = 'SELECT * FROM logo ORDER BY `order` ASC';

        db.query(sql, (err, results) => {
            if (err) {
                console.error('파일 정보 조회 중 에러 발생:', err);
                return res.status(500).json({ success: false, message: '파일 정보 조회 중 에러가 발생했습니다.' });
            }

            res.json({ success: true, data: results });
        });
    });

    // 파일 삭제 API
    router.delete('/files/:id', (req, res) => {
        const fileId = req.params.id;

        // 파일 경로 조회
        const getFilePathSql = 'SELECT filepath FROM logo WHERE id = ?';
        db.query(getFilePathSql, [fileId], (err, results) => {
            if (err || results.length === 0) {
                console.error('파일 경로 조회 중 에러 발생:', err);
                return res.status(500).json({ success: false, message: '파일 경로 조회 중 에러가 발생했습니다.' });
            }

            const filePath = path.join(__dirname, '..', results[0].filepath);

            // 파일 삭제
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('파일 삭제 중 에러 발생:', err);
                    return res.status(500).json({ success: false, message: '파일 삭제 중 에러가 발생했습니다.' });
                }

                // 데이터베이스에서 파일 정보 삭제
                const deleteFileSql = 'DELETE FROM logo WHERE id = ?';
                db.query(deleteFileSql, [fileId], (err, result) => {
                    if (err) {
                        console.error('데이터베이스에서 파일 정보 삭제 중 에러 발생:', err);
                        return res.status(500).json({ success: false, message: '데이터베이스에서 파일 정보 삭제 중 에러가 발생했습니다.' });
                    }

                    res.json({ success: true, message: '파일이 성공적으로 삭제되었습니다.' });
                });
            });
        });
    });

    // 파일 변경 API
    router.post('/update', upload.single('file'), (req, res) => {
        if (!req.file || !req.body.id) {
            return res.status(400).json({ success: false, message: '파일이나 ID가 업로드되지 않았습니다.' });
        }

        const { id } = req.body;
        const { originalname, filename } = req.file;
        const filePath = path.join('logos', filename).replace(/\\/g, '/'); // 경로를 상대 경로로 설정

        // 기존 파일 경로 조회
        const getFilePathSql = 'SELECT filepath FROM logo WHERE id = ?';
        db.query(getFilePathSql, [id], (err, results) => {
            if (err || results.length === 0) {
                console.error('파일 경로 조회 중 에러 발생:', err);
                return res.status(500).json({ success: false, message: '파일 경로 조회 중 에러가 발생했습니다.' });
            }

            const oldFilePath = path.join(__dirname, '..', results[0].filepath);

            // 기존 파일 삭제
            fs.unlink(oldFilePath, (err) => {
                if (err) {
                    console.error('기존 파일 삭제 중 에러 발생:', err);
                    return res.status(500).json({ success: false, message: '기존 파일 삭제 중 에러가 발생했습니다.' });
                }

                // 데이터베이스에서 파일 정보 업데이트
                const updateFileSql = 'UPDATE logo SET originalname = ?, filename = ?, filepath = ? WHERE id = ?';
                db.query(updateFileSql, [originalname, filename, filePath, id], (err, result) => {
                    if (err) {
                        console.error('데이터베이스에서 파일 정보 업데이트 중 에러 발생:', err);
                        return res.status(500).json({ success: false, message: '데이터베이스에서 파일 정보 업데이트 중 에러가 발생했습니다.' });
                    }

                    res.json({ success: true, message: '파일이 성공적으로 변경되었습니다.' });
                });
            });
        });
    });

    // 파일 순서 변경 API
    router.post('/reorder', (req, res) => {
        const { id, order } = req.body;
        const updateOrderSql = 'UPDATE logo SET `order` = ? WHERE id = ?';

        db.query(updateOrderSql, [order, id], (err, result) => {
            if (err) {
                console.error('파일 순서 업데이트 중 에러 발생:', err);
                return res.status(500).json({ success: false, message: '파일 순서 업데이트 중 에러가 발생했습니다.' });
            }

            res.json({ success: true, message: '파일 순서가 성공적으로 업데이트되었습니다.' });
        });
    });

    return router;
};
