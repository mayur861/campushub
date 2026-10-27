const express = require("express");

const {
    createJob,
    getJobs,
    getJobById,
    updateJob
} = require("../controllers/job.controller");

const authenticateToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const router = express.Router();


// Admin / Company can create job
router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "company"),
    createJob
);


// Students can view jobs
router.get(
    "/",
    authenticateToken,
    getJobs
);


// View single job
router.get(
    "/:id",
    authenticateToken,
    getJobById
);


// Admin / Company can update job
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "company"),
    updateJob
);


module.exports = router;