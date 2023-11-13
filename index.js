require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { logger } = require('./logger');
const verifyEnvVariables = require('./envVerifier');

verifyEnvVariables();

app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

require('./startup/routes')(app);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	if (
		!process.env.DB_SERVER ||
		!process.env.DB_USER ||
		!process.env.DB_DATABASE ||
		!process.env.DB_PASSWORD ||
		!process.env.DATABASE_URL
	) {
		logger.error(
			`Server started but some environment variables are missing.`,
		);
	} else {
		logger.info(`Listening on port ${port}...`);
	}
});

module.exports = server;
