"use strict";
var pg = require("pg");

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

// Fix for parsing of numeric fields
var types = require("pg").types;
types.setTypeParser(1700, "text", parseFloat);

const Job = require("./job");
const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create", function () {
	const newJob = {
		title: "AWS Engineer",
		salary: 125000,
		equity: 0.097,
		companyHandle: "c1",
	};

	test("works", async function () {
		let job = await Job.create(newJob);
		expect(job).toEqual(newJob);

		const result = await db.query(
			`SELECT title, salary, equity, company_handle
		   FROM jobs
		   WHERE title = 'AWS Engineer'`
		);

		expect(result.rows).toEqual([
			{
				title: "AWS Engineer",
				salary: 125000,
				equity: 0.097,
				company_handle: "c1",
			},
		]);
	});
});

/************************************** findAll */

describe("findAll", function () {
	test("works: no filter", async function () {
		let jobs = await Job.findAll();
		expect(jobs).toEqual([
			{ title: "Algorithm Specialist", salary: 150000, equity: 0.074 },
			{ title: "Backend Developer", salary: 120000, equity: 0.087 },
			{ title: "Data Scientist", salary: 155000, equity: 0 },
			{ title: "Front End Developer ", salary: 115000, equity: 0.054 },
			{ title: "Node Engineer", salary: 125000, equity: 0.089 },
			{ title: "Researcher", salary: 95000, equity: 0.065 },
			{ title: "Software Engineer", salary: 120000, equity: 0.097 },
		]);
	});
	test("works: with filter title", async function () {
		let jobs = await Job.findAll({ title: "scientist" });
		expect(jobs).toEqual([
			{
				title: "Data Scientist",
				salary: 155000,
				equity: 0,
			},
		]);
	});
});

/************************************** update a job */

describe("update", function () {
	const updateData = {
		title: "AWS Engineer",
		salary: 125000,
		equity: 0.097,
	};

	test("works", async function () {
		const id = await db.query(
			`SELECT id
           FROM jobs
           WHERE title = 'Node Engineer'`
		);
		let job = await Job.update(id.rows[0].id, updateData);
		expect(job).toEqual({
			...updateData,
		});

		const result = await db.query(
			`SELECT title, salary, equity
           	 FROM jobs
             WHERE title = 'AWS Engineer'`
		);
		expect(result.rows).toEqual([
			{
				title: "AWS Engineer",
				salary: 125000,
				equity: 0.097,
			},
		]);
	});

	test("works: null fields", async function () {
		const id = await db.query(
			`SELECT id
	       	 FROM jobs
	         WHERE title = 'Node Engineer'
			`
		);
		const updateDataSetNulls = {
			title: "AWS Engineer",
			salary: null,
			equity: null,
		};
		let job = await Job.update(id.rows[0].id, updateDataSetNulls);
		expect(job).toEqual({
			...updateDataSetNulls,
		});
		const result = await db.query(
			`SELECT title, salary, equity
           	 FROM jobs
             WHERE title = 'AWS Engineer'`
		);
		expect(result.rows).toEqual([
			{
				title: "AWS Engineer",
				salary: null,
				equity: null,
			},
		]);
	});

	test("not found if no such job", async function () {
		try {
			await Job.update(200, updateData);
			fail();
		} catch (err) {
			//let getClassOf = Function.prototype.call.bind(Object.prototype.toString);
			expect(err instanceof Error).toBeTruthy();
		}
	});

	test("bad request with no data", async function () {
		try {
			await Job.update(250, {});
			fail();
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});
});

/************************************** remove */

describe("remove", function () {
	test("works", async function () {
		const id = await db.query(
			`SELECT id
	       	 FROM jobs
	         WHERE title = 'Node Engineer'
			`
		);
		await Job.remove(id.rows[0].id);
		const res = await db.query(
			`SELECT title FROM jobs WHERE title='Node Engineer'`
		);
		expect(res.rows.length).toEqual(0);
	});

	test("not found if no such company", async function () {
		try {
			await Company.remove(10000000);
			fail();
		} catch (err) {
			expect(err instanceof Error).toBeTruthy();
		}
	});
});
