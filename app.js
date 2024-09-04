var express = require('express');
const sequelize = require('./config/database');
const cors = require('cors');

var app = express();

require('dotenv').config(); 
require('./cronJob');

app.use(express.json());
app.use(cors());
// this code is for accepting data in port request
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// // Import routes
// const vendorRoutes = require('./routes/vendors');
// const bookingRoutes = require('./routes/bookings');

// // Use routes
// app.use('/vendors', vendorRoutes);
// app.use('/bookings', bookingRoutes);

// Sync models with the database and start the server
sequelize.sync()
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Failed to sync database:', err));

 


  app.get('/', function(req, res){
    res.send("Hello world!");
 });

const port = process.env.PORT || 5000;
app.listen(port, "0.0.0.0" ,()=> {
    console.log(`Server is running on http://localhost:${port}`);
});
