const pool = require("../config/db");
const { createNotification } = require("./notification.controller");


// ==========================================
// STUDENT APPLY FOR JOB
// ==========================================
const applyForJob = async(req, res) => {
    try {
        const userId = req.user.id;
        const { job_id } = req.body;

        if (!job_id) {
            return res.status(400).json({
                success: false,
                message: "Job ID is required"
            });
        }

        // Find student
        const [students] = await pool.query(
            "SELECT id, cgpa FROM students WHERE user_id = ?", [userId]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        const student = students[0];

        // Find job
        const [jobs] = await pool.query(
            `SELECT
                id,
                company_id,
                title,
                min_cgpa,
                deadline
             FROM jobs
             WHERE id = ?`, [job_id]
        );

        if (jobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        const job = jobs[0];

        // Check deadline
        if (
            job.deadline &&
            new Date(job.deadline) < new Date()
        ) {
            return res.status(400).json({
                success: false,
                message: "Job application deadline has passed"
            });
        }

        // Check CGPA
        if (
            job.min_cgpa !== null &&
            student.cgpa < job.min_cgpa
        ) {
            return res.status(400).json({
                success: false,
                message: "Student does not meet the minimum CGPA requirement"
            });
        }

        // Check duplicate application
        const [existing] = await pool.query(
            `SELECT id
             FROM applications
             WHERE student_id = ?
             AND job_id = ?`, [student.id, job_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Already applied for this job"
            });
        }

        // Create application
        const [result] = await pool.query(
            `INSERT INTO applications
             (student_id, job_id)
             VALUES (?, ?)`, [student.id, job_id]
        );

        res.status(201).json({
            success: true,
            message: "Job application submitted successfully",
            applicationId: result.insertId
        });

    } catch (error) {
        console.error("Apply Job Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// STUDENT VIEW OWN APPLICATIONS
// ==========================================
const getMyApplications = async(req, res) => {
    try {
        const userId = req.user.id;

        const [students] = await pool.query(
            "SELECT id FROM students WHERE user_id = ?", [userId]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        const studentId = students[0].id;

        const [applications] = await pool.query(
            `SELECT
                a.id,
                a.job_id,
                j.title,
                j.location,
                j.job_type,
                j.salary,
                j.deadline,
                c.company_name,
                a.status,
                a.applied_at,
                a.updated_at
             FROM applications a
             JOIN jobs j
             ON a.job_id = j.id
             JOIN companies c
             ON j.company_id = c.id
             WHERE a.student_id = ?
             ORDER BY a.applied_at DESC`, [studentId]
        );

        res.json({
            success: true,
            count: applications.length,
            data: applications
        });

    } catch (error) {
        console.error("Get Applications Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// ADMIN / COMPANY VIEW JOB APPLICATIONS
// ==========================================
const getJobApplications = async(req, res) => {
    try {
        const jobId = req.params.jobId;

        const [applications] = await pool.query(
            `SELECT
                a.id,
                a.student_id,
                u.name AS student_name,
                u.email AS student_email,
                s.enrollment_no,
                s.cgpa,
                s.phone,
                s.resume,
                a.job_id,
                j.title AS job_title,
                a.status,
                a.applied_at,
                a.updated_at
             FROM applications a
             JOIN students s
             ON a.student_id = s.id
             JOIN users u
             ON s.user_id = u.id
             JOIN jobs j
             ON a.job_id = j.id
             WHERE a.job_id = ?
             ORDER BY a.applied_at DESC`, [jobId]
        );

        res.json({
            success: true,
            count: applications.length,
            data: applications
        });

    } catch (error) {
        console.error("Get Job Applications Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// UPDATE APPLICATION STATUS
// ==========================================
const updateApplicationStatus = async(req, res) => {
    try {
        const applicationId = req.params.id;
        const { status } = req.body;

        const allowedStatuses = [
            "applied",
            "shortlisted",
            "rejected",
            "selected"
        ];

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application status"
            });
        }

        // Get application + student + job details
        const [applications] = await pool.query(
            `SELECT
                a.id,
                a.student_id,
                a.job_id,
                j.title AS job_title,
                u.name AS student_name
             FROM applications a
             JOIN students s
             ON a.student_id = s.id
             JOIN users u
             ON s.user_id = u.id
             JOIN jobs j
             ON a.job_id = j.id
             WHERE a.id = ?`, [applicationId]
        );

        if (applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        const application = applications[0];

        // Update application status
        await pool.query(
            `UPDATE applications
             SET status = ?
             WHERE id = ?`, [status, applicationId]
        );

        // Create notification
        const notificationMessage =
            `Your application for "${application.job_title}" has been ${status}.`;

        await createNotification(
            application.student_id,
            notificationMessage
        );

        res.json({
            success: true,
            message: "Application status updated successfully",
            notification: notificationMessage
        });

    } catch (error) {
        console.error("Update Application Status Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    applyForJob,
    getMyApplications,
    getJobApplications,
    updateApplicationStatus
};