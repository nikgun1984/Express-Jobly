const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const jobIDs = [];

async function commonBeforeAll() {
	// noinspection SqlWithoutWhere
	await db.query("DELETE FROM companies");
	// noinspection SqlWithoutWhere
	await db.query("DELETE FROM users");

	await db.query(`
    INSERT INTO companies(handle, name, num_employees, description, logo_url)
    VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
           ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
           ('c3', 'C3', 3, 'Desc3', 'http://c3.img')`);

	const jobs = await db.query(`
    INSERT INTO jobs(title, salary, equity, company_handle)
    VALUES ('Software Engineer', 120000, 0.097, 'c1'),
           ('Front End Developer ', 115000, 0.054, 'c1'),
           ('Backend Developer', 120000, 0.087, 'c2'),
           ('Algorithm Specialist', 150000, 0.074, 'c2'),
           ('Researcher', 95000, 0.065, 'c2'),
           ('Data Scientist', 155000, 0, 'c3'),
           ('Node Engineer', 125000, 0.089, 'c3')
	RETURNING id
	`);
	jobIDs.push(...jobs.rows.map((r) => r.id));
	await db.query(
		`
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
        RETURNING username`,
		[
			await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
			await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
		]
	);

	await db.query(
		`
		INSERT INTO applications(username, job_id)
		VALUES('u1', $1)
	`,
		[jobIDs[0]]
	);
}

async function commonBeforeEach() {
	await db.query("BEGIN");
}

async function commonAfterEach() {
	await db.query("ROLLBACK");
}

async function commonAfterAll() {
	await db.end();
}

module.exports = {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	jobIDs,
};
