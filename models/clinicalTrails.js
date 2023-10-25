const sql = require('mssql');
const Joi = require('joi');
const logger = require('../logger');

const config = {
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	server: process.env.DB_SERVER,
	database: process.env.DB_DATABASE,
	options: {
		encrypt: true, // Use this if you're on Windows Azure
		trustServerCertificate: true, // Use this to disable certificate validation
	},
};

console.log(config.user, config.password, config.server, config.database);

if (!config.user || !config.password || !config.server || !config.database) {
	logger.error("Database environment variables aren't set properly!");
	throw new Error("Database environment variables aren't set properly!");
}

async function getConnection() {
	let pool;
	try {
		pool = await new sql.ConnectionPool(config).connect();
		return pool;
	} catch (err) {
		logger.error('DB connection error:', err);
		throw err;
	}
}

async function fetchClinicalStudies() {
	let pool = await getConnection();
	try {
		const result = await pool
			.request()
			.query(
				'SELECT NCTId, OfficialTitle, BriefSummary FROM ClinicalStudies;',
			);

		// Map the recordset to a desired structure
		const mappedResults = result.recordset.map((record) => ({
			nctId: record.NCTId,
			title: record.OfficialTitle,
			summary: record.BriefSummary,
		}));

		const prettyJson = JSON.stringify(mappedResults, null, 2);
		console.log(prettyJson);

		return mappedResults;
	} catch (err) {
		logger.error('Fetching Clinical Studies error:', err);
		throw err;
	} finally {
		pool.close();
	}
}

async function fetchClinicalStudyById(id) {
	// Define the Joi schema for NCTId validation
	const schema = Joi.string()
		.regex(/^NCT\d{8}$/)
		.required();

	const { error } = schema.validate(id);
	if (error) {
		throw new Error('Invalid NCTId format.');
	}

	let pool = await getConnection();
	try {
		const result = await pool
			.request()
			.input('NCTId', sql.NVarChar, id)
			.query('SELECT * FROM ClinicalStudies WHERE NCTId = @NCTId;');
		return result.recordset;
	} catch (err) {
		logger.error('Fetching Clinical Study by ID error:', err);
		throw err;
	} finally {
		pool.close();
	}
}

async function insertClinicalStudy(entry) {
	let pool = await getConnection();
	try {
		const { NCTId, OfficialTitle, BriefSummary } = entry.body;

		const result = await pool
			.request()
			.input('NCTId', sql.NVarChar, NCTId)
			.input('OfficialTitle', sql.NVarChar, OfficialTitle)
			.input('BriefSummary', sql.NVarChar, BriefSummary)
			.query(
				'INSERT INTO ClinicalStudies (NCTID, OfficialTitle, BriefSummary) VALUES (@NCTId, @OfficialTitle, @BriefSummary)',
			);

		if (result.rowsAffected[0] > 0) {
			return 'Row successfully inserted.';
		} else {
			return 'No row inserted.';
		}
	} catch (err) {
		logger.error('Inserting Clinical Study error:', err);
		throw err;
	} finally {
		pool.close();
	}
}

module.exports = {
	fetchClinicalStudies,
	fetchClinicalStudyById,
	insertClinicalStudy,
};
