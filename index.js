// Requirements
const express = require('express');
const router = express.Router();
const fileupload = require("express-fileupload");

// App
var app = express();
const port = 3000

app.use(fileupload());

// SEEDING
const seedDatabase = require('./database/seed');
seedDatabase()

// Logging
const timestamp = require('./config/router/timestamp');
app.use(timestamp)

// ROUTES
var rootRoutes = require('./routes/root');
app.all('/', rootRoutes);

var welcomeRoutes = require('./routes/welcome');
app.use('/welcome', welcomeRoutes);

// Start Server
app.listen(port, () => console.log(`Example app listening on port ${port}!`))



app.use(express.static('static'));