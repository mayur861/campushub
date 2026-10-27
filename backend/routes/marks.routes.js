const express = require("express");

const {
    addMarks,
    getMarks,
    updateMarks
} = require("../controllers/marks.controller");

const authenticateToken =
    require("../middleware/auth.middleware");

const authorizeRoles =
    require("../middleware/role.middleware");

const router = express.Router();


// ==========================================
// ADD MARKS
// Faculty + Admin
// ==========================================

router.post(
    "/",
    authenticateToken,
    authorizeRoles("faculty", "admin"),
    addMarks
);


// ==========================================
// GET MARKS
// Student
// ==========================================

router.get(
    "/",
    authenticateToken,
    authorizeRoles("student"),
    getMarks
);


// ==========================================
// UPDATE MARKS
// Faculty + Admin
// ==========================================

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("faculty", "admin"),
    updateMarks
);


module.exports = router;