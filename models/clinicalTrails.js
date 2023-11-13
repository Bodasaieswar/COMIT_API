const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');
const { logger } = require('../logger.js');

const prisma = new PrismaClient();

// Utility function to validate the format of the nctNo
function isValidNctNo(nctNo) {
	return /^NCT\d{8}$/i.test(nctNo); // Simple regex to match NCT followed by 8 digits
}

function getDefaultDate() {
	// This creates a new date object for December 31, 9999
	return new Date('9999-12-31T23:59:59.999Z');
}

function parseDateOrDefault(dateString) {
	if (!dateString) {
		return getDefaultDate(); // Return the default date if dateString is not provided
	}

	const date = new Date(dateString);
	if (isNaN(date.getTime())) {
		// Checks if the date is invalid
		return getDefaultDate(); // Return the default date if dateString is invalid
	}

	return date;
}

async function fetchClinicalStudies() {
	try {
		const studies = await prisma.Protocol.findMany({
			select: {
				nctNo: true,
				OfficialTitle: true,
				BriefSummary: true,
				protocolStatus: true,
			},
		});

		return studies;
	} catch (err) {
		logger.error('Fetching Clinical Studies error:', err);
		throw err;
	}
}

async function fetchClinicalStudyById(id) {
	// Define the Joi schema for NCTId validation
	if (!isValidNctNo(nctNo)) {
		throw new Error('Invalid NCTId format.');
	}

	try {
		const study = await prisma.Protocol.findUnique({
			where: {
				nctNo: id,
			},
		});

		return study;
	} catch (err) {
		logger.error('Fetching Clinical Study by ID error:', err);
		throw err;
	}
}

async function fetchClinicalStudyLocationsById(nctNo) {
	if (!isValidNctNo(nctNo)) {
		throw new Error('Invalid NCTId format.');
	}

	try {
		const locations = await prisma.trialLocation.findMany({
			where: {
				nctNo: nctNo,
			},
		});

		return locations;
	} catch (err) {
		logger.error(
			`Error fetching locations for NCT number ${nctNo}: ${err.message}`,
		);
		throw err; // Rethrow the error to be handled by the calling function
	}
}

function convertToISODateString(dateString) {
	// Parse the date string and convert it to ISO-8601 format
	const date = new Date(dateString);
	return date.toISOString();
}

async function insertClinicalStudy(entries) {
	try {
		await prisma.protocol.deleteMany();
		const batchSize = 10; // Adjust the batch size as needed
        for (let i = 0; i < entries.length; i += batchSize) {
            const batch = entries.slice(i, i + batchSize);
			const upsertPromises = entries.map((entry) => {
				// Convert protocolId to integer
				const protocolId = parseInt(entry.protocolId, 10);
				if (isNaN(protocolId)) {
					throw new Error('Invalid protocolId');
				}

				// Convert EnrollmentCount to an integer, if it's not null
				if (
					entry.EnrollmentCount !== null &&
					entry.EnrollmentCount !== undefined
				) {
					entry.EnrollmentCount = parseInt(entry.EnrollmentCount, 10);
					if (isNaN(entry.EnrollmentCount)) {
						// Handle the case where the conversion to integer fails
						entry.EnrollmentCount = null; // or throw an error, based on your requirements
					}
				}

				if (entry.StartDate) {
					entry.StartDate = convertToISODateString(entry.StartDate);
				}
				if (entry.CompletionDate) {
					entry.CompletionDate = convertToISODateString(
						entry.CompletionDate,
					);
				}

				// Convert LastUpdateSubmitDate to ISO-8601 format
				if (entry.LastUpdateSubmitDate) {
					entry.LastUpdateSubmitDate = convertToISODateString(
						entry.LastUpdateSubmitDate,
					);
				}
				// Truncate string fields as necessary
				Object.keys(entry).forEach((key) => {
					if (typeof entry[key] === 'string' && maxLengths[key]) {
						entry[key] = truncateString(entry[key], maxLengths[key]);
					}
				});

				return prisma.protocol.upsert({
					where: { protocolId },
					update: { ...entry, protocolId },
					create: { ...entry, protocolId },
				});
			});

			await Promise.all(upsertPromises);
			return 'All protocols successfully inserted/updated.';
		} catch (err) {
		console.log('Inserting/Updating Protocols error:', err);
		throw err;
	}
}

async function insertClinicalStudyLocation(entries) {
	try {
		await prisma.trialLocations.deleteMany();

		const batchSize = 10; // Adjust the batch size as needed
		for (let i = 0; i < entries.length; i += batchSize) {
			const batch = entries.slice(i, i + batchSize);

			const insertPromises = batch.map((entry) => {
				// Apply any necessary transformations here if needed
				return prisma.trialLocations.create({ data: entry });
			});

			await Promise.all(insertPromises);
		}
		return 'All protocol locations successfully inserted.';
	} catch (err) {
		console.log('Inserting Protocols location error:', err);
		throw err;
	}
}

module.exports = {
	fetchClinicalStudies,
	fetchClinicalStudyById,
	fetchClinicalStudyLocationsById,
	insertClinicalStudy,
	insertClinicalStudyLocation,
};
