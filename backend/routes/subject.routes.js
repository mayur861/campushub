const express = require("express");

const {
    createSubject,
    getSubjects,
    getSubjectById
} = require("../controllers/subject.controller");

const authenticateToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const router = express.Router();

// Create Subject - Admin/Faculty only
router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "faculty"),
    createSubject
);

// Get All Subjects - Logged-in users
router.get(
    "/",
    authenticateToken,
    getSubjects
);

// Get Single Subject - Logged-in users
router.get(
    "/:id",
    authenticateToken,
    getSubjectById
);

module.exports = router;