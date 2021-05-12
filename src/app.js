const express = require('express');
const path = require('path');

const app = express();

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public');
// Setup static directory to serve
app.use(express.static(publicDirectoryPath)); // express.static is a function

module.exports = app;
