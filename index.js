const winston = require('winston');
const logger = winston.createLogger({
	level: 'info',
	format: winston.format.simple(),
	transports: [new winston.transports.Console()],
});
const express = require('express');
const app = express();

require('./startup/routes')(app);
// require('./startup/db')();
// require('./startup/config')();
// require('./startup/validation')();

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
	winston.info(`Listening on port ${port}...`),
);

module.exports = server;
