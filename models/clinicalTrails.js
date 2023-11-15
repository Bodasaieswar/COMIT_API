const { logger } = require('../logger.js');
const prisma = require('../prisma/prismaClient');
const myCache = require('../cache.js');

// Helper function for data validation and transformation
function validateAndTransformEntry(entry) {
	const protocolId = parseInt(entry.protocolId, 10);
	if (isNaN(protocolId)) throw new Error('Invalid protocolId');

	// Convert EnrollmentCount to an integer or null
	entry.EnrollmentCount = parseInt(entry.EnrollmentCount, 10) || null;

	// Convert dates to ISO string
	['StartDate', 'CompletionDate', 'LastUpdateSubmitDate'].forEach(
		(dateField) => {
			if (entry[dateField]) {
				entry[dateField] = new Date(entry[dateField]).toISOString();
			}
		},
	);

	return { ...entry, protocolId };
}

async function fetchClinicalStudies() {
	const cacheKey = 'all-trials';
	const cachedData = myCache.get(cacheKey);
	if (cachedData) return cachedData;

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

		if (studies) myCache.set(cacheKey, studies, 3600);
		return studies;
	} catch (err) {
		logger.error('Fetching Clinical Studies error:', err);
		throw err;
	}
}

async function fetchClinicalStudyById(id) {
	const protocolId = parseInt(id, 10);
	if (isNaN(protocolId)) throw new Error('Invalid ID');

	const cacheKey = `study-${id}`;
	const cachedData = myCache.get(cacheKey);
	if (cachedData) return cachedData;

	try {
		const study = await prisma.protocol.findUnique({
			where: { protocolId },
		});

		if (study) myCache.set(cacheKey, study, 3600);
		return study;
	} catch (err) {
		logger.error('Fetching Clinical Study by ID error:', err);
		throw err;
	}
}

async function fetchClinicalStudyLocationsById(nctNo) {
	const cacheKey = `study-locations-${nctNo}`;
	const cachedData = myCache.get(cacheKey);
	if (cachedData) return cachedData;

	try {
		const locations = await prisma.trialLocations.findMany({
			where: { nctNo },
		});

		if (locations) myCache.set(cacheKey, locations, 3600);
		return locations;
	} catch (err) {
		logger.error(`Error fetching locations for NCT number ${nctNo}:`, err);
		throw err;
	}
}

async function insertClinicalStudy(entries) {
	try {
		await prisma.protocol.deleteMany();
		const upsertPromises = entries.map((entry) =>
			prisma.protocol.upsert({
				where: { protocolId: entry.protocolId },
				update: validateAndTransformEntry(entry),
				create: validateAndTransformEntry(entry),
			}),
		);

		await Promise.all(upsertPromises);
		return 'All protocols successfully inserted/updated.';
	} catch (err) {
		logger.error('Inserting/Updating Protocols error:', err);
		throw err;
	}
}

async function insertClinicalStudyLocation(entries) {
	try {
		await prisma.trialLocations.deleteMany();

		const batchSize = 10; // Adjust batch size as needed
		for (let i = 0; i < entries.length; i += batchSize) {
			const batch = entries.slice(i, i + batchSize);
			const insertPromises = batch.map((entry) =>
				prisma.trialLocations.create({ data: entry }),
			);
			await Promise.all(insertPromises);
		}

		return 'All protocol locations successfully inserted.';
	} catch (err) {
		logger.error('Inserting Protocols location error:', err);
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
