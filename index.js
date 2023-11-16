require('dotenv').config();
const express = require('express');
const app = express();
const { logger } = require('./logger');
const verifyEnvVariables = require('./envVerifier');
const config = require('config');
const cors = require('cors');

// Verifying environment variables
verifyEnvVariables();

// CORS configuration
const corsOptions = {
	origin: 'http://localhost:5173', // Allow only this origin to access
	optionsSuccessStatus: 200, // For legacy browser support
};

app.use(cors(corsOptions)); // Use CORS with options

// Use Express built-in body parser
app.use(express.json({ limit: config.get('bodyLimit') }));
app.use(express.urlencoded({ limit: config.get('bodyLimit'), extended: true }));

// Initialize routes
require('./startup/routes')(app);

// Start the server
const port = config.get('port');
const server = app.listen(port, () => {
	logger.info(`Listening on port ${port}...`);
});

module.exports = server;
