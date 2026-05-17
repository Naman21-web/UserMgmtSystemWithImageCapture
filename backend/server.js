require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const User = require('./models/User');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      /localhost/,
      /127\.0\.0\.1/,
      /\.ngrok-free\.app$/,
      /\.ngrok-free\.dev$/,
      /\.ngrok\.io$/,
      /\.vercel\.app$/,
    ];
    if (!origin || allowed.some((pattern) => pattern.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads (protected via controller)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/images', require('./routes/images'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Error handler
app.use(errorHandler);

// Create default admin user on startup
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        username: process.env.ADMIN_USERNAME || 'admin',
        email: 'admin@system.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'admin',
        isActive: true,
      });
      console.log('✅ Default admin user created:');
      console.log(`   Username: ${process.env.ADMIN_USERNAME || 'admin'}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    } else {
      console.log('ℹ️  Admin user already exists.');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  await createDefaultAdmin();
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
