const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");


// =========================================
// CHECK LOGIN
// =========================================

if (!token) {

    window.location.href = "login.html";

}


// =========================================
// LOAD DASHBOARD
// =========================================

async function loadDashboard() {

    try {

        const response = await fetch(
            `${API_URL}/dashboard/student`, {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load dashboard"
            );

        }


        console.log(
            "Dashboard Data:",
            data
        );


        // =====================================
        // PROFILE
        // =====================================

        document.getElementById(
                "studentName"
            ).textContent =
            data.profile.name;


        document.getElementById(
                "profileName"
            ).textContent =
            data.profile.name;


        document.getElementById(
                "profileEmail"
            ).textContent =
            data.profile.email;


        document.getElementById(
                "enrollmentNo"
            ).textContent =
            data.profile.enrollment_no;


        document.getElementById(
                "department"
            ).textContent =
            data.profile.department_name;


        document.getElementById(
                "semester"
            ).textContent =
            data.profile.semester;


        document.getElementById(
                "phone"
            ).textContent =
            data.profile.phone;


        // =====================================
        // STATS
        // =====================================

        document.getElementById(
                "cgpa"
            ).textContent =
            data.profile.cgpa;


        document.getElementById(
                "attendance"
            ).textContent =
            data.attendance.attendance_percentage ?
            `${data.attendance.attendance_percentage}%` :
            "0%";


        document.getElementById(
                "averageMarks"
            ).textContent =
            data.marks.average_marks || "0";


        document.getElementById(
                "applications"
            ).textContent =
            data.applications.count;


        // =====================================
        // SKILLS
        // =====================================

        const skillsContainer =
            document.getElementById("skills");

        skillsContainer.innerHTML = "";


        if (data.skills.data.length === 0) {

            skillsContainer.innerHTML =
                "<p>No skills added yet.</p>";

        } else {

            data.skills.data.forEach(
                skill => {

                    const span =
                        document.createElement("span");

                    span.className = "skill";

                    span.textContent =
                        skill.name;

                    skillsContainer.appendChild(
                        span
                    );

                }
            );

        }


        // =====================================
        // APPLICATIONS
        // =====================================

        const applicationList =
            document.getElementById(
                "applicationList"
            );

        applicationList.innerHTML = "";


        if (data.applications.data.length === 0) {

            applicationList.innerHTML =
                "<p>No applications yet.</p>";

        } else {

            data.applications.data.forEach(
                application => {

                    const div =
                        document.createElement("div");

                    div.className =
                        "application-item";

                    div.innerHTML = `
                        <h3>
                            ${application.title}
                        </h3>

                        <p>
                            ${application.company_name}
                        </p>

                        <span class="status">
                            ${application.status}
                        </span>
                    `;

                    applicationList.appendChild(
                        div
                    );

                }
            );

        }


        // =====================================
        // NOTIFICATIONS
        // =====================================

        const notificationList =
            document.getElementById(
                "notificationList"
            );

        notificationList.innerHTML = "";


        if (
            data.notifications.data.length === 0
        ) {

            notificationList.innerHTML =
                "<p>No notifications.</p>";

        } else {

            data.notifications.data.forEach(
                notification => {

                    const div =
                        document.createElement("div");

                    div.className =
                        "notification-item";

                    div.textContent =
                        notification.message;

                    notificationList.appendChild(
                        div
                    );

                }
            );

        }


        // =====================================
        // SHOW DASHBOARD
        // =====================================

        document.getElementById(
            "loading"
        ).style.display = "none";


        document.getElementById(
            "dashboardContent"
        ).style.display = "block";


    } catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );


        document.getElementById(
                "loading"
            ).textContent =
            "Unable to load dashboard.";

    }

}


// =========================================
// LOGOUT
// =========================================

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "login.html";

        }
    );


// =========================================
// START
// =========================================

loadDashboard();