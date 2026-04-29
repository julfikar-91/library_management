const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('Library Management API is running...');
});

// Import Routes
const bookRoutes = require('./routes/bookRoutes');
const memberRoutes = require('./routes/memberRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const fineRoutes = require('./routes/fineRoutes');

// Import Model to seed
const Admin = require('./models/Admin');

app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/fine', fineRoutes);

// Seed Admin Helper
const seedAdmin = async () => {
    try {
        const adminExists = await Admin.findOne({ email: 'admin@mrem.edu' });
        if (!adminExists) {
            await Admin.create({
                email: 'admin@mrem.edu',
                phone: '1234567890',
                password: 'admin123'
            });
            console.log('Seeded Default Admin: admin@mrem.edu / 1234567890 / admin123');
        }
    } catch (err) {
        console.error('Seed Admin error:', err);
    }
};

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library_mrem')
    .then(() => {
        console.log('MongoDB Connected');
        seedAdmin();
    })
    .catch(err => console.log('MongoDB Connection Error:', err));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
