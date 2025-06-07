const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const db = require('./config/db'); // Import db (đã có initPool, getConnection, closePool)

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'API ATM', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3600/api' }],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routers
app.use('/api/accounts', require('./routes/account'));
app.use('/api/theatm', require('./routes/theatm'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/contents', require('./routes/contents'));
// app.use('/api/news', require('./routes/news'));
// app.use('/api/categories', require('./routes/categories'));
// app.use('/api/upload', require('./routes/upload'));
// app.use('/api/slides', require('./routes/slides'));

// Middleware xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error('❌ Lỗi server:', err);
  res.status(500).json({ Code: 500, Message: 'Lỗi server' });
});

const PORT = 3600;

// Khởi tạo pool Oracle và start server
async function startServer() {
  try {
    await db.initPool();
    const conn = await db.getConnection();
    console.log('✔️ Kết nối Oracle thành công');
    await conn.close();

    app.listen(PORT, () => {
      console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
      console.log(`📘 Swagger docs tại http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error('❌ Không thể khởi động server do lỗi kết nối Oracle:', err.message);
    process.exit(1); // Thoát ứng dụng nếu không kết nối được DB
  }
}

// Bắt sự kiện thoát để đóng pool
process.on('SIGINT', async () => {
  console.log('\n🛑 Đang tắt server...');
  await db.closePool();
  process.exit(0);
});

startServer();
