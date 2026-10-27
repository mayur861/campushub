const express = require("express");

const {
    markAttendance,
    getAttendance,
    updateAttendance,
    getAttendanceSummary
} = require("../controllers/attendance.controller");

const authenticateToken =
    require("../middleware/auth.middleware");

const authorizeRoles =
    require("../middleware/role.middleware");

const router = express.Router();


// =========================================
// MARK ATTENDANCE
// Faculty + Admin
// =========================================

router.post(
    "/",
    authenticateToken,
    authorizeRoles("faculty", "admin"),
    markAttendance
);


// =========================================
// STUDENT ATTENDANCE
// =========================================

router.get(
    "/",
    authenticateToken,
    authorizeRoles("student"),
    getAttendance
);


// =========================================
// UPDATE ATTENDANCE
// Faculty + Admin
// =========================================

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("faculty", "admin"),
    updateAttendance
);


// =========================================
// STUDENT ATTENDANCE SUMMARY
// =========================================

router.get(
    "/summary",
    authenticateToken,
    authorizeRoles("student"),
    getAttendanceSummary
);


module.exports = router;