const express = require("express");

const {
    createProfile,
    getProfile,
    updateProfile,
    addSkill,
    getSkills,
    deleteSkill,
    uploadResume
} = require("../controllers/student.controller");

const authenticateToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const uploadResumeMiddleware = require("../middleware/upload.middleware");

const router = express.Router();

router.post(
    "/profile",
    authenticateToken,
    authorizeRoles("student"),
    createProfile
);

router.get(
    "/profile",
    authenticateToken,
    authorizeRoles("student"),
    getProfile
);

router.put(
    "/profile",
    authenticateToken,
    authorizeRoles("student"),
    updateProfile
);

router.post(
    "/skills",
    authenticateToken,
    authorizeRoles("student"),
    addSkill
);

router.get(
    "/skills",
    authenticateToken,
    authorizeRoles("student"),
    getSkills
);

router.delete(
    "/skills/:skillId",
    authenticateToken,
    authorizeRoles("student"),
    deleteSkill
);

router.post(
    "/resume",
    authenticateToken,
    authorizeRoles("student"),
    uploadResumeMiddleware.single("resume"),
    uploadResume
);

module.exports = router;