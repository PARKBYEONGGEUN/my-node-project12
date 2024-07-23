const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: '토큰이 없습니다, 권한이 거부되었습니다' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ msg: '토큰이 유효하지 않습니다' });
    }
};

module.exports = verifyToken;
