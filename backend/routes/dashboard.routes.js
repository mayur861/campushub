const express = require("express");

const {
    getStudentDashboard
} = require("../controllers/dashboard.controller");

const authenticateToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const router = express.Router();

router.get(
    "/student",
    authenticateToken,
    authorizeRoles("student"),
    getStudentDashboard
);

module.exports = router;