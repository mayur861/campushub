const pool = require("../config/db");


// ==========================================
// ADD MARKS
// ==========================================

const addMarks = async(req, res) => {
    try {

        const userId = req.user.id;

        const {
            student_id,
            subject_id,
            exam_type,
            marks
        } = req.body;


        // -------------------------------
        // Basic validation
        // -------------------------------

        if (!student_id ||
            !subject_id ||
            !exam_type ||
            marks === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Student ID, subject ID, exam type and marks are required"
            });
        }


        // -------------------------------
        // Validate exam type
        // -------------------------------

        if (!["midterm", "internal", "final"]
            .includes(exam_type)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid exam type"
            });
        }


        // -------------------------------
        // Validate marks
        // -------------------------------

        if (
            Number(marks) < 0 ||
            Number(marks) > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Marks must be between 0 and 100"
            });
        }


        // ==========================================
        // FACULTY SECURITY CHECK
        // ==========================================

        if (req.user.role === "faculty") {

            const [faculty] =
            await pool.query(
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


            // -------------------------------
            // Check student department
            // -------------------------------

            const [students] =
            await pool.query(
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
                    message: "You can only enter marks for students in your department"
                });

            }


            // -------------------------------
            // Check subject department
            // -------------------------------

            const [subjects] =
            await pool.query(
                `SELECT
                        id,
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
                    message: "You can only enter marks for subjects in your department"
                });

            }

        }


        // ==========================================
        // CHECK STUDENT
        // ==========================================

        const [studentCheck] =
        await pool.query(
            `SELECT id
                 FROM students
                 WHERE id = ?`, [student_id]
        );


        if (studentCheck.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Student not found"
            });

        }


        // ==========================================
        // CHECK SUBJECT
        // ==========================================

        const [subjectCheck] =
        await pool.query(
            `SELECT
                    id,
                    name,
                    code
                 FROM subjects
                 WHERE id = ?`, [subject_id]
        );


        if (subjectCheck.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });

        }


        // ==========================================
        // DUPLICATE CHECK
        // ==========================================

        const [existing] =
        await pool.query(
            `SELECT id
                 FROM marks
                 WHERE student_id = ?
                 AND subject_id = ?
                 AND exam_type = ?`, [
                student_id,
                subject_id,
                exam_type
            ]
        );


        if (existing.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Marks already entered for this exam"
            });

        }


        // ==========================================
        // INSERT MARKS
        // ==========================================

        const [result] =
        await pool.query(
            `INSERT INTO marks
                (
                    student_id,
                    subject_id,
                    exam_type,
                    marks
                )
                VALUES (?, ?, ?, ?)`, [
                student_id,
                subject_id,
                exam_type,
                Number(marks)
            ]
        );


        res.status(201).json({

            success: true,

            message: "Marks added successfully",

            markId: result.insertId

        });


    } catch (error) {

        console.error(
            "Add Marks Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};



// ==========================================
// GET STUDENT MARKS
// ==========================================

const getMarks = async(req, res) => {

    try {

        const userId =
            req.user.id;


        const [students] =
        await pool.query(
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


        const [marks] =
        await pool.query(
            `SELECT

                    m.id,

                    m.student_id,

                    m.subject_id,

                    s.name AS subject_name,

                    s.code,

                    m.exam_type,

                    m.marks

                 FROM marks m

                 JOIN subjects s
                 ON m.subject_id = s.id

                 WHERE m.student_id = ?

                 ORDER BY
                    s.name,
                    m.exam_type`, [studentId]
        );


        res.json({

            success: true,

            count: marks.length,

            data: marks

        });


    } catch (error) {

        console.error(
            "Get Marks Error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};



// ==========================================
// UPDATE MARKS
// ==========================================

const updateMarks = async(req, res) => {

    try {

        const markId =
            req.params.id;

        const {
            marks
        } = req.body;


        if (marks === undefined) {

            return res.status(400).json({
                success: false,
                message: "Marks are required"
            });

        }


        if (
            Number(marks) < 0 ||
            Number(marks) > 100
        ) {

            return res.status(400).json({
                success: false,
                message: "Marks must be between 0 and 100"
            });

        }


        const [existing] =
        await pool.query(
            `SELECT id
                 FROM marks
                 WHERE id = ?`, [markId]
        );


        if (existing.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Marks record not found"
            });

        }


        await pool.query(
            `UPDATE marks
             SET marks = ?
             WHERE id = ?`, [
                Number(marks),
                markId
            ]
        );


        res.json({

            success: true,

            message: "Marks updated successfully"

        });


    } catch (error) {

        console.error(
            "Update Marks Error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};


module.exports = {

    addMarks,

    getMarks,

    updateMarks

};