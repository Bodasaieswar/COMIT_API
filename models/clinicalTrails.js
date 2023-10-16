const sql = require('mssql');
const Joi = require('joi');

// Environment variables or configuration management tools are recommended here
// const config = {
// 	user: process.env.DB_USER || 'admin',
// 	password: process.env.DB_PASSWORD || 'Pa$$w0rd',
// 	server:
// 		process.env.DB_SERVER ||
// 		'aws-comit.cuuxhpxisntp.us-east-2.rds.amazonaws.com',
// 	database: process.env.DB_DATABASE || 'ClinicalStudies',
// 	options: {
// 		encrypt: true, // Use this if you're on Windows Azure
// 		trustServerCertificate: true, // Use this to disable certificate validation
// 	},
// };

const config = {
	user: process.env.DB_USER || 'user_CStudies',
	password:
		process.env.DB_PASSWORD ||
		'foggy-misogyny-digestible-irascible-require-diamond',
	server: process.env.DB_SERVER || 'com-dtrust-test.bluecat.arizona.edu',
	database: process.env.DB_DATABASE || 'ClinicalStudies',
	options: {
		encrypt: true, // Use this if you're on Windows Azure
		trustServerCertificate: true, // Use this to disable certificate validation
	},
};

async function fetchClinicalStudies() {
	let pool = null;

	try {
		pool = await new sql.ConnectionPool(config).connect();

		const result = await pool
			.request()
			.query(
				'SELECT NCTId, OfficialTitle, BriefSummary FROM ClinicalStudies;',
			);
		return result.recordset;
	} catch (err) {
		console.error('Error:', err);
		throw err; // Propagate the error so it can be handled in the route
	} finally {
		if (pool) {
			pool.close();
		}
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

	let pool = null;

	try {
		pool = await new sql.ConnectionPool(config).connect();

		const result = await pool
			.request()
			.input('NCTId', sql.NVarChar, id)
			.query('SELECT * FROM ClinicalStudies WHERE NCTId = @NCTId;');

		return result.recordset;
	} catch (err) {
		console.error('Error:', err);
		throw err;
	} finally {
		if (pool) {
			pool.close();
		}
	}
}

async function insertClinicalStudy(entry) {
	let pool = null;
	try {
		pool = await new sql.ConnectionPool(config).connect();

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
		console.error('Error:', err);
		throw err;
	} finally {
		if (pool) {
			pool.close();
		}
	}
}

module.exports = {
	fetchClinicalStudies,
	fetchClinicalStudyById,
	insertClinicalStudy,
};
