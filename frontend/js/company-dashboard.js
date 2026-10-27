const API_URL =
    "http://localhost:5000/api";


// ==========================================
// AUTH
// ==========================================

const token =
    localStorage.getItem("token");

const user = JSON.parse(
    localStorage.getItem("user") || "{}"
);


if (!token) {

    window.location.href =
        "login.html";

}


if (
    user.role &&
    user.role !== "company"
) {

    window.location.href =
        "dashboard.html";

}


// ==========================================
// ELEMENTS
// ==========================================

const companyName =
    document.getElementById(
        "companyName"
    );

const companyIndustry =
    document.getElementById(
        "companyIndustry"
    );

const companyWebsite =
    document.getElementById(
        "companyWebsite"
    );

const totalJobs =
    document.getElementById(
        "totalJobs"
    );

const totalApplications =
    document.getElementById(
        "totalApplications"
    );

const shortlistedStudents =
    document.getElementById(
        "shortlistedStudents"
    );

const selectedStudents =
    document.getElementById(
        "selectedStudents"
    );

const jobsTableBody =
    document.getElementById(
        "jobsTableBody"
    );

const applicationsTableBody =
    document.getElementById(
        "applicationsTableBody"
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
// DASHBOARD
// ==========================================

async function loadDashboard() {

    try {

        showMessage(
            "Loading dashboard...",
            "info"
        );


        const response =
            await fetch(
                `${API_URL}/company/dashboard`, {
                    method: "GET",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                logout();

                return;
            }

            throw new Error(
                data.message ||
                "Unable to load dashboard"
            );

        }


        // Company info

        companyName.textContent =
            data.company.company_name;

        companyIndustry.textContent =
            data.company.industry ||
            "Industry not specified";

        companyWebsite.textContent =
            data.company.website ||
            "Website not available";


        // Statistics

        totalJobs.textContent =
            data.statistics.total_jobs;

        totalApplications.textContent =
            data.statistics.total_applications;

        shortlistedStudents.textContent =
            data.statistics
            .shortlisted_students;

        selectedStudents.textContent =
            data.statistics
            .selected_students;


        // Jobs

        renderJobs(
            data.recent_jobs || []
        );


        // Applications

        await loadApplications();


        showMessage(
            "Dashboard loaded successfully.",
            "success"
        );


        setTimeout(
            () => {

                message.textContent = "";

                message.className =
                    "message";

            },
            3000
        );


    } catch (error) {

        console.error(
            "Company Dashboard Error:",
            error
        );

        showMessage(
            error.message,
            "error"
        );

    }

}


// ==========================================
// JOBS
// ==========================================

function renderJobs(jobs) {

    jobsTableBody.innerHTML = "";


    if (!jobs ||
        jobs.length === 0
    ) {

        jobsTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align:center;"
                >
                    No jobs found
                </td>
            </tr>
        `;

        return;
    }


    jobs.forEach(
        (job) => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHtml(job.title)}
                    </strong>
                </td>

                <td>
                    <span class="company-job-badge">
                        ${escapeHtml(job.job_type)}
                    </span>
                </td>

                <td>
                    ${escapeHtml(job.location || "-")}
                </td>

                <td>
                    ${job.min_cgpa ?? "-"}
                </td>

                <td>
                    ₹${Number(
                        job.salary || 0
                    ).toLocaleString("en-IN")}
                </td>

                <td>
                    ${formatDate(job.deadline)}
                </td>

            `;


            jobsTableBody.appendChild(row);

        }
    );

}


// ==========================================
// APPLICATIONS
// ==========================================

async function loadApplications() {

    try {

        const response =
            await fetch(
                `${API_URL}/company/applications`, {
                    method: "GET",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load applications"
            );

        }


        renderApplications(
            data.data || []
        );


    } catch (error) {

        console.error(
            "Applications Error:",
            error
        );

        applicationsTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align:center;"
                >
                    Unable to load applications
                </td>
            </tr>
        `;

    }

}


// ==========================================
// RENDER APPLICATIONS
// ==========================================

function renderApplications(
    applications
) {

    applicationsTableBody.innerHTML = "";


    if (!applications ||
        applications.length === 0
    ) {

        applicationsTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align:center;"
                >
                    No applications found
                </td>
            </tr>
        `;

        return;
    }


    applications.forEach(
        (application) => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    <div class="student-info">

                        <div
                            class="student-avatar"
                        >
                            ${getInitials(
                                application.student_name
                            )}
                        </div>

                        <div>

                            <strong>
                                ${escapeHtml(
                                    application.student_name
                                )}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    application.student_email
                                )}
                            </small>

                        </div>

                    </div>

                </td>


                <td>
                    ${escapeHtml(
                        application.enrollment_no
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        application.job_title
                    )}
                </td>


                <td>
                    ${application.cgpa ?? "-"}
                </td>


                <td>

                    <span
                        class="
                            company-status-badge
                            status-${escapeHtml(
                                application.status
                            )}
                        "
                    >
                        ${escapeHtml(
                            application.status
                        )}
                    </span>

                </td>


                <td>

                    <select
                        class="company-status-select"
                        data-id="${application.id}"
                    >

                        <option
                            value="applied"
                            ${
                                application.status ===
                                "applied"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Applied
                        </option>


                        <option
                            value="shortlisted"
                            ${
                                application.status ===
                                "shortlisted"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Shortlisted
                        </option>


                        <option
                            value="rejected"
                            ${
                                application.status ===
                                "rejected"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Rejected
                        </option>


                        <option
                            value="selected"
                            ${
                                application.status ===
                                "selected"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Selected
                        </option>

                    </select>

                    <button
                        class="btn company-update-btn"
                        data-id="${application.id}"
                    >
                        Update
                    </button>

                </td>

            `;


            applicationsTableBody.appendChild(
                row
            );

        }
    );


    // Update buttons

    document
        .querySelectorAll(
            ".company-update-btn"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        updateApplicationStatus(
                            button.dataset.id
                        );

                    }
                );

            }
        );

}


// ==========================================
// UPDATE STATUS
// ==========================================

async function updateApplicationStatus(
    applicationId
) {

    const select =
        document.querySelector(
            `.company-status-select[data-id="${applicationId}"]`
        );


    if (!select) {
        return;
    }


    const status =
        select.value;


    try {

        showMessage(
            "Updating application...",
            "info"
        );


        const response =
            await fetch(
                `${API_URL}/company/applications/${applicationId}`, {
                    method: "PUT",

                    headers: {

                        "Content-Type": "application/json",

                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        status: status
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to update status"
            );

        }


        showMessage(
            "Application status updated successfully.",
            "success"
        );


        await loadDashboard();


    } catch (error) {

        console.error(
            "Update Status Error:",
            error
        );

        showMessage(
            error.message,
            "error"
        );

    }

}


// ==========================================
// HELPERS
// ==========================================

function showMessage(
    text,
    type
) {

    message.textContent = text;

    message.className =
        "message";


    if (type === "success") {

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


function getInitials(name) {

    if (!name) {
        return "C";
    }


    const parts =
        name.trim().split(" ");


    if (parts.length === 1) {

        return parts[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();

}


function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function formatDate(date) {

    if (!date) {
        return "-";
    }


    const d =
        new Date(date);


    if (
        Number.isNaN(
            d.getTime()
        )
    ) {

        return date;

    }


    return d.toLocaleDateString(
        "en-IN"
    );

}


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
// START
// ==========================================

loadDashboard();