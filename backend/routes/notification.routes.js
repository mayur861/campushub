const express = require("express");

const {
    getMyNotifications,
    markAsRead
} = require("../controllers/notification.controller");

const authenticateToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    authorizeRoles("student"),
    getMyNotifications
);

router.put(
    "/:id/read",
    authenticateToken,
    authorizeRoles("student"),
    markAsRead
);

module.exports = router;