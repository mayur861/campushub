const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");

const user = JSON.parse(
    localStorage.getItem("user") || "{}"
);


// ==========================================
// AUTH CHECK
// ==========================================

if (!token) {

    window.location.href =
        "login.html";

}

if (
    user.role &&
    user.role !== "admin"
) {

    window.location.href =
        "dashboard.html";

}


// ==========================================
// ELEMENTS
// ==========================================

const totalUsers =
    document.getElementById(
        "totalUsers"
    );

const totalStudents =
    document.getElementById(
        "totalStudents"
    );

const totalFaculty =
    document.getElementById(
        "totalFaculty"
    );

const totalCompanies =
    document.getElementById(
        "totalCompanies"
    );

const totalJobs =
    document.getElementById(
        "totalJobs"
    );

const totalApplications =
    document.getElementById(
        "totalApplications"
    );

const usersTableBody =
    document.getElementById(
        "usersTableBody"
    );

const message =
    document.getElementById(
        "message"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


// ==========================================
// LOAD ADMIN DASHBOARD
// ==========================================

async function loadAdminDashboard() {

    try {

        showMessage(
            "Loading dashboard...",
            "info"
        );


        const response =
            await fetch(
                `${API_URL}/admin/dashboard`, {
                    method: "GET",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        // ----------------------------------
        // Error handling
        // ----------------------------------

        if (!response.ok) {

            if (
                response.status === 401
            ) {

                logout();

                return;

            }


            if (
                response.status === 403
            ) {

                showMessage(
                    "Access denied. Admin access required.",
                    "error"
                );

                return;

            }


            throw new Error(
                data.message ||
                "Unable to load dashboard"
            );

        }


        // ==================================
        // STATISTICS
        // ==================================

        totalUsers.textContent =
            data.statistics.total_users;

        totalStudents.textContent =
            data.statistics.total_students;

        totalFaculty.textContent =
            data.statistics.total_faculty;

        totalCompanies.textContent =
            data.statistics.total_companies;

        totalJobs.textContent =
            data.statistics.total_jobs;

        totalApplications.textContent =
            data.statistics.total_applications;


        // ==================================
        // RECENT USERS
        // ==================================

        renderUsers(
            data.recent_users || []
        );


        showMessage(
            "Dashboard loaded successfully.",
            "success"
        );


        // Hide message after 3 seconds

        setTimeout(
            () => {

                message.textContent =
                    "";

                message.className =
                    "message";

            },
            3000
        );


    } catch (error) {

        console.error(
            "Admin Dashboard Error:",
            error
        );


        showMessage(
            error.message,
            "error"
        );

    }

}


// ==========================================
// RENDER USERS
// ==========================================

function renderUsers(users) {

    usersTableBody.innerHTML =
        "";


    if (!users ||
        users.length === 0
    ) {

        usersTableBody.innerHTML = `

            <tr>

                <td colspan="4"
                    style="text-align:center;">

                    No users found

                </td>

            </tr>

        `;

        return;

    }


    users.forEach(
        (user,
            index) => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>

                    <div class="student-info">

                        <div class="student-avatar">

                            ${getInitials(
                                user.name
                            )}

                        </div>

                        <div>

                            <strong>
                                ${escapeHtml(
                                    user.name
                                )}
                            </strong>

                        </div>

                    </div>

                </td>

                <td>

                    ${escapeHtml(
                        user.email
                    )}

                </td>

                <td>

                    <span class="admin-role-badge
                        role-${escapeHtml(
                            user.role
                        )}">

                        ${escapeHtml(
                            user.role
                        )}

                    </span>

                </td>

            `;


            usersTableBody.appendChild(
                row
            );

        }
    );

}


// ==========================================
// MESSAGE
// ==========================================

function showMessage(
    text,
    type
) {

    message.textContent =
        text;

    message.className =
        "message";


    if (
        type === "success"
    ) {

        message.classList.add(
            "message-success"
        );

    } else if (
        type === "error"
    ) {

        message.classList.add(
            "message-error"
        );

    } else {

        message.classList.add(
            "message-info"
        );

    }

}


// ==========================================
// INITIALS
// ==========================================

function getInitials(name) {

    if (!name) {
        return "U";
    }


    const parts =
        name.trim().split(" ");


    if (
        parts.length === 1
    ) {

        return parts[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        parts[0]
        .charAt(0) +

        parts[parts.length - 1]
        .charAt(0)

    ).toUpperCase();

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}


// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "login.html";

}


logoutBtn.addEventListener(
    "click",
    (event) => {

        event.preventDefault();

        logout();

    }
);


// ==========================================
// INITIAL LOAD
// ==========================================

loadAdminDashboard();