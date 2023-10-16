const {
	fetchClinicalStudies,
	fetchClinicalStudyById,
} = require('../models/clinicalTrails.js');

const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
	try {
		const clinicalStudies = await fetchClinicalStudies();
		res.send(clinicalStudies);
	} catch (err) {
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

		res.send(clinicalStudy[0]); // Send the first record (should only be one due to unique ID)
	} catch (err) {
		if (err.message === 'Invalid NCTId format.') {
			res.status(400).send(err.message);
		} else {
			// Otherwise, it's an unexpected error, so send a 500 status code
			res.status(500).send('Internal Server Error');
		}
	}
});

module.exports = router;
