const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");


// =========================================
// CHECK LOGIN
// =========================================

if (!token) {

    window.location.href = "login.html";

}


// =========================================
// ELEMENTS
// =========================================

const totalApplications =
    document.getElementById(
        "totalApplications"
    );

const shortlisted =
    document.getElementById(
        "shortlisted"
    );

const selected =
    document.getElementById(
        "selected"
    );

const rejected =
    document.getElementById(
        "rejected"
    );

const applicationsContainer =
    document.getElementById(
        "applicationsContainer"
    );


// =========================================
// LOAD APPLICATIONS
// =========================================

async function loadApplications() {

    try {

        const response = await fetch(
            `${API_URL}/applications/my`, {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load applications"
            );

        }


        const applications =
            data.data;


        // =====================================
        // STATISTICS
        // =====================================

        totalApplications.textContent =
            applications.length;


        shortlisted.textContent =
            applications.filter(
                application =>
                application.status ===
                "shortlisted"
            ).length;


        selected.textContent =
            applications.filter(
                application =>
                application.status ===
                "selected"
            ).length;


        rejected.textContent =
            applications.filter(
                application =>
                application.status ===
                "rejected"
            ).length;


        // =====================================
        // APPLICATION CARDS
        // =====================================

        applicationsContainer.innerHTML =
            "";


        if (applications.length === 0) {

            applicationsContainer.innerHTML = `
                <div class="empty-state">

                    <h3>
                        No Applications Yet
                    </h3>

                    <p>
                        Apply for jobs to see them here.
                    </p>

                    <a
                        href="jobs.html"
                        class="btn application-job-btn"
                    >
                        Browse Jobs
                    </a>

                </div>
            `;

            return;

        }


        applications.forEach(application => {

            const card =
                document.createElement("div");

            card.className =
                "application-card";


            const statusClass =
                application.status;


            const jobType =
                application.job_type ===
                "full_time" ?
                "Full Time" :
                "Internship";


            const salary =
                application.salary !== null ?
                `₹${Number(
                        application.salary
                    ).toLocaleString("en-IN")}` :
                "Not specified";


            card.innerHTML = `

                <div class="application-header">

                    <div>

                        <h3>
                            ${application.title}
                        </h3>

                        <p class="company-name">
                            🏢
                            ${application.company_name}
                        </p>

                    </div>

                    <span
                        class="application-status ${statusClass}"
                    >
                        ${application.status}
                    </span>

                </div>


                <div class="application-details">

                    <p>
                        📍
                        <strong>
                            Location:
                        </strong>
                        ${application.location || "Not specified"}
                    </p>

                    <p>
                        💼
                        <strong>
                            Type:
                        </strong>
                        ${jobType}
                    </p>

                    <p>
                        💰
                        <strong>
                            Salary:
                        </strong>
                        ${salary}
                    </p>

                    <p>
                        📅
                        <strong>
                            Deadline:
                        </strong>
                        ${application.deadline || "Not specified"}
                    </p>

                    <p>
                        🕒
                        <strong>
                            Applied:
                        </strong>
                        ${formatDate(
                            application.applied_at
                        )}
                    </p>

                </div>

            `;


            applicationsContainer.appendChild(
                card
            );

        });


    } catch (error) {

        console.error(
            "Applications Error:",
            error
        );


        applicationsContainer.innerHTML =
            `<p>${error.message}</p>`;

    }

}


// =========================================
// FORMAT DATE
// =========================================

function formatDate(dateString) {

    if (!dateString) {
        return "N/A";
    }


    const date =
        new Date(dateString);


    return date.toLocaleDateString(
        "en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

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

loadApplications();