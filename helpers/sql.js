const { BadRequestError } = require("../expressError");

/* Will partial update(PATCH) by getting all columns for setting them to update
   as in {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
   UPDATE <table> SET "first_name"=$1, "age"=$2... <|_________|
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
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

module.exports = { sqlForPartialUpdate };
