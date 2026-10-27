const pool = require("../config/db");


// ==========================================
// COMPANY DASHBOARD
// ==========================================

const getCompanyDashboard = async(req, res) => {
    try {

        const userId = req.user.id;


        // Get company
        const [companies] = await pool.query(
            `SELECT
                id,
                company_name,
                industry,
                website,
                description,
                approved
             FROM companies
             WHERE user_id = ?`, [userId]
        );


        if (companies.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Company profile not found"
            });

        }


        const company = companies[0];


        // Total jobs
        const [jobs] = await pool.query(
            `SELECT COUNT(*) AS total_jobs
             FROM jobs
             WHERE company_id = ?`, [company.id]
        );


        // Total applications
        const [applications] = await pool.query(
            `SELECT COUNT(*) AS total_applications
             FROM applications a
             INNER JOIN jobs j
             ON a.job_id = j.id
             WHERE j.company_id = ?`, [company.id]
        );


        // Selected students
        const [selected] = await pool.query(
            `SELECT COUNT(*) AS selected_students
             FROM applications a
             INNER JOIN jobs j
             ON a.job_id = j.id
             WHERE j.company_id = ?
             AND a.status = 'selected'`, [company.id]
        );


        // Shortlisted students
        const [shortlisted] = await pool.query(
            `SELECT COUNT(*) AS shortlisted_students
             FROM applications a
             INNER JOIN jobs j
             ON a.job_id = j.id
             WHERE j.company_id = ?
             AND a.status = 'shortlisted'`, [company.id]
        );


        // Recent jobs
        const [recentJobs] = await pool.query(
            `SELECT
                id,
                title,
                location,
                job_type,
                min_cgpa,
                salary,
                deadline
             FROM jobs
             WHERE company_id = ?
             ORDER BY id DESC
             LIMIT 10`, [company.id]
        );


        res.json({
            success: true,

            company: {
                id: company.id,
                company_name: company.company_name,
                industry: company.industry,
                website: company.website,
                description: company.description,
                approved: company.approved
            },

            statistics: {
                total_jobs: jobs[0].total_jobs,
                total_applications: applications[0].total_applications,
                shortlisted_students: shortlisted[0].shortlisted_students,
                selected_students: selected[0].selected_students
            },

            recent_jobs: recentJobs
        });


    } catch (error) {

        console.error(
            "Company Dashboard Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};



// ==========================================
// COMPANY APPLICATIONS
// ==========================================

const getCompanyApplications = async(req, res) => {

    try {

        const userId = req.user.id;


        // Find company
        const [companies] = await pool.query(
            `SELECT id
             FROM companies
             WHERE user_id = ?`, [userId]
        );


        if (companies.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Company profile not found"
            });

        }


        const companyId = companies[0].id;


        // Get applications
        const [applications] = await pool.query(
            `SELECT
                a.id,
                a.job_id,
                a.student_id,
                a.status,
                a.applied_at,

                j.title AS job_title,

                u.name AS student_name,
                u.email AS student_email,

                s.enrollment_no,
                s.cgpa

             FROM applications a

             INNER JOIN jobs j
             ON a.job_id = j.id

             INNER JOIN students s
             ON a.student_id = s.id

             INNER JOIN users u
             ON s.user_id = u.id

             WHERE j.company_id = ?

             ORDER BY a.id DESC`, [companyId]
        );


        res.json({
            success: true,
            count: applications.length,
            data: applications
        });


    } catch (error) {

        console.error(
            "Company Applications Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

};



// ==========================================
// UPDATE APPLICATION STATUS
// ==========================================

const updateCompanyApplicationStatus =
    async(req, res) => {

        try {

            const userId = req.user.id;

            const applicationId =
                req.params.id;

            const { status } = req.body;


            // Allowed statuses
            const allowedStatuses = [
                "applied",
                "shortlisted",
                "rejected",
                "selected"
            ];


            if (!status ||
                !allowedStatuses.includes(status)
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid application status"
                });

            }


            // Find company
            const [companies] =
            await pool.query(
                `SELECT id
                     FROM companies
                     WHERE user_id = ?`, [userId]
            );


            if (companies.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Company profile not found"
                });

            }


            const companyId =
                companies[0].id;


            // Verify application belongs
            // to this company
            const [applications] =
            await pool.query(
                `SELECT
                        a.id,
                        a.student_id,
                        j.title AS job_title
                     FROM applications a
                     INNER JOIN jobs j
                     ON a.job_id = j.id
                     WHERE a.id = ?
                     AND j.company_id = ?`, [
                    applicationId,
                    companyId
                ]
            );


            if (applications.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Application not found"
                });

            }


            // Update status
            await pool.query(
                `UPDATE applications
                 SET status = ?
                 WHERE id = ?`, [
                    status,
                    applicationId
                ]
            );


            // Create notification
            let notificationMessage =
                `Your application for ${applications[0].job_title} has been updated to ${status}.`;


            await pool.query(
                `INSERT INTO notifications
                (student_id, message)
                VALUES (?, ?)`, [
                    applications[0].student_id,
                    notificationMessage
                ]
            );


            res.json({
                success: true,
                message: "Application status updated successfully"
            });


        } catch (error) {

            console.error(
                "Update Company Application Error:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Server error"
            });

        }

    };



module.exports = {
    getCompanyDashboard,
    getCompanyApplications,
    updateCompanyApplicationStatus
};