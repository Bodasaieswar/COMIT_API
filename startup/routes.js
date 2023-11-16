const express = require('express');
const clinicalTrials = require('../routes/clinicalTrials');
const error = require('../middleware/error');

module.exports = function (app) {
	app.use(express.json());
	app.use('/api/clinicalTrials', clinicalTrials);
	app.use(error);
};
