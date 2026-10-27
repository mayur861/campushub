const pool = require("../config/db");

// Enroll student in a subject
const enrollSubject = async(req, res) => {
    try {
        const userId = req.user.id;
        const { subject_id } = req.body;

        if (!subject_id) {
            return res.status(400).json({
                success: false,
                message: "Subject ID is required"
            });
        }

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

        const [subjects] = await pool.query(
            "SELECT id, name, code FROM subjects WHERE id = ?", [subject_id]
        );

        if (subjects.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        const [existing] = await pool.query(
            `SELECT student_id, subject_id
             FROM enrollments
             WHERE student_id = ? AND subject_id = ?`, [studentId, subject_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Already enrolled in this subject"
            });
        }

        await pool.query(
            `INSERT INTO enrollments
             (student_id, subject_id)
             VALUES (?, ?)`, [studentId, subject_id]
        );

        res.status(201).json({
            success: true,
            message: "Subject enrolled successfully",
            subject: subjects[0]
        });

    } catch (error) {
        console.error("Enroll Subject Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get student's enrolled subjects
const getEnrollments = async(req, res) => {
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

        const [enrollments] = await pool.query(
            `SELECT
                e.student_id,
                e.subject_id,
                s.name AS subject_name,
                s.code,
                s.semester
             FROM enrollments e
             JOIN subjects s
             ON e.subject_id = s.id
             WHERE e.student_id = ?
             ORDER BY s.semester, s.name`, [studentId]
        );

        res.json({
            success: true,
            count: enrollments.length,
            data: enrollments
        });

    } catch (error) {
        console.error("Get Enrollments Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Drop a subject
const dropSubject = async(req, res) => {
    try {
        const userId = req.user.id;
        const subjectId = req.params.subjectId;

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

        const [result] = await pool.query(
            `DELETE FROM enrollments
             WHERE student_id = ? AND subject_id = ?`, [studentId, subjectId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Enrollment not found"
            });
        }

        res.json({
            success: true,
            message: "Subject dropped successfully"
        });

    } catch (error) {
        console.error("Drop Subject Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    enrollSubject,
    getEnrollments,
    dropSubject
};