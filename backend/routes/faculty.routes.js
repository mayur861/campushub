const express = require("express");

const {
    getFacultyDashboard,
    getFacultyStudents,
    getFacultySubjects
} = require("../controllers/faculty.controller");

const authenticateToken =
    require("../middleware/auth.middleware");

const authorizeRoles =
    require("../middleware/role.middleware");

const router = express.Router();


// =========================================
// FACULTY DASHBOARD
// =========================================

router.get(
    "/dashboard",
    authenticateToken,
    authorizeRoles("faculty"),
    getFacultyDashboard
);


// =========================================
// FACULTY STUDENTS
// =========================================

router.get(
    "/students",
    authenticateToken,
    authorizeRoles("faculty"),
    getFacultyStudents
);


// =========================================
// FACULTY SUBJECTS
// =========================================

router.get(
    "/subjects",
    authenticateToken,
    authorizeRoles("faculty"),
    getFacultySubjects
);


module.exports = router;