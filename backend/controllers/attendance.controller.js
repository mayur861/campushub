const pool = require("../config/db");


// =========================================
// MARK ATTENDANCE - FACULTY / ADMIN
// =========================================

const markAttendance = async(req, res) => {
    try {
        const userId = req.user.id;

        const {
            student_id,
            subject_id,
            attendance_date,
            status
        } = req.body;


        // -----------------------------
        // Validate input
        // -----------------------------

        if (!student_id ||
            !subject_id ||
            !attendance_date ||
            !status
        ) {
            return res.status(400).json({
                success: false,
                message: "Student ID, subject ID, date and status are required"
            });
        }


        if (!["present", "absent"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be present or absent"
            });
        }


        // =====================================
        // FACULTY SECURITY CHECK
        // =====================================

        if (req.user.role === "faculty") {

            const [faculty] = await pool.query(
                `SELECT department_id
                 FROM faculty
                 WHERE user_id = ?`, [userId]
            );


            if (faculty.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Faculty profile not found"
                });
            }


            const facultyDepartmentId =
                faculty[0].department_id;


            // -----------------------------
            // Check student department
            // -----------------------------

            const [students] = await pool.query(
                `SELECT
                    id,
                    department_id
                 FROM students
                 WHERE id = ?`, [student_id]
            );


            if (students.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Student not found"
                });
            }


            if (
                students[0].department_id !==
                facultyDepartmentId
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You can only mark attendance for students in your department"
                });
            }


            // -----------------------------
            // Check subject department
            // -----------------------------

            const [subjects] = await pool.query(
                `SELECT
                    id,
                    name,
                    code,
                    department_id
                 FROM subjects
                 WHERE id = ?`, [subject_id]
            );


            if (subjects.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Subject not found"
                });
            }


            if (
                subjects[0].department_id !==
                facultyDepartmentId
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You can only mark attendance for subjects in your department"
                });
            }
        }


        // =====================================
        // ADMIN / COMMON VALIDATION
        // =====================================

        const [students] = await pool.query(
            `SELECT id
             FROM students
             WHERE id = ?`, [student_id]
        );


        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }


        const [subjects] = await pool.query(
            `SELECT
                id,
                name,
                code
             FROM subjects
             WHERE id = ?`, [subject_id]
        );


        if (subjects.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }


        // =====================================
        // DUPLICATE CHECK
        // =====================================

        const [existing] = await pool.query(
            `SELECT id
             FROM attendance
             WHERE student_id = ?
             AND subject_id = ?
             AND attendance_date = ?`, [
                student_id,
                subject_id,
                attendance_date
            ]
        );


        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Attendance already marked for this date"
            });
        }


        // =====================================
        // INSERT ATTENDANCE
        // =====================================

        const [result] = await pool.query(
            `INSERT INTO attendance
            (
                student_id,
                subject_id,
                attendance_date,
                status
            )
            VALUES (?, ?, ?, ?)`, [
                student_id,
                subject_id,
                attendance_date,
                status
            ]
        );


        res.status(201).json({
            success: true,
            message: "Attendance marked successfully",
            attendanceId: result.insertId
        });


    } catch (error) {

        console.error(
            "Mark Attendance Error:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =========================================
// GET STUDENT ATTENDANCE
// =========================================

const getAttendance = async(req, res) => {
    try {

        const userId = req.user.id;


        const [students] = await pool.query(
            `SELECT id
             FROM students
             WHERE user_id = ?`, [userId]
        );


        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }


        const studentId = students[0].id;


        const [attendance] = await pool.query(
            `SELECT
                a.id,
                a.student_id,
                a.subject_id,
                s.name AS subject_name,
                s.code,
                a.attendance_date,
                a.status
             FROM attendance a
             JOIN subjects s
             ON a.subject_id = s.id
             WHERE a.student_id = ?
             ORDER BY a.attendance_date DESC`, [studentId]
        );


        res.json({
            success: true,
            count: attendance.length,
            data: attendance
        });


    } catch (error) {

        console.error(
            "Get Attendance Error:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =========================================
// UPDATE ATTENDANCE
// =========================================

const updateAttendance = async(req, res) => {
    try {

        const attendanceId =
            req.params.id;

        const { status } = req.body;


        if (!status ||
            !["present", "absent"].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid status is required"
            });
        }


        const [existing] = await pool.query(
            `SELECT id
             FROM attendance
             WHERE id = ?`, [attendanceId]
        );


        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found"
            });
        }


        await pool.query(
            `UPDATE attendance
             SET status = ?
             WHERE id = ?`, [
                status,
                attendanceId
            ]
        );


        res.json({
            success: true,
            message: "Attendance updated successfully"
        });


    } catch (error) {

        console.error(
            "Update Attendance Error:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =========================================
// ATTENDANCE SUMMARY
// =========================================

const getAttendanceSummary = async(req, res) => {
    try {

        const userId = req.user.id;


        const [students] = await pool.query(
            `SELECT id
             FROM students
             WHERE user_id = ?`, [userId]
        );


        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }


        const studentId =
            students[0].id;


        const [summary] = await pool.query(
            `SELECT
                s.id AS subject_id,
                s.name AS subject_name,
                s.code,

                COUNT(a.id) AS total_classes,

                SUM(
                    CASE
                        WHEN a.status = 'present'
                        THEN 1
                        ELSE 0
                    END
                ) AS present_classes,

                SUM(
                    CASE
                        WHEN a.status = 'absent'
                        THEN 1
                        ELSE 0
                    END
                ) AS absent_classes,

                ROUND(
                    (
                        SUM(
                            CASE
                                WHEN a.status = 'present'
                                THEN 1
                                ELSE 0
                            END
                        )
                        /
                        NULLIF(COUNT(a.id), 0)
                    ) * 100,
                    2
                ) AS attendance_percentage

             FROM attendance a

             JOIN subjects s
             ON a.subject_id = s.id

             WHERE a.student_id = ?

             GROUP BY
                s.id,
                s.name,
                s.code

             ORDER BY s.name`, [studentId]
        );


        res.json({
            success: true,
            count: summary.length,
            data: summary
        });


    } catch (error) {

        console.error(
            "Attendance Summary Error:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    markAttendance,
    getAttendance,
    updateAttendance,
    getAttendanceSummary
};