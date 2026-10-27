const pool = require("../config/db");

// ==========================================
// STUDENT DASHBOARD
// ==========================================
const getStudentDashboard = async(req, res) => {
    try {
        const userId = req.user.id;

        // ------------------------------------------
        // 1. STUDENT PROFILE
        // ------------------------------------------
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
             WHERE s.user_id = ?`, [userId]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        const student = students[0];
        const studentId = student.id;

        // ------------------------------------------
        // 2. SKILLS
        // ------------------------------------------
        const [skills] = await pool.query(
            `SELECT
                sk.id,
                sk.name
             FROM student_skills ss
             JOIN skills sk
             ON ss.skill_id = sk.id
             WHERE ss.student_id = ?
             ORDER BY sk.name`, [studentId]
        );

        // ------------------------------------------
        // 3. ATTENDANCE SUMMARY
        // ------------------------------------------
        const [attendance] = await pool.query(
            `SELECT
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
                        ) / NULLIF(COUNT(a.id), 0)
                    ) * 100,
                    2
                ) AS attendance_percentage
             FROM attendance a
             WHERE a.student_id = ?`, [studentId]
        );

        // ------------------------------------------
        // 4. MARKS SUMMARY
        // ------------------------------------------
        const [marks] = await pool.query(
            `SELECT
                COUNT(m.id) AS total_marks_records,
                ROUND(AVG(m.marks), 2) AS average_marks,
                MAX(m.marks) AS highest_marks
             FROM marks m
             WHERE m.student_id = ?`, [studentId]
        );

        // ------------------------------------------
        // 5. ENROLLED SUBJECTS
        // ------------------------------------------
        const [subjects] = await pool.query(
            `SELECT
                s.id,
                s.name,
                s.code,
                s.semester
             FROM enrollments e
             JOIN subjects s
             ON e.subject_id = s.id
             WHERE e.student_id = ?
             ORDER BY s.semester, s.name`, [studentId]
        );

        // ------------------------------------------
        // 6. JOB APPLICATIONS
        // ------------------------------------------
        const [applications] = await pool.query(
            `SELECT
                a.id,
                a.job_id,
                j.title,
                c.company_name,
                a.status,
                a.applied_at
             FROM applications a
             JOIN jobs j
             ON a.job_id = j.id
             JOIN companies c
             ON j.company_id = c.id
             WHERE a.student_id = ?
             ORDER BY a.applied_at DESC`, [studentId]
        );

        // ------------------------------------------
        // 7. NOTIFICATIONS
        // ------------------------------------------
        const [notifications] = await pool.query(
            `SELECT
                id,
                message,
                is_read,
                created_at
             FROM notifications
             WHERE student_id = ?
             ORDER BY created_at DESC
             LIMIT 10`, [studentId]
        );

        // ------------------------------------------
        // 8. DASHBOARD RESPONSE
        // ------------------------------------------
        res.json({
            success: true,

            profile: student,

            skills: {
                count: skills.length,
                data: skills
            },

            attendance: attendance[0],

            marks: marks[0],

            subjects: {
                count: subjects.length,
                data: subjects
            },

            applications: {
                count: applications.length,
                data: applications
            },

            notifications: {
                count: notifications.length,
                data: notifications
            }
        });

    } catch (error) {
        console.error("Student Dashboard Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    getStudentDashboard
};