const sql = require('mssql');

// Environment variables or configuration management tools are recommended here
const config = {
	user: process.env.DB_USER || 'user_CStudies',
	password:
		process.env.DB_PASSWORD ||
		'foggy-misogyny-digestible-irascible-require-diamond',
	server: process.env.DB_SERVER || 'com-dtrust-test.bluecat.arizona.edu',
	database: process.env.DB_DATABASE || 'ClinicalStudies',
};

async function fetchClinicalStudies() {
	let pool = null;

	try {
		pool = await new sql.ConnectionPool(config).connect();

		const result = await pool
			.request()
			.query(
				'SELECT NCTId, [OfficialTitle], [BriefSummary] FROM [dbo].[ClinicalStudies];',
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

// ... (rest of your imports and other code)

async function fetchClinicalStudyById(id) {
	let pool = null;

	try {
		pool = await new sql.ConnectionPool(config).connect();

		const result = await pool
			.request()
			.input('NCTId', sql.NVarChar, id) // Assuming the NCTId column is of type nvarchar
			.query(
				'SELECT * FROM [dbo].[ClinicalStudies] WHERE NCTId = @NCTId;',
			);

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

module.exports = {
	fetchClinicalStudies,
	fetchClinicalStudyById,
};
