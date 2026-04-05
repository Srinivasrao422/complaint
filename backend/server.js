require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { secret } = require('./config/jwt');

// Models (register schemas)
require('./models');
const { Complaint } = require('./models');

// Routes
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const suggestionRoutes = require('./routes/suggestions');
const adminRoutes = require('./routes/admin');
const apartmentRoutes = require('./routes/apartment');
const statsRoutes = require('./routes/stats');
const uploadRoutes = require('./routes/upload');
const noticesPublicRoutes = require('./routes/noticesPublic');
const contactRoutes = require('./routes/contact');
const siteSettingsRoutes = require('./routes/siteSettings');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB URI
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/scms';

app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/api/test', (req, res) => {
  res.send('API Working');
});

app.use('/api', authRoutes);
app.use('/api', complaintRoutes);
app.use('/api', suggestionRoutes);
app.use('/api', adminRoutes);
app.use('/api', apartmentRoutes);
app.use('/api', statsRoutes);
app.use('/api', uploadRoutes);
app.use('/api', noticesPublicRoutes);
app.use('/api', contactRoutes);
app.use('/api', siteSettingsRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

async function migrateLegacyData() {
  try {
    await Complaint.updateMany({ status: 'Open' }, { $set: { status: 'Pending' } });
    await Complaint.updateMany({ status: 'Closed' }, { $set: { status: 'Resolved' } });
  } catch (err) {
    console.warn('Data migration skipped:', err.message);
  }
}

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected');
    await migrateLegacyData();

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: { origin: true, methods: ['GET', 'POST'] },
    });

    io.use((socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        if (!token) {
          return next(new Error('unauthorized'));
        }
        const decoded = jwt.verify(token, secret);
        socket.userId = decoded.userId;
        socket.role = decoded.role;
        socket.adminRole = decoded.adminRole;
        return next();
      } catch {
        return next(new Error('unauthorized'));
      }
    });

    io.on('connection', (socket) => {
      if (socket.role === 'admin') {
        socket.join('admins');
      } else {
        socket.join(`user:${socket.userId}`);
      }
    });

    app.set('io', io);

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `❌ Port ${PORT} is already in use (another Node/backend instance is probably running).\n` +
            '   Run `npm run dev` again (it frees port 5000 first), or stop the other process:\n' +
            '   PowerShell: Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess\n' +
            '   Then: Stop-Process -Id <PID> -Force'
        );
      } else {
        console.error('❌ HTTP server error:', err.message);
      }
      process.exit(1);
    });

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log('📡 Socket.IO enabled');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
