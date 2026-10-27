const pool = require("../config/db");

// ==========================================
// CREATE JOB
// ==========================================
const createJob = async(req, res) => {
    try {
        const {
            company_id,
            title,
            description,
            location,
            job_type,
            min_cgpa,
            salary,
            deadline
        } = req.body;

        if (!company_id || !title || !description || !job_type) {
            return res.status(400).json({
                success: false,
                message: "Company ID, title, description and job type are required"
            });
        }

        if (!["internship", "full_time"].includes(job_type)) {
            return res.status(400).json({
                success: false,
                message: "Job type must be internship or full_time"
            });
        }

        if (
            min_cgpa !== undefined &&
            min_cgpa !== null &&
            (min_cgpa < 0 || min_cgpa > 10)
        ) {
            return res.status(400).json({
                success: false,
                message: "CGPA must be between 0 and 10"
            });
        }

        // Check company
        const [companies] = await pool.query(
            "SELECT id, company_name FROM companies WHERE id = ?", [company_id]
        );

        if (companies.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        // Create job
        const [result] = await pool.query(
            `INSERT INTO jobs
            (
                company_id,
                title,
                description,
                location,
                job_type,
                min_cgpa,
                salary,
                deadline
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                company_id,
                title,
                description,
                location || null,
                job_type,
                min_cgpa !== undefined ? min_cgpa : null,
                salary !== undefined ? salary : null,
                deadline || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Job created successfully",
            jobId: result.insertId
        });

    } catch (error) {
        console.error("Create Job Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// GET ALL JOBS
// ==========================================
const getJobs = async(req, res) => {
    try {
        const [jobs] = await pool.query(
            `SELECT
                j.id,
                j.company_id,
                c.company_name,
                j.title,
                j.description,
                j.location,
                j.job_type,
                j.min_cgpa,
                j.salary,
                j.deadline,
                j.created_at
             FROM jobs j
             JOIN companies c
             ON j.company_id = c.id
             ORDER BY j.created_at DESC`
        );

        res.json({
            success: true,
            count: jobs.length,
            data: jobs
        });

    } catch (error) {
        console.error("Get Jobs Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// GET JOB BY ID
// ==========================================
const getJobById = async(req, res) => {
    try {
        const jobId = req.params.id;

        const [jobs] = await pool.query(
            `SELECT
                j.id,
                j.company_id,
                c.company_name,
                j.title,
                j.description,
                j.location,
                j.job_type,
                j.min_cgpa,
                j.salary,
                j.deadline,
                j.created_at
             FROM jobs j
             JOIN companies c
             ON j.company_id = c.id
             WHERE j.id = ?`, [jobId]
        );

        if (jobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        res.json({
            success: true,
            data: jobs[0]
        });

    } catch (error) {
        console.error("Get Job Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// UPDATE JOB
// ==========================================
const updateJob = async(req, res) => {
    try {
        const jobId = req.params.id;

        const {
            title,
            description,
            location,
            job_type,
            min_cgpa,
            salary,
            deadline
        } = req.body;

        if (
            job_type &&
            !["internship", "full_time"].includes(job_type)
        ) {
            return res.status(400).json({
                success: false,
                message: "Job type must be internship or full_time"
            });
        }

        if (
            min_cgpa !== undefined &&
            min_cgpa !== null &&
            (min_cgpa < 0 || min_cgpa > 10)
        ) {
            return res.status(400).json({
                success: false,
                message: "CGPA must be between 0 and 10"
            });
        }

        const [existing] = await pool.query(
            "SELECT id FROM jobs WHERE id = ?", [jobId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        await pool.query(
            `UPDATE jobs
             SET
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                location = COALESCE(?, location),
                job_type = COALESCE(?, job_type),
                min_cgpa = COALESCE(?, min_cgpa),
                salary = COALESCE(?, salary),
                deadline = COALESCE(?, deadline)
             WHERE id = ?`, [
                title !== undefined ? title : null,
                description !== undefined ? description : null,
                location !== undefined ? location : null,
                job_type !== undefined ? job_type : null,
                min_cgpa !== undefined ? min_cgpa : null,
                salary !== undefined ? salary : null,
                deadline !== undefined ? deadline : null,
                jobId
            ]
        );

        res.json({
            success: true,
            message: "Job updated successfully"
        });

    } catch (error) {
        console.error("Update Job Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// EXPORT
// ==========================================
module.exports = {
    createJob,
    getJobs,
    getJobById,
    updateJob
};