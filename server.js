const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// 임시 데이터베이스 (실제 서비스 시에는 MongoDB나 MySQL 사용 권장)
const linkDatabase = {};

// 1. 링크 생성 페이지 (사용자가 정보를 입력하는 곳)
app.get('/', (req, res) => {
    res.send(`
        <h1>링크 썸네일 변환기</h1>
        <form action="/create" method="POST">
            <input type="text" name="originalUrl" placeholder="이동할 실제 주소" required><br>
            <input type="text" name="title" placeholder="보여줄 제목" required><br>
            <input type="text" name="imageUrl" placeholder="썸네일 이미지 URL" required><br>
            <button type="submit">변환 링크 생성</button>
        </form>
    `);
});

// 2. 링크 생성 로직
app.post('/create', (req, res) => {
    const { originalUrl, title, imageUrl } = req.body;
    const id = Math.random().toString(36).substring(2, 8); // 고유 ID 생성 (예: a1b2c3)

    linkDatabase[id] = { originalUrl, title, imageUrl };

    const shortLink = `${req.get('host')}/l/${id}`;
    res.send(`변환된 링크: <a href="http://${shortLink}">${shortLink}</a>`);
});

// 3. ✨ 핵심: 브릿지 페이지 (카톡 크롤러 대응)
app.get('/l/:id', (req, res) => {
    const data = linkDatabase[req.params.id];

    if (!data) {
        return res.status(404).send('존재하지 않는 링크입니다.');
    }

    // 템플릿에 데이터를 넣어 응답함
    res.render('bridge', {
        title: data.title,
        imageUrl: data.imageUrl,
        originalUrl: data.originalUrl
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});