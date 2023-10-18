const logger = require('./logger');

const requiredEnvVariables = [
	'DB_SERVER',
	'DB_USER',
	'DB_DATABASE',
	'DB_PASSWORD',
];

function verifyEnvVariables() {
	requiredEnvVariables.forEach((variable) => {
		if (!process.env[variable]) {
			logger.error(`Environment variable ${variable} is not set.`);
		}
	});
}

module.exports = verifyEnvVariables;
