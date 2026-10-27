const express = require("express");
const cors = require("cors");

require("dotenv").config();


// =========================================
// DATABASE
// =========================================

const pool = require("./config/db");


// =========================================
// ROUTES
// =========================================

const authRoutes =
    require("./routes/auth.routes");

const studentRoutes =
    require("./routes/student.routes");

const subjectRoutes =
    require("./routes/subject.routes");

const enrollmentRoutes =
    require("./routes/enrollment.routes");

const attendanceRoutes =
    require("./routes/attendance.routes");

const marksRoutes =
    require("./routes/marks.routes");

const jobRoutes =
    require("./routes/job.routes");

const applicationRoutes =
    require("./routes/application.routes");

const notificationRoutes =
    require("./routes/notification.routes");

const dashboardRoutes =
    require("./routes/dashboard.routes");

const facultyRoutes =
    require("./routes/faculty.routes");

const adminRoutes =
    require("./routes/admin.routes");
const companyRoutes =
    require("./routes/company.routes");

// =========================================
// APP
// =========================================

const app = express();


// =========================================
// MIDDLEWARE
// =========================================

app.use(cors());

app.use(express.json());


// =========================================
// STATIC UPLOADS
// =========================================

app.use(
    "/uploads",
    express.static("uploads")
);


// =========================================
// API ROUTES
// =========================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/students",
    studentRoutes
);

app.use(
    "/api/subjects",
    subjectRoutes
);

app.use(
    "/api/enrollments",
    enrollmentRoutes
);

app.use(
    "/api/attendance",
    attendanceRoutes
);

app.use(
    "/api/marks",
    marksRoutes
);

app.use(
    "/api/jobs",
    jobRoutes
);
app.use(
    "/api/company",
    companyRoutes
);
app.use(
    "/api/applications",
    applicationRoutes
);

app.use(
    "/api/notifications",
    notificationRoutes
);

app.use(
    "/api/dashboard",
    dashboardRoutes
);

app.use(
    "/api/faculty",
    facultyRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);


// =========================================
// HOME
// =========================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "CampusHub API is running 🚀"
    });

});


// =========================================
// DATABASE TEST
// =========================================

app.get(
    "/api/test-db",
    async(req, res) => {

        try {

            const [rows] =
            await pool.query(
                "SELECT 1 AS result"
            );


            res.json({
                success: true,
                message: "MySQL connected successfully 🚀",
                data: rows
            });


        } catch (error) {

            console.error(
                "Database Error:",
                error.message
            );


            res.status(500).json({
                success: false,
                message: "Database connection failed",
                error: error.message
            });

        }

    }
);


// =========================================
// SERVER
// =========================================

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    }
);