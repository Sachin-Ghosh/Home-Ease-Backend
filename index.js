var express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
var app = express();

require('dotenv').config(); // Load environment variables from .env file

// Import the cron job module
require('./cronJob');

// Import route files
const userRoutes = require('./routes/userRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const chatRoutes = require('./routes/chatRoutes');
const customerRoutes = require('./routes/customerRoutes'); // Import customer routes
const scheduleRoutes = require('./routes/scheduleRoutes'); // Import schedule routes



const authenticateToken = require('./middlewares/authMiddleware');

// Connecting to database
const connectDB = require('./config/db');
connectDB();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    // console.log('Uploads directory created:', uploadsDir);
} else {
    // console.log('Uploads directory already exists:', uploadsDir);
}

// Middleware 
app.use(cors({ origin: '*', credentials: true }));
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/customers', customerRoutes); // Use customer routes
app.use('/api/schedules', scheduleRoutes); // Use schedule routes
// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', function(req, res) {
   res.send("Hello world!");
});

const port = process.env.PORT || 5000;

app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${port}`);
});