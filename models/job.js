"use strict";

// NOTE/OBSERVATION: "equity" column uses NUMERIC type due to potential precision loss
// with FLOAT another problem will arise when we query this value but we should use
// library pg. The value that is returned from querying is a string due to the
// fact again to keep precision especially in financial data.

const db = require("../db");
const { sqlForPartialUpdate, queryJobs } = require("../helpers/sql");

class Job {
	/** Create a job (from data), update db, return new job data.
	 *
	 * data should be { title, salary, equity, companyHandle }
	 *
	 * Returns { title, salary, equity, companyHandle }
	 *
	 * Throws BadRequestError if job already in database.
	 * */

	static async create({ title, salary, equity, companyHandle }) {
		const result = await db.query(
			`INSERT INTO jobs 
			(title, salary, equity, company_handle)
			VALUES ($1, $2, $3, $4)
			RETURNING id, title, salary, equity, company_handle AS "companyHandle"
			`,
			[title, salary, equity, companyHandle]
		);
		return result.rows[0];
	}

	/** Find all jobs or query your job by title
	 *
	 *  Returns [{ title, salary, equity, companyHandle }, ...]
	 * */

	static async findAll(query) {
		const queryArray = queryJobs(query);

		const jobRes = await db.query(
			`SELECT id, title,
			            salary,
			            equity,
						company_handle AS "companyHandle"
			            FROM jobs ${
										queryArray.length ? "WHERE " + queryArray.join(" AND ") : ""
									} ORDER BY title`
		);
		return jobRes.rows;
	}

	/** Given a job id, return data about job.
	 *
	 * Returns { id, title, salary, equity, companyHandle, company }
	 *   where company is { handle, name, description, numEmployees, logoUrl }
	 *
	 * Throws NotFoundError if not found.
	 **/

	static async get(id) {
		const jobRes = await db.query(
			`SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
			[id]
		);

		const job = jobRes.rows[0];
		console.log("JOB: " + JSON.stringify(job));
		if (!job) throw new NotFoundError(`No job: ${id}`);
		const company = await db.query(
			`SELECT handle,
								name,
								description,
								num_employees AS "numEmployees",
								logo_url AS "logoUrl" 
		                  FROM companies 
						  WHERE handle = $1
		                 `,
			[job.companyHandle]
		);
		delete job.companyHandle;
		job.company = company.rows[0];
		return job;
	}

	/** Update job data with `data`.
	 *
	 * This is a "partial update" --- it's fine if data doesn't contain all the
	 * fields; this only changes provided ones.
	 *
	 * Data can include: {title, salary, equity}
	 *
	 * Returns {title, salary, equity, companyHandle}
	 *
	 * Throws NotFoundError if not found.
	 */

	static async update(id, data) {
		const { setCols, values } = sqlForPartialUpdate(data);
		const idVarIdx = "$" + (values.length + 1);

		const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING title, 
                                salary, 
                                equity`;
		const result = await db.query(querySql, [...values, id]);
		const job = result.rows[0];

		if (!job) throw new NotFoundError(`No job: ${id}`);

		return job;
	}

	/** Delete given job from database; returns undefined.
	 *
	 * Throws NotFoundError if job not found.
	 **/

	static async remove(id) {
		const result = await db.query(
			`DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
			[id]
		);
		const job = result.rows[0];

		if (!job) throw new NotFoundError(`No job: ${id}`);
	}
}

module.exports = Job;
