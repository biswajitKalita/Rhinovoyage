const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const db = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with credentials for local development and production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or postman)
    if (!origin) return callback(null, true);
    
    const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
    const isVercel = origin.endsWith('.vercel.app');
    
    if (isLocalhost || isVercel) {
      return callback(null, true);
    }
    
    // Check environment variable origins
    if (process.env.CORS_ORIGIN) {
      const allowed = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
      if (allowed.includes(origin) || allowed.includes('*')) {
        return callback(null, true);
      }
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Serve uploads folder statically
const path = require('path');
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../client/public/uploads');
app.use('/public/uploads', express.static(uploadDir));

// Seed default Admin user if none exists
const seedAdminUser = async () => {
  try {
    const adminEmail = 'admin@rhinovoyage.com';
    const adminUser = db.findOne('users', { email: adminEmail });

    if (!adminUser) {
      console.log('Seeding default admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('adminpassword123', salt);

      db.insert('users', {
        name: 'RhinoVoyage Admin',
        email: adminEmail,
        password: hashedPassword,
        phone: '+91 94350 12345',
        role: 'admin'
      });
      console.log('Default admin seeded: admin@rhinovoyage.com / adminpassword123');
    } else {
      console.log('Admin user already exists in database.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

// Seed admin
seedAdminUser();

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/cars', require('./routes/cars'));

// Default base route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'RhinoVoyage API is running.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
