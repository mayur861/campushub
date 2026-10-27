const express = require("express");

const {
    register,
    login
} = require("../controllers/auth.controller");

const authenticateToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/profile", authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: "Protected profile accessed successfully",
        user: req.user
    });
});

router.get(
    "/admin-test",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Admin! Admin API accessed successfully."
        });
    }
);

module.exports = router;