const { logger } = require('../logger.js');
const prisma = require('../prisma/prismaClient');

// Utility function to validate the format of the nctNo
function isValidNctNo(nctNo) {
	return /^NCT\d{8}$/i.test(nctNo);
}

async function fetchClinicalStudies() {
	try {
		const studies = await prisma.protocol.findMany({
			select: {
				protocolId: true,
				nctNo: true,
				OfficialTitle: true,
				BriefSummary: true,
				protocolStatus: true,
			},
		});
		return studies;
	} catch (err) {
		console.log('Fetching Clinical Studies error:', err);
		throw err;
	}
}

async function fetchClinicalStudyById(id) {
	// Convert id to an integer
	const protocolId = parseInt(id, 10);

	// Check if conversion resulted in a valid number
	if (isNaN(protocolId)) {
		// Log and throw an error or handle it as per your application's error handling strategy
		logger.error(`Invalid ID: ${id}`);
		throw new Error('Invalid ID');
	}

	try {
		const study = await prisma.protocol.findUnique({
			where: {
				protocolId: protocolId,
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
		const locations = await prisma.trialLocations.findMany({
			where: {
				nctNo: nctNo,
			},
		});

		return locations;
	} catch (err) {
		logger.error(
			`Error fetching locations for NCT number ${nctNo}: ${err.message}`,
		);
		throw err;
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
