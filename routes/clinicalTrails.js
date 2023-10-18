const {
	fetchClinicalStudies,
	fetchClinicalStudyById,
	insertClinicalStudy,
} = require('../models/clinicalTrails.js');
const { logger } = require('../logger.js');
const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		const clinicalStudies = await fetchClinicalStudies();
		res.send(clinicalStudies);
	} catch (err) {
		logger.error(`Fetching Clinical Studies Error: ${err.message}`);
		res.status(500).send('Internal server error');
	}
});

router.get('/:id', async (req, res) => {
	try {
		const clinicalStudy = await fetchClinicalStudyById(req.params.id);

		if (clinicalStudy.length === 0) {
			return res
				.status(404)
				.send('The Clinical Trail with the given ID was not found.');
		}

		res.send(clinicalStudy[0]);
	} catch (err) {
		logger.error(`Fetching Clinical Study by ID Error: ${err.message}`);

		if (err.message === 'Invalid NCTId format.') {
			res.status(400).send(err.message);
		} else {
			res.status(500).send('Internal Server Error');
		}
	}
});

router.post('/', async (req, res) => {
	try {
		await insertClinicalStudy(req);
		res.status(200).send('Row successfully inserted.');
	} catch (err) {
		logger.error(`Inserting Clinical Study Error: ${err.message}`);
		res.status(500).send('Insertion failed');
	}
});

module.exports = router;
