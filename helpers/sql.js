const { BadRequestError } = require("../expressError");

/* Will partial update(PATCH) by getting all columns for setting them to update
   as in {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
   UPDATE <table> SET "first_name"=$1, "age"=$2... <|_________|
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql = {}) {
	/*
  dataToUpdate: data coming from database consisting of columns
  jsToSql: object consisting of column name attributes as key and its equivalent string
  */
	const keys = Object.keys(dataToUpdate);
	if (keys.length === 0) throw new BadRequestError("No data");

	// {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
	const cols = keys.map(
		(colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
	);

	return {
		setCols: cols.join(", "),
		values: Object.values(dataToUpdate),
	};
}

function queryCompanies(query) {
	/*
	Combinations of search companies using name, minEmployees, maxEmployees
	*/
	if (query === undefined) return {};
	const queryString = [];
	// for query.name --- to_tsvector(name) @@ to_tsquery('${query.name}')
	if (query.name) {
		queryString.push(`to_tsvector(name) @@ to_tsquery('${query.name}')`);
	}
	// for query.maxEmployees and query.minEmployees --- num_employees BETWEEN ${query.minEmployees} AND ${query.maxEmployees}
	if (query.minEmployees && query.maxEmployees) {
		queryString.push(
			`num_employees BETWEEN ${query.minEmployees} AND ${query.maxEmployees}`
		);
		// for query.minEmployees --- num_employees >= ${query.minEmployees}
	} else if (query.minEmployees) {
		queryString.push(`num_employees >= ${query.minEmployees}`);
		// for query.maxEmployees --- num_employees < ${query.maxEmployees}
	} else if (query.maxEmployees) {
		queryString.push(`num_employees < ${query.maxEmployees}`);
	}
	return queryString;
}

function queryJobs(query) {
	/*
	Combinations of search jobs using title
	*/
	if (query === undefined) return {};
	const queryString = [];
	// for query.title --- to_tsvector(title) @@ to_tsquery('${query.title}')
	if (query.title) {
		queryString.push(`to_tsvector(title) @@ to_tsquery('${query.title}')`);
	}
	return queryString;
}

module.exports = { sqlForPartialUpdate, queryCompanies, queryJobs };
