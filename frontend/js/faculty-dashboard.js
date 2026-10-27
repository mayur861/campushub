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

const facultyName =
    document.getElementById("facultyName");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const employeeId =
    document.getElementById("employeeId");

const departmentName =
    document.getElementById("departmentName");

const totalStudents =
    document.getElementById("totalStudents");

const attendanceRecords =
    document.getElementById("attendanceRecords");

const marksRecords =
    document.getElementById("marksRecords");

const totalSubjects =
    document.getElementById("totalSubjects");

const subjectsContainer =
    document.getElementById("subjectsContainer");


// =========================================
// LOAD DASHBOARD
// =========================================

async function loadFacultyDashboard() {

    try {

        const response = await fetch(
            `${API_URL}/faculty/dashboard`, {
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
                "Failed to load faculty dashboard"
            );

        }


        // =====================================
        // FACULTY PROFILE
        // =====================================

        facultyName.textContent =
            data.faculty.name;

        profileName.textContent =
            data.faculty.name;

        profileEmail.textContent =
            data.faculty.email;

        employeeId.textContent =
            data.faculty.employee_id ||
            "Not assigned";

        departmentName.textContent =
            data.faculty.department_name ||
            "Not assigned";


        // =====================================
        // STATISTICS
        // =====================================

        totalStudents.textContent =
            data.statistics.total_students;

        attendanceRecords.textContent =
            data.statistics.total_attendance_records;

        marksRecords.textContent =
            data.statistics.total_marks_records;

        totalSubjects.textContent =
            data.subjects.count;


        // =====================================
        // SUBJECTS
        // =====================================

        subjectsContainer.innerHTML = "";


        if (data.subjects.data.length === 0) {

            subjectsContainer.innerHTML = `
                <p>
                    No subjects assigned.
                </p>
            `;

            return;

        }


        data.subjects.data.forEach(subject => {

            const card =
                document.createElement("div");

            card.className =
                "subject-card";


            card.innerHTML = `

                <h3>
                    ${subject.name}
                </h3>

                <p class="subject-code">
                    ${subject.code}
                </p>

                <p>
                    Semester:
                    <strong>
                        ${subject.semester}
                    </strong>
                </p>

            `;


            subjectsContainer.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Faculty Dashboard Error:",
            error
        );


        subjectsContainer.innerHTML =
            `<p>${error.message}</p>`;

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

loadFacultyDashboard();