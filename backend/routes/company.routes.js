const express = require("express");

const {
    getCompanyDashboard,
    getCompanyApplications,
    updateCompanyApplicationStatus
} = require("../controllers/company.controller");

const authenticateToken =
    require("../middleware/auth.middleware");

const authorizeRoles =
    require("../middleware/role.middleware");

const router = express.Router();


// Company Dashboard

router.get(
    "/dashboard",
    authenticateToken,
    authorizeRoles("company"),
    getCompanyDashboard
);


// Company Applications

router.get(
    "/applications",
    authenticateToken,
    authorizeRoles("company"),
    getCompanyApplications
);


// Update Application Status

router.put(
    "/applications/:id",
    authenticateToken,
    authorizeRoles("company"),
    updateCompanyApplicationStatus
);


module.exports = router;