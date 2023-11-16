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
		await prisma.$connect();
		const studies = await prisma.protocol.findMany({
			select: {
				protocolId: true,
				nctNo: true,
				OfficialTitle: true,
				BriefSummary: true,
				protocolStatus: true,
				MaximumAge: true,
				MinimumAge: true,
			},
		});

		if (studies) myCache.set(cacheKey, studies, 3600);
		await prisma.$disconnect();
		return studies;
	} catch (err) {
		logger.error('Fetching Clinical Studies error:', err);
		await prisma.$disconnect();
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
		await prisma.$connect();
		const study = await prisma.protocol.findUnique({
			where: { protocolId },
		});

		if (study) myCache.set(cacheKey, study, 3600);
		await prisma.$disconnect();
		return study;
	} catch (err) {
		logger.error('Fetching Clinical Study by ID error:', err);
		await prisma.$disconnect();
		throw err;
	}
}

async function fetchClinicalStudyLocationsById(nctNo) {
	const cacheKey = `study-locations-${nctNo}`;
	const cachedData = myCache.get(cacheKey);
	if (cachedData) return cachedData;

	try {
		await prisma.$connect();
		const locations = await prisma.trialLocations.findMany({
			where: { nctNo },
		});

		if (locations) myCache.set(cacheKey, locations, 3600);
		await prisma.$disconnect();
		return locations;
	} catch (err) {
		logger.error(`Error fetching locations for NCT number ${nctNo}:`, err);
		await prisma.$disconnect();
		throw err;
	}
}

async function insertClinicalStudy(entries) {
	try {
		await prisma.$connect();
		await prisma.protocol.deleteMany();
		// Helper function to chunk an array into smaller arrays of a given size
		const chunkArray = (arr, size) =>
			Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
				arr.slice(i * size, i * size + size),
			);

		// Split entries into chunks of size 10
		const entryChunks = chunkArray(entries, 10);

		for (const chunk of entryChunks) {
			const upsertPromises = entries.map((entry) => {
				// Helper function to parse integers or return null
				const parseToIntOrNull = (value) => {
					const parsed = parseInt(value, 10);
					return isNaN(parsed) ? null : parsed;
				};

				// Helper function to format dates or return null
				const formatDateOrNull = (date) => {
					if (!date) return null;
					const parsedDate = new Date(date);
					return isNaN(parsedDate.getTime())
						? null
						: parsedDate.toISOString();
				};

				// Apply the helper function to necessary fields
				const parsedEntry = {
					...entry,
					protocolId: parseToIntOrNull(entry.protocolId),
					protocolTargetAccrual: parseToIntOrNull(
						entry.protocolTargetAccrual,
					),
					rcLowerAccrualGoal: parseToIntOrNull(
						entry.rcLowerAccrualGoal,
					),
					rcUpperAccrualGoal: parseToIntOrNull(
						entry.rcUpperAccrualGoal,
					),
					primaryCompletionDate: formatDateOrNull(
						entry.primaryCompletionDate,
					),
					MinimumAge: parseToIntOrNull(entry.MinimumAge),
					MaximumAge: parseToIntOrNull(entry.MaximumAge),
				};

				return prisma.protocol.upsert({
					where: {
						protocolId: parsedEntry.protocolId,
					},
					update: validateAndTransformEntry(parsedEntry),
					create: validateAndTransformEntry(parsedEntry),
				});
			});

			await Promise.all(upsertPromises);
		}
		await prisma.$disconnect();
		return 'All protocols successfully inserted/updated.';
	} catch (err) {
		logger.error('Inserting/Updating Protocols error:', err);
		await prisma.$disconnect();
		throw err;
	}
}

async function insertClinicalStudyLocation(entries) {
	try {
		await prisma.$connect();
		await prisma.trialLocations.deleteMany();

		const batchSize = 10; // Adjust batch size as needed
		for (let i = 0; i < entries.length; i += batchSize) {
			const batch = entries.slice(i, i + batchSize);
			const insertPromises = batch.map((entry) =>
				prisma.trialLocations.create({ data: entry }),
			);
			await Promise.all(insertPromises);
		}

		await prisma.$disconnect();
		return 'All protocol locations successfully inserted.';
	} catch (err) {
		logger.error('Inserting Protocols location error:', err);
		await prisma.$disconnect();
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
