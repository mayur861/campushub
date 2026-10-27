const pool = require("../config/db");

const getAdminDashboard = async(req, res) => {
    try {

        // Total users
        const [users] = await pool.query(
            `SELECT COUNT(*) AS total_users
             FROM users`
        );

        // Total students
        const [students] = await pool.query(
            `SELECT COUNT(*) AS total_students
             FROM students`
        );

        // Total faculty
        const [faculty] = await pool.query(
            `SELECT COUNT(*) AS total_faculty
             FROM faculty`
        );

        // Total companies
        const [companies] = await pool.query(
            `SELECT COUNT(*) AS total_companies
             FROM companies`
        );

        // Total jobs
        const [jobs] = await pool.query(
            `SELECT COUNT(*) AS total_jobs
             FROM jobs`
        );

        // Total applications
        const [applications] = await pool.query(
            `SELECT COUNT(*) AS total_applications
             FROM applications`
        );

        // Recent users
        const [recentUsers] = await pool.query(
            `SELECT
                id,
                name,
                email,
                role
             FROM users
             ORDER BY id DESC
             LIMIT 10`
        );

        res.json({
            success: true,

            statistics: {
                total_users: users[0].total_users,

                total_students: students[0].total_students,

                total_faculty: faculty[0].total_faculty,

                total_companies: companies[0].total_companies,

                total_jobs: jobs[0].total_jobs,

                total_applications: applications[0].total_applications
            },

            recent_users: recentUsers
        });

    } catch (error) {

        console.error(
            "Admin Dashboard Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};

module.exports = {
    getAdminDashboard
};