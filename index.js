require('dotenv').config();
const express = require('express');
const app = express();

const logger = require('./logger');
const verifyEnvVariables = require('./envVerifier');
verifyEnvVariables();

require('./startup/routes')(app);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	if (
		!process.env.DB_SERVER ||
		!process.env.DB_USER ||
		!process.env.DB_DATABASE ||
		!process.env.DB_PASSWORD
	) {
		logger.error(
			`Server started but some environment variables are missing.`,
		);
	} else {
		logger.info(`Listening on port ${port}...`);
	}
});

module.exports = server;
