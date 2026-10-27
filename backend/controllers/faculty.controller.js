const pool = require("../config/db");


// =========================================
// FACULTY DASHBOARD
// =========================================

const getFacultyDashboard = async(req, res) => {
    try {

        const userId = req.user.id;


        const [facultyRows] = await pool.query(
            `SELECT
                f.id,
                u.name,
                u.email,
                f.employee_id,
                d.name AS department_name
             FROM faculty f
             JOIN users u
             ON f.user_id = u.id
             LEFT JOIN departments d
             ON f.department_id = d.id
             WHERE f.user_id = ?`, [userId]
        );


        if (facultyRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Faculty profile not found"
            });
        }


        const faculty =
            facultyRows[0];


        const [subjects] = await pool.query(
            `SELECT
                id,
                name,
                code,
                semester
             FROM subjects
             WHERE department_id = (
                 SELECT department_id
                 FROM faculty
                 WHERE user_id = ?
             )
             ORDER BY semester, name`, [userId]
        );


        const [studentCount] = await pool.query(
            `SELECT
                COUNT(*) AS total_students
             FROM students
             WHERE department_id = (
                 SELECT department_id
                 FROM faculty
                 WHERE user_id = ?
             )`, [userId]
        );


        const [attendanceCount] =
        await pool.query(
            `SELECT
                    COUNT(a.id)
                    AS total_attendance_records
                 FROM attendance a
                 JOIN students s
                 ON a.student_id = s.id
                 WHERE s.department_id = (
                     SELECT department_id
                     FROM faculty
                     WHERE user_id = ?
                 )`, [userId]
        );


        const [marksCount] =
        await pool.query(
            `SELECT
                    COUNT(m.id)
                    AS total_marks_records
                 FROM marks m
                 JOIN students s
                 ON m.student_id = s.id
                 WHERE s.department_id = (
                     SELECT department_id
                     FROM faculty
                     WHERE user_id = ?
                 )`, [userId]
        );


        res.json({
            success: true,

            faculty: faculty,

            subjects: {
                count: subjects.length,
                data: subjects
            },

            statistics: {
                total_students: studentCount[0]
                    .total_students,

                total_attendance_records: attendanceCount[0]
                    .total_attendance_records,

                total_marks_records: marksCount[0]
                    .total_marks_records
            }
        });


    } catch (error) {

        console.error(
            "Faculty Dashboard Error:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =========================================
// FACULTY STUDENTS
// =========================================

const getFacultyStudents = async(req, res) => {
    try {

        const userId = req.user.id;


        const [students] = await pool.query(
            `SELECT
                s.id,
                u.name,
                u.email,
                s.enrollment_no,
                s.semester,
                s.cgpa,
                s.phone,
                s.resume,
                d.name AS department_name
             FROM students s
             JOIN users u
             ON s.user_id = u.id
             LEFT JOIN departments d
             ON s.department_id = d.id

             WHERE s.department_id = (
                 SELECT department_id
                 FROM faculty
                 WHERE user_id = ?
             )

             ORDER BY u.name`, [userId]
        );


        res.json({
            success: true,
            count: students.length,
            data: students
        });


    } catch (error) {

        console.error(
            "Get Faculty Students Error:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =========================================
// FACULTY SUBJECTS
// =========================================

const getFacultySubjects = async(req, res) => {
    try {

        const userId = req.user.id;


        const [subjects] = await pool.query(
            `SELECT
                s.id,
                s.name,
                s.code,
                s.semester
             FROM subjects s
             JOIN faculty f
             ON s.department_id =
                f.department_id
             WHERE f.user_id = ?
             ORDER BY
                s.semester,
                s.name`, [userId]
        );


        res.json({
            success: true,
            count: subjects.length,
            data: subjects
        });


    } catch (error) {

        console.error(
            "Get Faculty Subjects Error:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    getFacultyDashboard,
    getFacultyStudents,
    getFacultySubjects
};