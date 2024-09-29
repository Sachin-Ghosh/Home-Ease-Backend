var express = require('express');
const cors = require('cors'); // Import the cors middleware
const path = require('path');
const fs = require('fs');
var app = express();

require('dotenv').config(); // Load environment variables from .env file

// Import the cron job module
require('./cronJob');


// Import route files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const employerRoutes = require('./routes/employerRoutes'); // Add this line



const authenticateToken = require('./middlewares/authMiddleware');




// connecting to database
const connectDB = require('./config/db');
connectDB();


// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created:', uploadsDir);
} else {
    console.log('Uploads directory already exists:', uploadsDir);
}




// middleware 
app.use(cors({origin: '*', // or your frontend URL in production
    credentials: true}));
// this code is for accepting data in port request
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(authenticateToken); // authentication 



// Routes
app.use('/api/users', userRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/blogs', blogRoutes);
// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// admin routes

// app.use(adminBroApp);








app.get('/', function(req, res){
   res.send("Hello world!");
});



// app.use(admin.options.rootPath, adminRouter)


const port = process.env.PORT || 5000;

app.listen(port, "0.0.0.0" ,()=> {
    console.log(`Server is running on http://localhost:${port}`);
});