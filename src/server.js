const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swaggerConfig');

const dashboardRoutes = require('./routes/dashboardRoutes');
const categoryRoutes = require('./routes/CategoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const shop = require('./routes/shopRoutes');
const productUploadRoutes = require('./routes/productUploadRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ====================
// 🛡 CORS Мидлвар до всего
// ====================
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'application/json'],
    // credentials: true,
  })
);

// Для preflight-запросов (OPTIONS)
app.options('*', cors());

// ====================
// 📦 Middleware
// ====================

app.use(express.json({ limit: '50mb' })); // JSON limitini oshirish
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// ====================
// 🔌 Подключаем MongoDB
// ====================
connectDB();

// ====================
// 📚 Swagger Docs
// ====================
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// ====================
// 🚏 Роуты
// ====================
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/shops', shop);
app.use('/api/upload', productUploadRoutes);
// ====================
// 🧯 Глобальный Error Handler
// ====================
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ====================
// 🚀 Запуск сервера
// ====================
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
