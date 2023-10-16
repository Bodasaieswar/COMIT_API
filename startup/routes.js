const express = require('express');
const clinicalTrails = require('../routes/clinicalTrails');
const error = require('../middleware/error');

module.exports = function (app) {
	app.use(express.json());
	app.use('/api/clinicalTrails', clinicalTrails);
	app.use(error);
};
