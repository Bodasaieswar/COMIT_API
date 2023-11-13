const { logger } = require('../logger.js');
const prisma = require('../prisma/prismaClient');
const myCache = require('../cache.js');

async function fetchClinicalStudies() {
	const cacheKey = 'all-trials';
	const cachedData = myCache.get(cacheKey);

	if (cachedData) {
		return cachedData;
	}

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

		if (studies) {
			myCache.set(cacheKey, study, 3600);
		}

		return studies;
	} catch (err) {
		logger.error('Fetching Clinical Studies error:', err);
		throw err;
	}
}

async function fetchClinicalStudyById(id) {
	const protocolId = parseInt(id, 10);

	if (isNaN(protocolId)) {
		logger.error(`Invalid ID: ${id}`);
		throw new Error('Invalid ID');
	}

	const cacheKey = 'study-${id}';
	const cachedData = myCache.get(cacheKey);

	if (cachedData) {
		return cachedData;
	}

	try {
		const study = await prisma.protocol.findUnique({
			where: {
				protocolId: protocolId,
			},
		});

		if (study) {
			myCache.set(cacheKey, study, 3600);
		}

		return study;
	} catch (err) {
		logger.error('Fetching Clinical Study by ID error:', err);
		throw err;
	}
}

async function fetchClinicalStudyLocationsById(nctNo) {
	const cacheKey = 'study-locations-${nctNo}';
	const cachedData = myCache.get(cacheKey);

	if (cachedData) {
		return cachedData; // Return cached data if available
	}

	try {
		const locations = await prisma.trialLocations.findMany({
			where: {
				nctNo: nctNo,
			},
		});

		if (locations) {
			myCache.set(cacheKey, study, 3600); // Cache for 1 hour (3600 seconds)
		}

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
