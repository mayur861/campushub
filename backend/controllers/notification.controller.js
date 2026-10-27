const pool = require("../config/db");

// ==========================================
// CREATE NOTIFICATION
// ==========================================
const createNotification = async(studentId, message) => {
    try {
        await pool.query(
            `INSERT INTO notifications
            (student_id, message)
            VALUES (?, ?)`, [studentId, message]
        );
    } catch (error) {
        console.error("Create Notification Error:", error);
        throw error;
    }
};


// ==========================================
// GET MY NOTIFICATIONS
// ==========================================
const getMyNotifications = async(req, res) => {
    try {
        const userId = req.user.id;

        // Find student ID using logged-in user ID
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

        const [notifications] = await pool.query(
            `SELECT
                id,
                message,
                is_read,
                created_at
             FROM notifications
             WHERE student_id = ?
             ORDER BY created_at DESC`, [studentId]
        );

        res.json({
            success: true,
            count: notifications.length,
            data: notifications
        });

    } catch (error) {
        console.error("Get Notifications Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// MARK NOTIFICATION AS READ
// ==========================================
const markAsRead = async(req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;

        // Find student
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
            `UPDATE notifications
             SET is_read = 1
             WHERE id = ?
             AND student_id = ?`, [notificationId, studentId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.json({
            success: true,
            message: "Notification marked as read"
        });

    } catch (error) {
        console.error("Mark Notification Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    createNotification,
    getMyNotifications,
    markAsRead
};