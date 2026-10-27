const express = require("express");

const {
    getAdminDashboard
} = require("../controllers/admin.controller");

const authenticateToken =
    require("../middleware/auth.middleware");

const authorizeRoles =
    require("../middleware/role.middleware");

const router = express.Router();


router.get(
    "/dashboard",
    authenticateToken,
    authorizeRoles("admin"),
    getAdminDashboard
);


module.exports = router;