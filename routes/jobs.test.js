"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	u1Token,
	adminToken,
	jobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /", function () {
	const newJob = {
		title: "new",
		salary: 50000,
		equity: "0.054",
		companyHandle: "c1",
	};

	test("ok for users", async function () {
		const resp = await request(app)
			.post("/jobs")
			.send(newJob)
			.set("authorization", `Bearer ${adminToken}`);

		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			job: {
				...newJob,
				id: expect.any(Number),
			},
		});
	});

	test("bad request with missing data", async function () {
		const resp = await request(app)
			.post("/jobs")
			.send({
				title: "new",
				salary: 50000,
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});

	test("bad request with invalid data", async function () {
		const resp = await request(app)
			.post("/jobs")
			.send({
				...newJob,
				salary: "20000",
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
	test("ok for anon", async function () {
		const resp = await request(app).get("/jobs");
		expect(resp.body).toEqual({
			jobs: [
				{
					title: "Position1",
					salary: 100000,
					equity: "0.00043",
					companyHandle: "c3",
					id: expect.any(Number),
				},
				{
					title: "Position2",
					salary: 200000,
					equity: "0.00043",
					companyHandle: "c2",
					id: expect.any(Number),
				},
				{
					title: "Position3",
					salary: 50000,
					equity: "0",
					companyHandle: "c1",
					id: expect.any(Number),
				},
			],
		});
	});
	test("query title", async function () {
		const resp = await request(app).get("/jobs").query({ title: "Position1" });
		expect(resp.body).toEqual({
			jobs: [
				{
					title: "Position1",
					salary: 100000,
					equity: "0.00043",
					companyHandle: "c3",
					id: expect.any(Number),
				},
			],
		});
	});
	test("query hasEquity", async function () {
		const resp = await request(app).get("/jobs").query({ hasEquity: "true" });
		expect(resp.body).toEqual({
			jobs: [
				{
					title: "Position1",
					salary: 100000,
					equity: "0.00043",
					companyHandle: "c3",
					id: jobIds[0],
				},
				{
					title: "Position2",
					salary: 200000,
					equity: "0.00043",
					companyHandle: "c2",
					id: jobIds[1],
				},
			],
		});
	});
	test("query hasEquity,title,salary", async function () {
		const resp = await request(app)
			.get("/jobs")
			.query({ title: "Position1", minSalary: 70000, hasEquity: "true" });
		expect(resp.body).toEqual({
			jobs: [
				{
					title: "Position1",
					salary: 100000,
					equity: "0.00043",
					companyHandle: "c3",
					id: jobIds[0],
				},
			],
		});
	});
});

/************************************** GET /companies/:handle */

describe("GET /jobs/:id", function () {
	test("works for anon", async function () {
		const resp = await request(app).get(`/jobs/${jobIds[0]}`);
		expect(resp.body).toEqual({
			job: {
				id: jobIds[0],
				title: "Position1",
				salary: 100000,
				equity: "0.00043",
				company: {
					description: "Desc3",
					handle: "c3",
					logoUrl: "http://c3.img",
					name: "C3",
					numEmployees: 3,
				},
			},
		});
	});

	test("not found for no such job", async function () {
		const resp = await request(app).get(`/jobs/nope`);
		expect(resp.statusCode).toEqual(500);
	});
});

describe("PATCH /jobs/:id", function () {
	test("works for admin", async function () {
		const resp = await request(app).get(`/jobs/${jobIds[0]}`);
		expect(resp.body).toEqual({
			job: {
				id: jobIds[0],
				title: "Position1",
				salary: 100000,
				equity: "0.00043",
				company: {
					description: "Desc3",
					handle: "c3",
					logoUrl: "http://c3.img",
					name: "C3",
					numEmployees: 3,
				},
			},
		});
	});

	test("not found for no such job", async function () {
		const resp = await request(app).get(`/jobs/0`);
		expect(resp.statusCode).toEqual(500);
	});
});

/************************************** DELETE /companies/:handle */

describe("DELETE /jobs/:id", function () {
	test("jobs for users", async function () {
		const resp = await request(app)
			.delete(`/jobs/${jobIds[0]}`)
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.body).toEqual({ deleted: `${jobIds[0]}` });
	});

	test("unauth for anon", async function () {
		const resp = await request(app).delete(`/jobs/${jobIds[0]}`);
		expect(resp.statusCode).toEqual(401);
	});

	test("not found for no such job position", async function () {
		const resp = await request(app)
			.delete(`/jobs/nope`)
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(500);
	});
});
