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

const subjectsContainer =
    document.getElementById("subjectsContainer");

const enrolledContainer =
    document.getElementById("enrolledContainer");

const message =
    document.getElementById("message");


// =========================================
// LOAD AVAILABLE SUBJECTS
// =========================================

async function loadSubjects() {
    try {

        const response = await fetch(
            `${API_URL}/subjects`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load subjects"
            );
        }

        subjectsContainer.innerHTML = "";

        if (data.data.length === 0) {

            subjectsContainer.innerHTML =
                "<p>No subjects available.</p>";

            return;
        }

        data.data.forEach(subject => {

            const card =
                document.createElement("div");

            card.className = "subject-card";

            card.innerHTML = `
                <h3>
                    ${subject.name}
                </h3>

                <p>
                    <strong>Code:</strong>
                    ${subject.code}
                </p>

                <p>
                    <strong>Department:</strong>
                    ${subject.department_name || "N/A"}
                </p>

                <p>
                    <strong>Semester:</strong>
                    ${subject.semester}
                </p>

                <button
                    class="btn enroll-btn"
                    onclick="enrollSubject(${subject.id})"
                >
                    Enroll
                </button>
            `;

            subjectsContainer.appendChild(card);
        });

    } catch (error) {

        console.error(
            "Load Subjects Error:",
            error
        );

        subjectsContainer.innerHTML =
            `<p>${error.message}</p>`;
    }
}


// =========================================
// LOAD MY ENROLLMENTS
// =========================================

async function loadEnrollments() {
    try {

        const response = await fetch(
            `${API_URL}/enrollments`, {
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
                "Failed to load enrollments"
            );
        }

        enrolledContainer.innerHTML = "";

        if (data.data.length === 0) {

            enrolledContainer.innerHTML =
                "<p>You are not enrolled in any subject.</p>";

            return;
        }

        data.data.forEach(subject => {

            const card =
                document.createElement("div");

            card.className = "subject-card";

            card.innerHTML = `
                <h3>
                    ${subject.subject_name}
                </h3>

                <p>
                    <strong>Code:</strong>
                    ${subject.code}
                </p>

                <p>
                    <strong>Semester:</strong>
                    ${subject.semester}
                </p>

                <button
                    class="drop-btn"
                    onclick="dropSubject(${subject.subject_id})"
                >
                    Drop Subject
                </button>
            `;

            enrolledContainer.appendChild(card);
        });

    } catch (error) {

        console.error(
            "Load Enrollments Error:",
            error
        );

        enrolledContainer.innerHTML =
            `<p>${error.message}</p>`;
    }
}


// =========================================
// ENROLL SUBJECT
// =========================================

async function enrollSubject(subjectId) {

    message.textContent =
        "Enrolling in subject...";

    try {

        const response = await fetch(
            `${API_URL}/enrollments`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    subject_id: subjectId
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            message.textContent =
                data.message ||
                "Enrollment failed";

            return;
        }

        message.textContent =
            "Subject enrolled successfully!";

        await loadSubjects();

        await loadEnrollments();

    } catch (error) {

        console.error(
            "Enrollment Error:",
            error
        );

        message.textContent =
            "Unable to connect to server";
    }
}


// =========================================
// DROP SUBJECT
// =========================================

async function dropSubject(subjectId) {

    const confirmDrop = confirm(
        "Are you sure you want to drop this subject?"
    );

    if (!confirmDrop) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/enrollments/${subjectId}`, {
                method: "DELETE",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            message.textContent =
                data.message ||
                "Failed to drop subject";

            return;
        }

        message.textContent =
            "Subject dropped successfully!";

        await loadSubjects();

        await loadEnrollments();

    } catch (error) {

        console.error(
            "Drop Subject Error:",
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

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            window.location.href =
                "login.html";
        }
    );


// =========================================
// START
// =========================================

loadSubjects();

loadEnrollments();