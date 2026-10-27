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

const jobsContainer =
    document.getElementById(
        "jobsContainer"
    );

const message =
    document.getElementById(
        "message"
    );


// =========================================
// LOAD JOBS
// =========================================

async function loadJobs() {

    try {

        const response = await fetch(
            `${API_URL}/jobs`, {
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
                "Failed to load jobs"
            );

        }


        jobsContainer.innerHTML = "";


        if (data.data.length === 0) {

            jobsContainer.innerHTML =
                "<p>No jobs available right now.</p>";

            return;

        }


        data.data.forEach(job => {

            const card =
                document.createElement("div");

            card.className =
                "job-card";


            const jobType =
                job.job_type === "full_time" ?
                "Full Time" :
                "Internship";


            const salary =
                job.salary !== null ?
                `₹${Number(job.salary).toLocaleString("en-IN")}` :
                "Not specified";


            const minCgpa =
                job.min_cgpa !== null ?
                job.min_cgpa :
                "Not specified";


            card.innerHTML = `

                <div class="job-header">

                    <h3>
                        ${job.title}
                    </h3>

                    <span class="job-type">
                        ${jobType}
                    </span>

                </div>


                <p class="company-name">
                    🏢 ${job.company_name}
                </p>


                <p>
                    📍 ${job.location || "Not specified"}
                </p>


                <p>
                    🎓 Minimum CGPA:
                    <strong>
                        ${minCgpa}
                    </strong>
                </p>


                <p>
                    💰 Salary:
                    <strong>
                        ${salary}
                    </strong>
                </p>


                <p>
                    📅 Deadline:
                    <strong>
                        ${job.deadline || "Not specified"}
                    </strong>
                </p>


                <p class="job-description">
                    ${job.description}
                </p>


                <button
                    class="btn apply-btn"
                    onclick="applyForJob(${job.id})"
                >
                    🚀 Apply Now
                </button>

            `;


            jobsContainer.appendChild(
                card
            );

        });


    } catch (error) {

        console.error(
            "Load Jobs Error:",
            error
        );


        jobsContainer.innerHTML =
            `<p>${error.message}</p>`;

    }

}


// =========================================
// APPLY FOR JOB
// =========================================

async function applyForJob(jobId) {

    message.textContent =
        "Submitting application...";


    try {

        const response = await fetch(
            `${API_URL}/applications`, {
                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    "Authorization": `Bearer ${token}`

                },

                body: JSON.stringify({

                    job_id: jobId

                })

            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            message.textContent =
                data.message ||
                "Application failed";

            return;

        }


        message.textContent =
            "Application submitted successfully!";


    } catch (error) {

        console.error(
            "Apply Job Error:",
            error
        );


        message.textContent =
            "Unable to connect to server";

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

loadJobs();