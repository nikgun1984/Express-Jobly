"use strict";
// PART 1 Writing Test for sql.js
const { sqlForPartialUpdate } = require("./sql");

describe("test partial update", function () {
	let jsToSql;
	beforeEach(function () {
		jsToSql = jsToSql = {
			firstName: "first_name",
			lastName: "last_name",
			age: "age",
		};
	});
	test("return object with setting values and data", function () {
		const data = { firstName: "Alya", lastName: "Johnson", age: 34 };
		const res = sqlForPartialUpdate(data, jsToSql);
		expect(res).toEqual({
			setCols: '"first_name"=$1, "last_name"=$2, "age"=$3',
			values: Object.values(data),
		});
	});

	test("throw error if data is empty", function () {
		const data = {};
		expect(() => {
			sqlForPartialUpdate(data, jsToSql);
		}).toThrow("No data");
	});
});
