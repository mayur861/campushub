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

const totalStudents =
    document.getElementById(
        "totalStudents"
    );

const studentsContainer =
    document.getElementById(
        "studentsContainer"
    );

const message =
    document.getElementById(
        "message"
    );


// =========================================
// LOAD STUDENTS
// =========================================

async function loadStudents() {

    try {

        const response = await fetch(
            `${API_URL}/faculty/students`, {
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
                "Failed to load students"
            );

        }


        const students =
            data.data;


        // =====================================
        // TOTAL STUDENTS
        // =====================================

        totalStudents.textContent =
            students.length;


        studentsContainer.innerHTML =
            "";


        // =====================================
        // NO STUDENTS
        // =====================================

        if (students.length === 0) {

            studentsContainer.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No Students Found
                    </h3>

                    <p>
                        There are no students
                        in your department.
                    </p>

                </div>

            `;

            return;

        }


        // =====================================
        // STUDENT CARDS
        // =====================================

        students.forEach(student => {

            const card =
                document.createElement("div");


            card.className =
                "faculty-student-card";


            const resumeButton =
                student.resume ?
                `
                        <a
                            href="http://localhost:5000${student.resume}"
                            target="_blank"
                            class="student-action-btn"
                        >
                            📄 View Resume
                        </a>
                    ` :
                `
                        <span class="no-resume">
                            No Resume
                        </span>
                    `;


            card.innerHTML = `

                <div class="student-card-header">

                    <div>

                        <h3>
                            ${student.name}
                        </h3>

                        <p class="student-enrollment">
                            ${student.enrollment_no}
                        </p>

                    </div>

                    <span class="student-cgpa">
                        CGPA ${student.cgpa ?? "-"}
                    </span>

                </div>


                <div class="student-details">

                    <p>
                        📧
                        <strong>Email:</strong>
                        ${student.email}
                    </p>


                    <p>
                        📱
                        <strong>Phone:</strong>
                        ${student.phone || "Not available"}
                    </p>


                    <p>
                        🏫
                        <strong>Department:</strong>
                        ${student.department_name || "Not assigned"}
                    </p>


                    <p>
                        🎓
                        <strong>Semester:</strong>
                        ${student.semester || "Not assigned"}
                    </p>

                </div>


                <div class="student-actions">

                    ${resumeButton}

                </div>

            `;


            studentsContainer.appendChild(
                card
            );

        });


    } catch (error) {

        console.error(
            "Faculty Students Error:",
            error
        );


        studentsContainer.innerHTML =
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

loadStudents();