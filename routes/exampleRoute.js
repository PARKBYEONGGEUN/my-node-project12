const express = require('express');
const router = express.Router();

// GET 요청 처리
router.get('/', (req, res) => {
    res.json({ message: '123123123' });
});

// POST 요청 처리
router.post('/', (req, res) => {
    const data = req.body;
    res.json({ message: 'ㅎㅇ', data: data });
    console.log(message);
});

module.exports = router;
