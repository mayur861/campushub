const pool = require("../config/db");

// Create Subject
const createSubject = async(req, res) => {
    try {
        const {
            name,
            code,
            department_id,
            semester
        } = req.body;

        if (!name || !code || !department_id || !semester) {
            return res.status(400).json({
                success: false,
                message: "Name, code, department and semester are required"
            });
        }

        // Check duplicate subject code
        const [existing] = await pool.query(
            "SELECT id FROM subjects WHERE code = ?", [code]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Subject code already exists"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO subjects
            (name, code, department_id, semester)
            VALUES (?, ?, ?, ?)`, [
                name,
                code,
                department_id,
                semester
            ]
        );

        res.status(201).json({
            success: true,
            message: "Subject created successfully",
            subjectId: result.insertId
        });

    } catch (error) {
        console.error("Create Subject Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get All Subjects
const getSubjects = async(req, res) => {
    try {
        const [subjects] = await pool.query(
            `SELECT
                s.id,
                s.name,
                s.code,
                s.department_id,
                d.name AS department_name,
                s.semester
             FROM subjects s
             LEFT JOIN departments d
             ON s.department_id = d.id
             ORDER BY s.semester, s.name`
        );

        res.json({
            success: true,
            count: subjects.length,
            data: subjects
        });

    } catch (error) {
        console.error("Get Subjects Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get Single Subject
const getSubjectById = async(req, res) => {
    try {
        const subjectId = req.params.id;

        const [subjects] = await pool.query(
            `SELECT
                s.id,
                s.name,
                s.code,
                s.department_id,
                d.name AS department_name,
                s.semester
             FROM subjects s
             LEFT JOIN departments d
             ON s.department_id = d.id
             WHERE s.id = ?`, [subjectId]
        );

        if (subjects.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        res.json({
            success: true,
            data: subjects[0]
        });

    } catch (error) {
        console.error("Get Subject Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    createSubject,
    getSubjects,
    getSubjectById
};