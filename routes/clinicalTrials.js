const {
	fetchClinicalStudies,
	fetchClinicalStudyById,
	fetchClinicalStudyLocationsById,
	insertClinicalStudy,
	insertClinicalStudyLocation,
} = require('../models/clinicalTrails.js');
const { logger } = require('../logger.js');
const express = require('express');

const router = express.Router();

// Middleware for handling async route errors
const asyncMiddleware = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

// Error handling middleware
router.use((err, req, res, next) => {
	logger.error(err.message);

	if (err.message === 'Invalid NCTId format.') {
		res.status(400).send(err.message);
	} else {
		res.status(500).send('Internal Server Error');
	}
});

router.get(
	'/',
	asyncMiddleware(async (req, res) => {
		const clinicalStudies = await fetchClinicalStudies();
		res.json(clinicalStudies);
	}),
);

router.get(
	'/:id',
	asyncMiddleware(async (req, res) => {
		const clinicalStudy = await fetchClinicalStudyById(req.params.id);

		if (clinicalStudy.length === 0) {
			return res
				.status(404)
				.send('The Clinical Trial with the given ID was not found.');
		}

		res.json(clinicalStudy);
	}),
);

router.get(
	'/locations/:id',
	asyncMiddleware(async (req, res) => {
		const clinicalStudyLocations = await fetchClinicalStudyLocationsById(
			req.params.id,
		);

		if (clinicalStudyLocations.length === 0) {
			return res
				.status(404)
				.send(
					'The Clinical Trial Locations with the given ID was not found.',
				);
		}

		res.json(clinicalStudyLocations);
	}),
);

router.post(
	'/',
	asyncMiddleware(async (req, res) => {
		await insertClinicalStudy(req.body);
		res.status(200).send('Row successfully inserted.');
	}),
);

router.post(
	'/locations',
	asyncMiddleware(async (req, res) => {
		await insertClinicalStudyLocation(req.body);
		res.status(200).send('Row successfully inserted.');
	}),
);

module.exports = router;
