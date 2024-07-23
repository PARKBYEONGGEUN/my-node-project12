const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const exampleRoute = require('./routes/exampleRoute');
const dbRoute = require('./routes/dbRoute');
const wsRoute = require('./routes/wsRoute');
const memberRoute = require('./routes/member');
const authRoute = require('./routes/auth');
const protectedRoute = require('./routes/protected');
const uploadRoute = require('./routes/upload'); // Upload 라우터 추가
const logoRoute = require('./routes/logo'); // Upload 라우터 추가
const navigationRoute = require('./routes/navigation');
const noticeRoute = require('./routes/notice'); // 공지사항 라우터 추가

const app = express();
const port = 8001;

// 미들웨어 설정
app.use(cors({
    origin: ['http://localhost:8080', 'http://ibangss.net', 'http://admin.localhost:8080', 'http://admin.ibangss.net'], // 허용할 도메인 설정
    optionsSuccessStatus: 200
}));

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/logo') || req.path.startsWith('/uploads')) {
        // API 및 이미지 경로는 다음 미들웨어로 전달
        return next();
    } else {
        // 나머지 모든 경로는 index.html로 리다이렉트
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }
});

// 정적 파일 제공을 위해 uploads 폴더를 정적 디렉토리로 설정
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/logos', express.static(path.join(__dirname, 'logos')));

// MySQL 연결 설정
const db = mysql.createConnection({
    host: 'park1648.cafe24app.com',
    user: 'park1648',
    password: 'aa1120721!!',
    database: 'park1648',
    port: 3306,
    connectTimeout: 30000
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});

// HTTP 서버 생성
const server = http.createServer(app);

// WebSocket 서버 생성
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('WebSocket 클라이언트 연결됨');

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
    });

    ws.on('close', () => {
        console.log('WebSocket 클라이언트 연결 종료');
    });
});

app.use('/example', exampleRoute);
app.use('/db', dbRoute(db, wss));
app.use('/api/ws', wsRoute(wss));
app.use('/api/member', memberRoute(db)); // member 라우터 사용
app.use('/api/auth', authRoute(db));
app.use('/api/protected', protectedRoute(db)); // 보호된 라우터 추가
app.use('/api/upload', uploadRoute(db)); // Upload 라우터 사용
app.use('/api/logo', logoRoute(db)); // Upload 라우터 사용
app.use('/api/navigation', navigationRoute(db));
app.use('/api/notice', noticeRoute(db)); // 공지사항 라우터 사용

// 서버 시작
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
