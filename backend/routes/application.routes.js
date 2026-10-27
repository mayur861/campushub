const express = require("express");

const {
    applyForJob,
    getMyApplications,
    getJobApplications,
    updateApplicationStatus
} = require("../controllers/application.controller");

const authenticateToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const router = express.Router();

router.post(
    "/",
    authenticateToken,
    authorizeRoles("student"),
    applyForJob
);

router.get(
    "/my",
    authenticateToken,
    authorizeRoles("student"),
    getMyApplications
);

router.get(
    "/job/:jobId",
    authenticateToken,
    authorizeRoles("admin", "company"),
    getJobApplications
);

router.put(
    "/:id/status",
    authenticateToken,
    authorizeRoles("admin", "company"),
    updateApplicationStatus
);

module.exports = router;