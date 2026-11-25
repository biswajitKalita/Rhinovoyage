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

// Enable CORS with credentials for local development, production, and file:// previews
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins (null for local file://, localhost, vercel, mobile apps, etc.)
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
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
    const adminEmail = 'info@rhinovoyage.com';
    const adminUser = await db.findOne('users', {
      $or: [{ email: 'info@rhinovoyage.com' }, { email: 'admin@rhinovoyage.com' }]
    });

    if (!adminUser) {
      console.log('Seeding default admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('adminpassword123', salt);

      await db.insert('users', {
        name: 'RhinoVoyage Admin',
        email: adminEmail,
        password: hashedPassword,
        phone: '+91 94350 12345',
        role: 'admin'
      });
      console.log('Default admin seeded: info@rhinovoyage.com / adminpassword123');
    } else {
      console.log('Admin user already exists in database.');
    }
  } catch (error) {
    console.error('Non-fatal error seeding admin user:', error.message);
  }
};

// Seed admin asynchronously
seedAdminUser().catch(err => console.error('Admin seed caught:', err.message));

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
