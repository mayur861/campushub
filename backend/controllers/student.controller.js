const pool = require("../config/db");

const createProfile = async(req, res) => {
    try {
        const userId = req.user.id;

        const {
            enrollment_no,
            department_id,
            semester,
            cgpa,
            phone
        } = req.body;

        if (!enrollment_no || !department_id || !semester) {
            return res.status(400).json({
                success: false,
                message: "Enrollment number, department and semester are required"
            });
        }

        const [existingProfile] = await pool.query(
            "SELECT id FROM students WHERE user_id = ?", [userId]
        );

        if (existingProfile.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Student profile already exists"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO students
            (user_id, enrollment_no, department_id, semester, cgpa, phone)
            VALUES (?, ?, ?, ?, ?, ?)`, [
                userId,
                enrollment_no,
                department_id,
                semester,
                cgpa || null,
                phone || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Student profile created successfully",
            studentId: result.insertId
        });

    } catch (error) {
        console.error("Create Profile Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const getProfile = async(req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await pool.query(
            `SELECT
                s.id,
                u.name,
                u.email,
                s.enrollment_no,
                s.department_id,
                s.semester,
                s.cgpa,
                s.phone,
                s.resume
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.user_id = ?`, [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error("Get Profile Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const updateProfile = async(req, res) => {
    try {
        const userId = req.user.id;

        const {
            department_id,
            semester,
            cgpa,
            phone
        } = req.body;

        const [existingProfile] = await pool.query(
            "SELECT id FROM students WHERE user_id = ?", [userId]
        );

        if (existingProfile.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        await pool.query(
            `UPDATE students
             SET department_id = ?,
                 semester = ?,
                 cgpa = ?,
                 phone = ?
             WHERE user_id = ?`, [
                department_id,
                semester,
                cgpa,
                phone,
                userId
            ]
        );

        res.json({
            success: true,
            message: "Student profile updated successfully"
        });

    } catch (error) {
        console.error("Update Profile Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const addSkill = async(req, res) => {
    try {
        const userId = req.user.id;
        const { skill_id } = req.body;

        if (!skill_id) {
            return res.status(400).json({
                success: false,
                message: "Skill ID is required"
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

        const [skills] = await pool.query(
            "SELECT id, name FROM skills WHERE id = ?", [skill_id]
        );

        if (skills.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Skill not found"
            });
        }

        const [existing] = await pool.query(
            `SELECT student_id, skill_id
             FROM student_skills
             WHERE student_id = ? AND skill_id = ?`, [studentId, skill_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Skill already added"
            });
        }

        await pool.query(
            `INSERT INTO student_skills
             (student_id, skill_id)
             VALUES (?, ?)`, [studentId, skill_id]
        );

        res.status(201).json({
            success: true,
            message: "Skill added successfully",
            skill: skills[0].name
        });

    } catch (error) {
        console.error("Add Skill Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getSkills = async(req, res) => {
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

        const [skills] = await pool.query(
            `SELECT
                s.id,
                s.name
             FROM student_skills ss
             JOIN skills s ON ss.skill_id = s.id
             WHERE ss.student_id = ?
             ORDER BY s.name`, [studentId]
        );

        res.json({
            success: true,
            count: skills.length,
            data: skills
        });

    } catch (error) {
        console.error("Get Skills Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const deleteSkill = async(req, res) => {
    try {
        const userId = req.user.id;
        const skillId = req.params.skillId;

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
            `DELETE FROM student_skills
             WHERE student_id = ? AND skill_id = ?`, [studentId, skillId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Skill not found in student profile"
            });
        }

        res.json({
            success: true,
            message: "Skill deleted successfully"
        });

    } catch (error) {
        console.error("Delete Skill Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
const uploadResume = async(req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Resume file is required"
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

        const resumePath = `/uploads/resumes/${req.file.filename}`;

        await pool.query(
            `UPDATE students
             SET resume = ?
             WHERE user_id = ?`, [resumePath, userId]
        );

        res.json({
            success: true,
            message: "Resume uploaded successfully",
            resume: resumePath
        });

    } catch (error) {
        console.error("Upload Resume Error:", error);

        res.status(500).json({
            success: false,
            message: "Resume upload failed"
        });
    }
};

module.exports = {
    createProfile,
    getProfile,
    updateProfile,
    addSkill,
    getSkills,
    deleteSkill,
    uploadResume
};