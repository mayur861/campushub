const express = require("express");

const {
    enrollSubject,
    getEnrollments,
    dropSubject
} = require("../controllers/enrollment.controller");

const authenticateToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const router = express.Router();

router.post(
    "/",
    authenticateToken,
    authorizeRoles("student"),
    enrollSubject
);

router.get(
    "/",
    authenticateToken,
    authorizeRoles("student"),
    getEnrollments
);

router.delete(
    "/:subjectId",
    authenticateToken,
    authorizeRoles("student"),
    dropSubject
);

module.exports = router;